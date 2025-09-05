from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import Index 
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import requests
import json
import os
from typing import List, Dict, Optional
import logging
from dataclasses import dataclass
import sqlite3
from geopy.distance import geodesic
import numpy as np
from scipy.spatial import cKDTree
from scipy.interpolate import griddata
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///air_quality.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here'

# Initialize database
db = SQLAlchemy(app)

# Data models
class SensorReading(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    pm25 = db.Column(db.Float, nullable=False)
    pm10 = db.Column(db.Float, nullable=True)
    temperature = db.Column(db.Float, nullable=True)
    humidity = db.Column(db.Float, nullable=True)
    source = db.Column(db.String(100), nullable=False)
    location_name = db.Column(db.String(200), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    is_verified = db.Column(db.Boolean, default=False)

class UserReport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    air_quality_rating = db.Column(db.Integer, nullable=False)  # 1-5 scale
    visibility = db.Column(db.String(50), nullable=True)  # clear, hazy, poor
    smell_intensity = db.Column(db.Integer, nullable=True)  # 1-5 scale
    health_symptoms = db.Column(db.String(500), nullable=True)
    comments = db.Column(db.Text, nullable=True)
    user_id = db.Column(db.String(100), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    is_verified = db.Column(db.Boolean, default=False)


class AllergenReading(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    pollen_index = db.Column(db.Float, nullable=False)   # normalized 0-100
    pollen_type = db.Column(db.String(64), nullable=True)  # e.g., "tree", "grass", "weed"
    source = db.Column(db.String(100), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    is_verified = db.Column(db.Boolean, default=False)


class PollenForecast(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lat = db.Column(db.Float, nullable=False)
    lon = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)
    pollen_index = db.Column(db.Float, nullable=False)  # 0-100
    pollen_type = db.Column(db.String(64))
    model_version = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# spatial index helpers (for sqlite this is best-effort; Postgres/PostGIS recommended)
Index('idx_allergen_latlon', AllergenReading.latitude, AllergenReading.longitude)
Index('idx_pollen_latlon', PollenForecast.lat, PollenForecast.lon)

@dataclass
class AirQualityData:
    latitude: float
    longitude: float
    pm25: float
    pm10: Optional[float]
    aqi: int
    source: str
    timestamp: datetime
    location_name: Optional[str] = None

class OpenAQClient:
    """Client for OpenAQ API - open source air quality data"""
    BASE_URL = "https://api.openaq.org/v3"
    
    def __init__(self):
        self.session = requests.Session()
    
    def get_latest_measurements(self, country: str = "IN", limit: int = 1000) -> List[AirQualityData]:
        """Fetch latest air quality measurements for India"""
        try:
            url = f"{self.BASE_URL}/latest"
            params = {
                "country": country,
                "limit": limit,
                "parameter": "pm25"
            }
            
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            measurements = []
            
            for result in data.get("results", []):
                for measurement in result.get("measurements", []):
                    if measurement["parameter"] == "pm25" and measurement["value"] is not None:
                        measurements.append(AirQualityData(
                            latitude=result["coordinates"]["latitude"],
                            longitude=result["coordinates"]["longitude"],
                            pm25=measurement["value"],
                            pm10=None,
                            aqi=self.pm25_to_aqi(measurement["value"]),
                            source=f"OpenAQ - {result.get('location', 'Unknown')}",
                            timestamp=datetime.fromisoformat(measurement["date"]["utc"].replace("Z", "+00:00")),
                            location_name=result.get("location")
                        ))
            
            logger.info(f"Fetched {len(measurements)} measurements from OpenAQ")
            return measurements
            
        except Exception as e:
            logger.error(f"Error fetching OpenAQ data: {e}")
            return []
    
    @staticmethod
    def pm25_to_aqi(pm25: float) -> int:
        """Convert PM2.5 to AQI using US EPA formula"""
        if pm25 <= 12.0:
            return round((50 / 12.0) * pm25)
        elif pm25 <= 35.4:
            return round((99 - 51) / (35.4 - 12.1) * (pm25 - 12.1) + 51)
        elif pm25 <= 55.4:
            return round((149 - 101) / (55.4 - 35.5) * (pm25 - 35.5) + 101)
        elif pm25 <= 150.4:
            return round((199 - 151) / (150.4 - 55.5) * (pm25 - 55.5) + 151)
        elif pm25 <= 250.4:
            return round((299 - 201) / (250.4 - 150.5) * (pm25 - 150.5) + 201)
        else:
            return round((399 - 301) / (350.4 - 250.5) * (pm25 - 250.5) + 301)

class WAQIClient:
    """Client for World Air Quality Index API"""
    BASE_URL = "https://api.waqi.info"
    
    def __init__(self, api_token: str):
        self.api_token = api_token
        self.session = requests.Session()
    
    def get_city_data(self, city: str) -> Optional[AirQualityData]:
        """Fetch air quality data for a specific city"""
        try:
            url = f"{self.BASE_URL}/feed/{city}/"
            params = {"token": self.api_token}
            
            response = self.session.get(url, params=params, timeout=15)
            response.raise_for_status()
            
            data = response.json()
            
            if data["status"] == "ok":
                result = data["data"]
                
                return AirQualityData(
                    latitude=result["city"]["geo"][0],
                    longitude=result["city"]["geo"][1],
                    pm25=result["iaqi"].get("pm25", {}).get("v"),
                    pm10=result["iaqi"].get("pm10", {}).get("v"),
                    aqi=result["aqi"],
                    source=f"WAQI - {result['city']['name']}",
                    timestamp=datetime.fromisoformat(result["time"]["iso"]),
                    location_name=result["city"]["name"]
                )
                
        except Exception as e:
            logger.error(f"Error fetching WAQI data for {city}: {e}")
        
        return None
    
    def get_stations_by_bounds(self, lat_min: float, lng_min: float, 
                             lat_max: float, lng_max: float) -> List[AirQualityData]:
        """Fetch stations within geographic bounds"""
        try:
            url = f"{self.BASE_URL}/map/bounds"
            params = {
                "token": self.api_token,
                "latlng": f"{lat_min},{lng_min},{lat_max},{lng_max}"
            }
            
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            measurements = []
            
            if data["status"] == "ok":
                for station in data["data"]:
                    if station.get("lat") and station.get("lon") and station.get("aqi"):
                        measurements.append(AirQualityData(
                            latitude=float(station["lat"]),
                            longitude=float(station["lon"]),
                            pm25=None,  # WAQI doesn't provide PM2.5 directly in bounds API
                            pm10=None,
                            aqi=int(station["aqi"]),
                            source=f"WAQI - {station.get('station', {}).get('name', 'Unknown')}",
                            timestamp=datetime.utcnow(),
                            location_name=station.get("station", {}).get("name")
                        ))
            
            logger.info(f"Fetched {len(measurements)} stations from WAQI")
            return measurements
            
        except Exception as e:
            logger.error(f"Error fetching WAQI bounds data: {e}")
            return []

class DataAggregator:
    """Aggregates data from multiple sources"""
    
    def __init__(self):
        self.openaq_client = OpenAQClient()
        waqi_token = os.getenv("WAQI_API_TOKEN")
        self.waqi_client = WAQIClient(waqi_token) if waqi_token else None
        
    def fetch_all_data(self) -> List[AirQualityData]:
        """Fetch data from all available sources"""
        all_data = []
        
        # Fetch from OpenAQ
        openaq_data = self.openaq_client.get_latest_measurements()
        all_data.extend(openaq_data)
        
        # Fetch from WAQI if token is available
        if self.waqi_client:
            # Get data for major Indian cities
            major_cities = [
                "delhi", "mumbai", "bangalore", "hyderabad", "ahmedabad",
                "chennai", "kolkata", "surat", "pune", "jaipur", "lucknow",
                "kanpur", "nagpur", "indore", "thane", "bhopal", "visakhapatnam",
                "pimpri-chinchwad", "patna", "vadodara", "ghaziabad", "ludhiana",
                "agra", "nashik", "faridabad", "meerut", "rajkot"
            ]
            
            for city in major_cities:
                city_data = self.waqi_client.get_city_data(city)
                if city_data:
                    all_data.append(city_data)
                time.sleep(1)  # Rate limiting
        
        return all_data
    
    def store_sensor_data(self, data_list: List[AirQualityData]):
        """Store sensor data in database"""
        for data in data_list:
            sensor_reading = SensorReading(
                latitude=data.latitude,
                longitude=data.longitude,
                pm25=data.pm25,
                pm10=data.pm10,
                source=data.source,
                location_name=data.location_name,
                timestamp=data.timestamp,
                is_verified=True  # Data from APIs is considered verified
            )
            
            db.session.add(sensor_reading)
        
        try:
            db.session.commit()
            logger.info(f"Stored {len(data_list)} sensor readings")
        except Exception as e:
            logger.error(f"Error storing sensor data: {e}")
            db.session.rollback()

class HeatmapGenerator:
    """Generate interpolated heatmap data"""
    
    @staticmethod
    def generate_grid_data(sensor_data: List[Dict], bounds: Dict) -> List[Dict]:
        """Generate interpolated grid data for heatmap"""
        if not sensor_data:
            return []
        
        try:
            # Extract coordinates and values
            points = np.array([[d['latitude'], d['longitude']] for d in sensor_data])
            values = np.array([d.get('pm25', d.get('aqi', 50)) for d in sensor_data])
            
            # Create grid
            lat_range = np.arange(bounds['south'], bounds['north'], 0.1)
            lon_range = np.arange(bounds['west'], bounds['east'], 0.1)
            lat_grid, lon_grid = np.meshgrid(lat_range, lon_range)
            
            # Interpolate values
            grid_points = np.column_stack((lat_grid.ravel(), lon_grid.ravel()))
            interpolated_values = griddata(points, values, grid_points, method='linear', fill_value=50)
            
            # Convert to list of dictionaries
            grid_data = []
            for i, (lat, lon) in enumerate(grid_points):
                if not np.isnan(interpolated_values[i]):
                    grid_data.append({
                        'lat': float(lat),
                        'lon': float(lon),
                        'value': float(max(0, interpolated_values[i]))
                    })
            
            return grid_data
            
        except Exception as e:
            logger.error(f"Error generating grid data: {e}")
            return []

    @staticmethod
    def refine_with_local_observations(grid_data, observations, radius_km=20):
        # observations: list of dicts with lat, lon, pollen_index
        # For each grid point, find nearby observations and blend
        from geopy.distance import distance
        for g in grid_data:
            weights = []
            vals = []
            for o in observations:
                d = geodesic((g['lat'], g['lon']), (o['lat'], o['lon'])).km
                if d <= radius_km:
                    w = max(0.01, 1.0 - d / radius_km)
                    weights.append(w)
                    vals.append(o['pollen_index'])
            if weights:
                blended = sum(w*v for w,v in zip(weights, vals)) / sum(weights)
                # simple average with original
                g['value'] = (g['value'] + blended) / 2.0
        return grid_data
    

# Initialize data aggregator
data_aggregator = DataAggregator()
heatmap_generator = HeatmapGenerator()

# API Routes

@app.route('/api/allergen/forecast', methods=['GET'])
def allergen_forecast():
    """
    Return pollen forecast grid or nearest point for lat/lon.
    Query params:
      - lat, lon (optional): if given returns nearest forecast and advice
      - bounds: north,south,east,west to return grid
      - days: number of days ahead (default 3)
    """
    try:
        lat = request.args.get('lat', type=float)
        lon = request.args.get('lon', type=float)
        days = int(request.args.get('days', 3))
        # If lat/lon given, return nearest point forecast
        if lat is not None and lon is not None:
            # find nearest forecast row
            cutoff = datetime.utcnow().date()
            forecasts = PollenForecast.query.filter(
                PollenForecast.lat.between(lat-0.5, lat+0.5),
                PollenForecast.lon.between(lon-0.5, lon+0.5),
                PollenForecast.date >= cutoff
            ).order_by(PollenForecast.date).limit(days*3).all()
            data = [{
                'date': f.date.isoformat(),
                'pollen_index': f.pollen_index,
                'pollen_type': f.pollen_type,
                'model_version': f.model_version
            } for f in forecasts]
            return jsonify({'status': 'success', 'data': data})
        # Otherwise return grid for bounds
        north = float(request.args.get('north', 37))
        south = float(request.args.get('south', 8))
        east = float(request.args.get('east', 97))
        west = float(request.args.get('west', 68))
        results = PollenForecast.query.filter(
            PollenForecast.lat.between(south, north),
            PollenForecast.lon.between(west, east),
            PollenForecast.date >= datetime.utcnow().date()
        ).all()
        grid = [{'lat': r.lat, 'lon': r.lon, 'date': r.date.isoformat(), 'pollen_index': r.pollen_index} for r in results]
        return jsonify({'status': 'success', 'count': len(grid), 'data': grid})
    except Exception as e:
        logger.error(f"Error allergen forecast: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/models/retrain', methods=['POST'])
def retrain_models():
    """Manual retrain trigger. Should be protected in production."""
    try:
        from datetime import date
        # Kick off training function (synchronous here; or schedule background thread)
        train_allergen_model()
        return jsonify({'status': 'success', 'message': 'Retraining triggered'})
    except Exception as e:
        logger.error(f"Retrain failed: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/sensors', methods=['GET'])
def get_sensors():
    """Get all sensor data"""
    try:
        # Get recent sensor readings (last 24 hours)
        cutoff_time = datetime.utcnow() - timedelta(hours=24)
        readings = SensorReading.query.filter(
            SensorReading.timestamp >= cutoff_time
        ).all()
        
        sensor_data = []
        for reading in readings:
            sensor_data.append({
                'id': reading.id,
                'lat': reading.latitude,
                'lon': reading.longitude,
                'pm25': reading.pm25,
                'pm10': reading.pm10,
                'source': reading.source,
                'location_name': reading.location_name,
                'timestamp': reading.timestamp.isoformat(),
                'is_verified': reading.is_verified
            })
        
        return jsonify({
            'status': 'success',
            'count': len(sensor_data),
            'data': sensor_data
        })
        
    except Exception as e:
        logger.error(f"Error fetching sensors: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/heatmap', methods=['GET'])
def get_heatmap():
    """Get interpolated heatmap data"""
    try:
        # Get bounds from query parameters
        bounds = {
            'north': float(request.args.get('north', 37)),
            'south': float(request.args.get('south', 8)),
            'east': float(request.args.get('east', 97)),
            'west': float(request.args.get('west', 68))
        }
        
        # Get recent sensor readings
        cutoff_time = datetime.utcnow() - timedelta(hours=6)
        readings = SensorReading.query.filter(
            SensorReading.timestamp >= cutoff_time,
            SensorReading.latitude.between(bounds['south'], bounds['north']),
            SensorReading.longitude.between(bounds['west'], bounds['east'])
        ).all()
        
        # Convert to dict format
        sensor_data = []
        for reading in readings:
            sensor_data.append({
                'latitude': reading.latitude,
                'longitude': reading.longitude,
                'pm25': reading.pm25,
                'aqi': OpenAQClient.pm25_to_aqi(reading.pm25) if reading.pm25 else None
            })
        
        # Generate grid data
        grid_data = heatmap_generator.generate_grid_data(sensor_data, bounds)
        
        return jsonify({
            'status': 'success',
            'count': len(grid_data),
            'data': grid_data
        })
        
    except Exception as e:
        logger.error(f"Error generating heatmap: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/user-reports', methods=['POST'])
def submit_user_report():
    """Submit a user air quality report"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['latitude', 'longitude', 'air_quality_rating']
        for field in required_fields:
            if field not in data:
                return jsonify({'status': 'error', 'message': f'Missing field: {field}'}), 400
        
        # Create user report
        report = UserReport(
            latitude=float(data['latitude']),
            longitude=float(data['longitude']),
            air_quality_rating=int(data['air_quality_rating']),
            visibility=data.get('visibility'),
            smell_intensity=data.get('smell_intensity'),
            health_symptoms=data.get('health_symptoms'),
            comments=data.get('comments'),
            user_id=data.get('user_id')
        )
        
        db.session.add(report)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Report submitted successfully',
            'report_id': report.id
        })
        
    except Exception as e:
        logger.error(f"Error submitting user report: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/user-reports', methods=['GET'])
def get_user_reports():
    """Get user reports"""
    try:
        # Get recent reports (last 7 days)
        cutoff_time = datetime.utcnow() - timedelta(days=7)
        reports = UserReport.query.filter(
            UserReport.timestamp >= cutoff_time
        ).all()
        
        report_data = []
        for report in reports:
            report_data.append({
                'id': report.id,
                'lat': report.latitude,
                'lon': report.longitude,
                'air_quality_rating': report.air_quality_rating,
                'visibility': report.visibility,
                'smell_intensity': report.smell_intensity,
                'health_symptoms': report.health_symptoms,
                'comments': report.comments,
                'timestamp': report.timestamp.isoformat(),
                'is_verified': report.is_verified
            })
        
        return jsonify({
            'status': 'success',
            'count': len(report_data),
            'data': report_data
        })
        
    except Exception as e:
        logger.error(f"Error fetching user reports: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/refresh-data', methods=['POST'])
def refresh_data():
    """Manually refresh data from external sources"""
    try:
        # Fetch fresh data
        fresh_data = data_aggregator.fetch_all_data()
        
        # Store in database
        data_aggregator.store_sensor_data(fresh_data)
        
        return jsonify({
            'status': 'success',
            'message': f'Refreshed {len(fresh_data)} data points'
        })
        
    except Exception as e:
        logger.error(f"Error refreshing data: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'database': 'connected'
    })

def create_tables():
    """Create database tables"""
    with app.app_context():
        db.create_all()
        logger.info("Database tables created")

def scheduled_data_fetch():
    """Function to periodically fetch data (can be called by a scheduler)"""
    with app.app_context():
        try:
            fresh_data = data_aggregator.fetch_all_data()
            data_aggregator.store_sensor_data(fresh_data)
            logger.info(f"Scheduled fetch completed: {len(fresh_data)} data points")
        except Exception as e:
            logger.error(f"Error in scheduled data fetch: {e}")

if __name__ == '__main__':
    # Create tables
    create_tables()
    
    # Initial data fetch
    try:
        with app.app_context():
            scheduled_data_fetch()
    except Exception as e:
        logger.error(f"Initial data fetch failed: {e}")
    
    # Start the Flask application
    app.run(debug=True, host='0.0.0.0', port=8000)