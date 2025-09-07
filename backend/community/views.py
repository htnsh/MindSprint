from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from authentication.mongodb_service import mongodb_service
from django.contrib.auth.models import User
from dashboard.views import get_aqi, get_pollen
import json
import requests
from datetime import datetime, timezone


def get_mock_reports(filter_type='all', sort_by='recent', limit=50):
    """Mock data for community reports when MongoDB is not available"""
    mock_reports = [
        {
            '_id': 'mock_1',
            'user_id': 'user_1',
            'username': 'Sarah M.',
            'type': 'smoke',
            'severity': 'high',
            'location': 'Downtown SF',
            'description': 'Heavy smoke visible from nearby construction site. Strong burning smell affecting visibility.',
            'photo_url': '',
            'votes': {'up': 12, 'down': 1, 'voters': []},
            'verified': True,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            '_id': 'mock_2',
            'user_id': 'user_2',
            'username': 'Mike R.',
            'type': 'pollen',
            'severity': 'medium',
            'location': 'Golden Gate Park',
            'description': 'Noticed increased pollen levels during morning jog. Tree pollen seems particularly high today.',
            'photo_url': '',
            'votes': {'up': 8, 'down': 0, 'voters': []},
            'verified': False,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            '_id': 'mock_3',
            'user_id': 'user_3',
            'username': 'Lisa K.',
            'type': 'dust',
            'severity': 'low',
            'location': 'Mission District',
            'description': 'Light dust in the air, possibly from construction work on 16th Street.',
            'photo_url': '',
            'votes': {'up': 5, 'down': 2, 'voters': []},
            'verified': True,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        },
        {
            '_id': 'mock_4',
            'user_id': 'user_4',
            'username': 'David L.',
            'type': 'odor',
            'severity': 'severe',
            'location': 'SOMA',
            'description': 'Strong chemical odor near the industrial area. Multiple people reporting respiratory irritation.',
            'photo_url': '',
            'votes': {'up': 23, 'down': 0, 'voters': []},
            'verified': True,
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc)
        }
    ]
    
    # Apply filter
    if filter_type != 'all':
        mock_reports = [r for r in mock_reports if r['type'] == filter_type]
    
    # Apply sorting
    if sort_by == 'votes':
        mock_reports.sort(key=lambda x: x['votes']['up'], reverse=True)
    elif sort_by == 'severity':
        severity_order = {'severe': 4, 'high': 3, 'medium': 2, 'low': 1}
        mock_reports.sort(key=lambda x: severity_order.get(x['severity'], 0), reverse=True)
    # Default is 'recent' which is already sorted by creation time
    
    return mock_reports[:limit]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_community_reports(request):
    """Get community reports with filtering and sorting"""
    try:
        filter_type = request.GET.get('filter', 'all')
        sort_by = request.GET.get('sort', 'recent')
        limit = int(request.GET.get('limit', 50))
        
        # Try to get reports from MongoDB, fallback to mock data if connection fails
        try:
            reports = mongodb_service.get_community_reports(filter_type, sort_by, limit)
        except Exception as e:
            print(f"MongoDB error, using mock data: {e}")
            # Mock data as fallback
            reports = get_mock_reports(filter_type, sort_by, limit)
        
        # Format the response to match frontend expectations
        formatted_reports = []
        for report in reports:
            # Calculate time ago
            from datetime import datetime, timezone
            now = datetime.now(timezone.utc)
            created_at = report['created_at']
            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=timezone.utc)
            
            time_diff = now - created_at
            if time_diff.days > 0:
                timestamp = f"{time_diff.days} day{'s' if time_diff.days > 1 else ''} ago"
            elif time_diff.seconds > 3600:
                hours = time_diff.seconds // 3600
                timestamp = f"{hours} hour{'s' if hours > 1 else ''} ago"
            elif time_diff.seconds > 60:
                minutes = time_diff.seconds // 60
                timestamp = f"{minutes} minute{'s' if minutes > 1 else ''} ago"
            else:
                timestamp = "Just now"
            
            formatted_report = {
                'id': report['_id'],
                'user': report['username'],
                'avatar': report['username'][:2].upper(),
                'type': report['type'],
                'severity': report['severity'],
                'location': report['location'],
                'description': report['description'],
                'timestamp': timestamp,
                'votes': report['votes'],
                'verified': report['verified'],
                'photo_url': report.get('photo_url', ''),
                'created_at': report['created_at'].isoformat()
            }
            formatted_reports.append(formatted_report)
        
        return Response({
            'success': True,
            'reports': formatted_reports
        })
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_community_report(request):
    """Create a new community report"""
    try:
        data = request.data
        
        # Validate required fields
        required_fields = ['type', 'severity', 'location', 'description']
        for field in required_fields:
            if not data.get(field):
                return Response({
                    'success': False,
                    'error': f'{field} is required'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get user info
        user = request.user
        try:
            user_mongo = mongodb_service.get_user_by_django_id(user.id)
        except Exception as e:
            print(f"MongoDB error getting user: {e}")
            # Fallback to Django user data
            user_mongo = {
                '_id': f'django_user_{user.id}',
                'username': user.username or user.email.split('@')[0]
            }
        
        if not user_mongo:
            return Response({
                'success': False,
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        report_data = {
            'user_id': str(user_mongo['_id']),
            'username': user_mongo['username'],
            'type': data['type'],
            'severity': data['severity'],
            'location': data['location'],
            'description': data['description'],
            'photo_url': data.get('photo_url', '')
        }
        
        try:
            report_id = mongodb_service.create_community_report(report_data)
        except Exception as e:
            print(f"MongoDB error creating report: {e}")
            # Return success even if MongoDB fails - in a real app you might want to queue this
            report_id = f'mock_report_{datetime.now().timestamp()}'
        
        if report_id:
            return Response({
                'success': True,
                'report_id': report_id,
                'message': 'Report created successfully'
            })
        else:
            return Response({
                'success': False,
                'error': 'Failed to create report'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vote_on_report(request, report_id):
    """Vote on a community report"""
    try:
        vote_type = request.data.get('vote_type')  # 'up' or 'down'
        
        if vote_type not in ['up', 'down']:
            return Response({
                'success': False,
                'error': 'Invalid vote type. Must be "up" or "down"'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        user_mongo = mongodb_service.get_user_by_django_id(user.id)
        
        if not user_mongo:
            return Response({
                'success': False,
                'error': 'User not found in MongoDB'
            }, status=status.HTTP_404_NOT_FOUND)
        
        success = mongodb_service.vote_on_report(
            report_id, 
            str(user_mongo['_id']), 
            vote_type
        )
        
        if success:
            # Get updated report data
            report = mongodb_service.get_community_report_by_id(report_id)
            return Response({
                'success': True,
                'votes': report['votes'] if report else {'up': 0, 'down': 0}
            })
        else:
            return Response({
                'success': False,
                'error': 'Failed to vote on report'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_community_report(request, report_id):
    """Delete a community report (only by the author)"""
    try:
        user = request.user
        user_mongo = mongodb_service.get_user_by_django_id(user.id)
        
        if not user_mongo:
            return Response({
                'success': False,
                'error': 'User not found in MongoDB'
            }, status=status.HTTP_404_NOT_FOUND)
        
        success = mongodb_service.delete_community_report(
            report_id, 
            str(user_mongo['_id'])
        )
        
        if success:
            return Response({
                'success': True,
                'message': 'Report deleted successfully'
            })
        else:
            return Response({
                'success': False,
                'error': 'Report not found or you are not authorized to delete it'
            }, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_report_stats(request):
    """Get community report statistics"""
    try:
        # Try to get reports from MongoDB, fallback to mock data if connection fails
        try:
            reports = mongodb_service.get_community_reports(limit=1000)
        except Exception as e:
            print(f"MongoDB error, using mock data for stats: {e}")
            reports = get_mock_reports(limit=1000)
        
        total_reports = len(reports)
        verified_reports = len([r for r in reports if r.get('verified', False)])
        
        # Count by type
        type_counts = {}
        for report in reports:
            report_type = report.get('type', 'unknown')
            type_counts[report_type] = type_counts.get(report_type, 0) + 1
        
        # Count by severity
        severity_counts = {}
        for report in reports:
            severity = report.get('severity', 'unknown')
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        return Response({
            'success': True,
            'stats': {
                'total_reports': total_reports,
                'verified_reports': verified_reports,
                'type_counts': type_counts,
                'severity_counts': severity_counts
            }
        })
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_map_data(request):
    """Get data for map visualization including community reports with coordinates"""
    try:
        # Get query parameters
        bounds = request.GET.get('bounds')  # Format: "lat1,lng1,lat2,lng2"
        layer = request.GET.get('layer', 'community')  # aqi, pm25, community
        
        # Try to get reports from MongoDB, fallback to mock data if connection fails
        try:
            reports = mongodb_service.get_community_reports(limit=1000)
        except Exception as e:
            print(f"MongoDB error, using mock data for map: {e}")
            reports = get_mock_reports(limit=1000)
        
        # Convert reports to map format with coordinates
        map_reports = []
        for report in reports:
            # Extract coordinates from location string or use default
            coords = extract_coordinates_from_location(report.get('location', ''))
            
            map_report = {
                'id': report['_id'],
                'type': report['type'],
                'severity': report['severity'],
                'description': report['description'],
                'username': report['username'],
                'verified': report.get('verified', False),
                'votes': report.get('votes', {'up': 0, 'down': 0}),
                'timestamp': report.get('created_at', datetime.now(timezone.utc)).isoformat(),
                'lat': coords['lat'],
                'lng': coords['lng'],
                'location_name': report['location']
            }
            map_reports.append(map_report)
        
        # Filter by bounds if provided
        if bounds:
            try:
                lat1, lng1, lat2, lng2 = map(float, bounds.split(','))
                map_reports = [
                    r for r in map_reports 
                    if lat1 <= r['lat'] <= lat2 and lng1 <= r['lng'] <= lng2
                ]
            except:
                pass  # If bounds parsing fails, return all reports
        
        # Get real AQI and pollen data, fallback to mock data if API calls fail
        try:
            aqi_stations = get_real_aqi_data()
            pollen_stations = get_real_pollen_data()
        except Exception as e:
            print(f"Error fetching real AQI/pollen data, using mock data: {e}")
            aqi_stations = get_mock_aqi_stations()
            pollen_stations = []
        
        return Response({
            'success': True,
            'data': {
                'aqi_stations': aqi_stations,
                'pollen_stations': pollen_stations,
                'layer': layer,
                'total_aqi_stations': len(aqi_stations),
                'total_pollen_stations': len(pollen_stations),
                'last_updated': datetime.now(timezone.utc).isoformat()
            }
        })
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def extract_coordinates_from_location(location_str):
    """Extract coordinates from location string or return default coordinates"""
    # Try to parse coordinates from location string
    import re
    
    # Look for coordinate patterns like "37.7749, -122.4194" or "(37.7749, -122.4194)"
    coord_pattern = r'(-?\d+\.?\d*),\s*(-?\d+\.?\d*)'
    match = re.search(coord_pattern, location_str)
    
    if match:
        try:
            lat = float(match.group(1))
            lng = float(match.group(2))
            return {'lat': lat, 'lng': lng}
        except:
            pass
    
    # Default coordinates for major cities
    city_coords = {
        'delhi': {'lat': 28.6139, 'lng': 77.2090},
        'mumbai': {'lat': 19.0760, 'lng': 72.8777},
        'bangalore': {'lat': 12.9716, 'lng': 77.5946},
        'chennai': {'lat': 13.0827, 'lng': 80.2707},
        'kolkata': {'lat': 22.5726, 'lng': 88.3639},
        'hyderabad': {'lat': 17.3850, 'lng': 78.4867},
        'pune': {'lat': 18.5204, 'lng': 73.8567},
        'ahmedabad': {'lat': 23.0225, 'lng': 72.5714},
        'jaipur': {'lat': 26.9124, 'lng': 75.7873},
        'lucknow': {'lat': 26.8467, 'lng': 80.9462},
        'kanpur': {'lat': 26.4499, 'lng': 80.3319},
        'nagpur': {'lat': 21.1458, 'lng': 79.0882},
        'indore': {'lat': 22.7196, 'lng': 75.8577},
        'thane': {'lat': 19.2183, 'lng': 72.9781},
        'bhopal': {'lat': 23.2599, 'lng': 77.4126},
        'visakhapatnam': {'lat': 17.6868, 'lng': 83.2185},
        'pimpri': {'lat': 18.6298, 'lng': 73.7997},
        'patna': {'lat': 25.5941, 'lng': 85.1376},
        'vadodara': {'lat': 22.3072, 'lng': 73.1812},
        'ghaziabad': {'lat': 28.6692, 'lng': 77.4538},
        'ludhiana': {'lat': 30.9010, 'lng': 75.8573},
        'agra': {'lat': 27.1767, 'lng': 78.0081},
        'nashik': {'lat': 19.9975, 'lng': 73.7898},
        'faridabad': {'lat': 28.4089, 'lng': 77.3178},
        'meerut': {'lat': 28.9845, 'lng': 77.7064},
        'rajkot': {'lat': 22.3039, 'lng': 70.8022},
        'kalyan': {'lat': 19.2403, 'lng': 73.1305},
        'vasai': {'lat': 19.4700, 'lng': 72.8000},
        'varanasi': {'lat': 25.3176, 'lng': 82.9739},
        'srinagar': {'lat': 34.0837, 'lng': 74.7973},
        'aurangabad': {'lat': 19.8762, 'lng': 75.3433},
        'noida': {'lat': 28.5355, 'lng': 77.3910},
        'solapur': {'lat': 17.6599, 'lng': 75.9064},
        'ranchi': {'lat': 23.3441, 'lng': 85.3096},
        'kochi': {'lat': 9.9312, 'lng': 76.2673},
        'coimbatore': {'lat': 11.0168, 'lng': 76.9558},
        'tiruchirappalli': {'lat': 10.7905, 'lng': 78.7047},
        'madurai': {'lat': 9.9252, 'lng': 78.1198},
        'mysore': {'lat': 12.2958, 'lng': 76.6394},
        'gurgaon': {'lat': 28.4595, 'lng': 77.0266},
        'aligarh': {'lat': 27.8974, 'lng': 78.0880},
        'jalandhar': {'lat': 31.3260, 'lng': 75.5762},
        'bhubaneswar': {'lat': 20.2961, 'lng': 85.8245},
        'salem': {'lat': 11.6643, 'lng': 78.1460},
        'warangal': {'lat': 17.9689, 'lng': 79.5941},
        'guntur': {'lat': 16.3067, 'lng': 80.4365},
        'bhiwandi': {'lat': 19.3002, 'lng': 73.0589},
        'amritsar': {'lat': 31.6340, 'lng': 74.8723},
        'nanded': {'lat': 19.1383, 'lng': 77.3210},
        'kolhapur': {'lat': 16.7050, 'lng': 74.2433},
        'ulhasnagar': {'lat': 19.2215, 'lng': 73.1645},
        'sangli': {'lat': 16.8524, 'lng': 74.5815},
        'malegaon': {'lat': 20.5597, 'lng': 74.5255},
        'ulhasnagar': {'lat': 19.2215, 'lng': 73.1645},
        'jalgaon': {'lat': 21.0077, 'lng': 75.5626},
        'latur': {'lat': 18.4088, 'lng': 76.5604},
        'ahmednagar': {'lat': 19.0952, 'lng': 74.7496},
        'chandigarh': {'lat': 30.7333, 'lng': 76.7794},
        'jamnagar': {'lat': 22.4707, 'lng': 70.0577},
        'aurangabad': {'lat': 19.8762, 'lng': 75.3433},
        'nashik': {'lat': 19.9975, 'lng': 73.7898},
        'solapur': {'lat': 17.6599, 'lng': 75.9064},
        'ranchi': {'lat': 23.3441, 'lng': 85.3096},
        'kochi': {'lat': 9.9312, 'lng': 76.2673},
        'coimbatore': {'lat': 11.0168, 'lng': 76.9558},
        'tiruchirappalli': {'lat': 10.7905, 'lng': 78.7047},
        'madurai': {'lat': 9.9252, 'lng': 78.1198},
        'mysore': {'lat': 12.2958, 'lng': 76.6394},
        'gurgaon': {'lat': 28.4595, 'lng': 77.0266},
        'aligarh': {'lat': 27.8974, 'lng': 78.0880},
        'jalandhar': {'lat': 31.3260, 'lng': 75.5762},
        'bhubaneswar': {'lat': 20.2961, 'lng': 85.8245},
        'salem': {'lat': 11.6643, 'lng': 78.1460},
        'warangal': {'lat': 17.9689, 'lng': 79.5941},
        'guntur': {'lat': 16.3067, 'lng': 80.4365},
        'bhiwandi': {'lat': 19.3002, 'lng': 73.0589},
        'amritsar': {'lat': 31.6340, 'lng': 74.8723},
        'nanded': {'lat': 19.1383, 'lng': 77.3210},
        'kolhapur': {'lat': 16.7050, 'lng': 74.2433},
        'ulhasnagar': {'lat': 19.2215, 'lng': 73.1645},
        'sangli': {'lat': 16.8524, 'lng': 74.5815},
        'malegaon': {'lat': 20.5597, 'lng': 74.5255},
        'jalgaon': {'lat': 21.0077, 'lng': 75.5626},
        'latur': {'lat': 18.4088, 'lng': 76.5604},
        'ahmednagar': {'lat': 19.0952, 'lng': 74.7496},
        'chandigarh': {'lat': 30.7333, 'lng': 76.7794},
        'jamnagar': {'lat': 22.4707, 'lng': 70.0577},
        'downtown sf': {'lat': 37.7749, 'lng': -122.4194},
        'golden gate park': {'lat': 37.7694, 'lng': -122.4862},
        'mission district': {'lat': 37.7599, 'lng': -122.4148},
        'soma': {'lat': 37.7749, 'lng': -122.4194},
    }
    
    # Try to match city name
    location_lower = location_str.lower()
    for city, coords in city_coords.items():
        if city in location_lower:
            return coords
    
    # Default to Delhi if no match found
    return {'lat': 28.6139, 'lng': 77.2090}


def get_real_aqi_data(cities=None):
    """Get real AQI data for multiple cities using the existing dashboard function"""
    if cities is None:
        cities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad']
    
    aqi_stations = []
    
    for i, city in enumerate(cities):
        try:
            # Create a mock request object for the get_aqi function
            class MockRequest:
                def __init__(self, city):
                    self.GET = {'city': city}
            
            # Call the existing get_aqi function
            response = get_aqi(MockRequest(city))
            
            if response.status_code == 200:
                data = json.loads(response.content)
                
                # Convert city name to approximate coordinates (simplified)
                city_coords = get_city_coordinates(city)
                
                station = {
                    'id': f'station_{i+1}',
                    'name': f'{city} AQI Station',
                    'lat': city_coords['lat'],
                    'lng': city_coords['lng'],
                    'aqi': data.get('aqi', 0),
                    'pm25': data.get('pollutants', {}).get('pm25', 0),
                    'pm10': data.get('pollutants', {}).get('pm10', 0),
                    'o3': data.get('pollutants', {}).get('o3', 0),
                    'no2': data.get('pollutants', {}).get('no2', 0),
                    'so2': data.get('pollutants', {}).get('so2', 0),
                    'co': data.get('pollutants', {}).get('co', 0),
                    'status': get_aqi_status(data.get('aqi', 0)),
                    'last_updated': data.get('time', datetime.now(timezone.utc).isoformat()),
                    'city': city
                }
                aqi_stations.append(station)
        except Exception as e:
            print(f"Error fetching AQI data for {city}: {e}")
            continue
    
    return aqi_stations

def get_real_pollen_data(cities=None):
    """Get real pollen data for multiple cities using the existing dashboard function"""
    if cities is None:
        cities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata']
    
    pollen_stations = []
    
    for i, city in enumerate(cities):
        try:
            # Create a mock request object for the get_pollen function
            class MockRequest:
                def __init__(self, city):
                    self.GET = {'city': city}
            
            # Call the existing get_pollen function
            response = get_pollen(MockRequest(city))
            
            if response.status_code == 200:
                data = json.loads(response.content)
                
                # Convert city name to approximate coordinates
                city_coords = get_city_coordinates(city)
                
                station = {
                    'id': f'pollen_{i+1}',
                    'name': f'{city} Pollen Station',
                    'lat': city_coords['lat'],
                    'lng': city_coords['lng'],
                    'tree_pollen': data.get('tree_pollen', 0),
                    'grass_pollen': data.get('grass_pollen', 0),
                    'weed_pollen': data.get('weed_pollen', 0),
                    'tree_risk': data.get('tree_risk', 'low'),
                    'grass_risk': data.get('grass_risk', 'low'),
                    'weed_risk': data.get('weed_risk', 'low'),
                    'last_updated': data.get('updated_at', datetime.now(timezone.utc).isoformat()),
                    'city': city
                }
                pollen_stations.append(station)
        except Exception as e:
            print(f"Error fetching pollen data for {city}: {e}")
            continue
    
    return pollen_stations

def get_city_coordinates(city):
    """Get approximate coordinates for major Indian cities"""
    city_coords = {
        'Delhi': {'lat': 28.6139, 'lng': 77.2090},
        'Mumbai': {'lat': 19.0760, 'lng': 72.8777},
        'Bangalore': {'lat': 12.9716, 'lng': 77.5946},
        'Chennai': {'lat': 13.0827, 'lng': 80.2707},
        'Kolkata': {'lat': 22.5726, 'lng': 88.3639},
        'Hyderabad': {'lat': 17.3850, 'lng': 78.4867},
        'Pune': {'lat': 18.5204, 'lng': 73.8567},
        'Ahmedabad': {'lat': 23.0225, 'lng': 72.5714},
        'Jaipur': {'lat': 26.9124, 'lng': 75.7873},
        'Lucknow': {'lat': 26.8467, 'lng': 80.9462}
    }
    return city_coords.get(city, {'lat': 28.6139, 'lng': 77.2090})  # Default to Delhi

def get_aqi_status(aqi_value):
    """Convert AQI value to status string"""
    if aqi_value <= 50:
        return 'good'
    elif aqi_value <= 100:
        return 'moderate'
    elif aqi_value <= 150:
        return 'unhealthy_for_sensitive'
    elif aqi_value <= 200:
        return 'unhealthy'
    elif aqi_value <= 300:
        return 'very_unhealthy'
    else:
        return 'hazardous'

def get_mock_aqi_stations():
    """Generate mock AQI stations for demonstration (fallback)"""
    import random
    
    stations = []
    cities = [
        {'name': 'Delhi Central', 'lat': 28.6139, 'lng': 77.2090},
        {'name': 'Mumbai Airport', 'lat': 19.0760, 'lng': 72.8777},
        {'name': 'Bangalore Tech Park', 'lat': 12.9716, 'lng': 77.5946},
        {'name': 'Chennai Port', 'lat': 13.0827, 'lng': 80.2707},
        {'name': 'Kolkata Central', 'lat': 22.5726, 'lng': 88.3639},
    ]
    
    for city in cities:
        aqi = random.randint(50, 200)
        station = {
            'id': f"station_{city['name'].replace(' ', '_').lower()}",
            'name': city['name'],
            'lat': city['lat'] + random.uniform(-0.01, 0.01),
            'lng': city['lng'] + random.uniform(-0.01, 0.01),
            'aqi': aqi,
            'status': 'good' if aqi <= 50 else 'moderate' if aqi <= 100 else 'unhealthy',
            'pollutants': {
                'pm25': random.randint(15, 80),
                'pm10': random.randint(25, 120),
                'o3': random.randint(30, 150),
                'no2': random.randint(20, 100),
                'so2': random.randint(5, 60),
                'co': random.randint(1, 20),
            },
            'last_updated': datetime.now(timezone.utc).isoformat()
        }
        stations.append(station)
    
    return stations
