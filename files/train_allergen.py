# train_allergen.py
import os
import pickle
from datetime import datetime, timedelta, date
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from main import db, SensorReading, AllergenReading, PollenForecast, app, OpenAQClient
import joblib
import logging

logger = logging.getLogger(__name__)

MODEL_PATH = os.environ.get('ALLERGEN_MODEL_PATH', 'models/allergen_rf.pkl')

def load_training_data(days_back=365):
    """
    Build training dataframe from AllergenReading (if available) and sensor/weather features.
    If no AllergenReading labels exist, build weak-labels from seasonality+user reports.
    """
    cutoff = datetime.utcnow() - timedelta(days=days_back)
    # Fetch sensor readings
    sensors = SensorReading.query.filter(SensorReading.timestamp >= cutoff).all()
    df_sensors = pd.DataFrame([{
        'lat': s.latitude, 'lon': s.longitude,
        'pm25': s.pm25 or np.nan,
        'pm10': s.pm10 or np.nan,
        'timestamp': s.timestamp,
    } for s in sensors])
    # fetch allergen readings (labels)
    allergen_rows = AllergenReading.query.filter(AllergenReading.timestamp >= cutoff).all()
    if allergen_rows:
        df_labels = pd.DataFrame([{
            'lat': a.latitude, 'lon': a.longitude,
            'pollen_index': a.pollen_index,
            'timestamp': a.timestamp
        } for a in allergen_rows])
    else:
        df_labels = pd.DataFrame()
    # merge sensors + labels by nearest timestamp and location (here we do join on rounded lat/lon & date)
    if df_labels.empty:
        # create weak labels: seasonality + PM2.5 proxy + user reports (not implemented: fallback to seasonal baseline)
        # For now, create dataset by sampling sensor points and computing a seasonal proxy:
        df = df_sensors.copy()
        df = df.dropna(subset=['pm25']).reset_index(drop=True)
        df['dayofyear'] = df['timestamp'].dt.dayofyear
        df['pollen_index'] = (20 + 30*np.sin(2*np.pi*(df['dayofyear']/365.0)) + 0.05*df['pm25']).clip(0,100)
        df = df.rename(columns={'timestamp':'ts'})
        return df
    else:
        # naive spatial-temporal join
        df = pd.merge_asof(df_sensors.sort_values('timestamp'),
                           df_labels.sort_values('timestamp'),
                           left_on='timestamp', right_on='timestamp', direction='nearest', tolerance=pd.Timedelta('6h'))
        df = df.dropna(subset=['pollen_index'])
        df['dayofyear'] = df['timestamp'].dt.dayofyear
        return df

def featurize(df):
    X = pd.DataFrame()
    X['lat'] = df['lat']
    X['lon'] = df['lon']
    X['pm25'] = df['pm25'].fillna(df['pm25'].median())
    X['pm10'] = df.get('pm10', pd.Series()).fillna(df['pm25'].median())
    X['dayofyear_sin'] = np.sin(2*np.pi*df['dayofyear']/365.0)
    X['dayofyear_cos'] = np.cos(2*np.pi*df['dayofyear']/365.0)
    # If timestamps present, add hour sin/cos
    if 'timestamp' in df.columns or 'ts' in df.columns:
        ts_col = 'timestamp' if 'timestamp' in df.columns else 'ts'
        hours = df[ts_col].dt.hour
        X['hour_sin'] = np.sin(2*np.pi*hours/24.0)
        X['hour_cos'] = np.cos(2*np.pi*hours/24.0)
    return X

def train_and_persist():
    with app.app_context():
        df = load_training_data()
        if df.empty:
            logger.error("No training data found")
            return
        X = featurize(df)
        y = df['pollen_index']
        model = RandomForestRegressor(n_estimators=100, n_jobs=-1, random_state=42)
        model.fit(X.values, y.values)
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        joblib.dump({'model': model}, MODEL_PATH)
        logger.info(f"Saved allergen model to {MODEL_PATH}")
        # produce short term forecast for next 3 days for grid of sensors
        produce_forecast(model)
        return model

def produce_forecast(model, days=3, grid_step=0.25):
    # Build prediction grid from INDIA_BOUNDS (from config or default)
    from config import Config
    bounds = Config.INDIA_BOUNDS
    lats = np.arange(bounds['south'], bounds['north'], grid_step)
    lons = np.arange(bounds['west'], bounds['east'], grid_step)
    today = datetime.utcnow().date()
    preds = []
    for d in range(days):
        target_date = today + timedelta(days=d)
        dayofyear = target_date.timetuple().tm_yday
        for lat in lats:
            for lon in lons:
                X = pd.DataFrame([{
                    'lat': lat,
                    'lon': lon,
                    'pm25': 50,  # baseline — in production use forecasted PM2.5 from dispersion model
                    'pm10': 50,
                    'dayofyear_sin': np.sin(2*np.pi*dayofyear/365.0),
                    'dayofyear_cos': np.cos(2*np.pi*dayofyear/365.0),
                    'hour_sin': 0.0, 'hour_cos': 1.0
                }])
                val = model.predict(X.values)[0]
                preds.append({'lat': float(lat), 'lon': float(lon), 'date': target_date, 'val': float(max(0, min(100, val)))})
    # persist top-level forecasts (coarse)
    # Delete existing forecasts for date range
    for p in preds:
        pf = PollenForecast(lat=p['lat'], lon=p['lon'], date=p['date'], pollen_index=p['val'], pollen_type='general', model_version='v1')
        db.session.add(pf)
    db.session.commit()
    logger.info(f"Produced {len(preds)} pollen forecast points")
