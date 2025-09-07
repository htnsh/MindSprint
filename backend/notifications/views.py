from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import json
from .models import Notification, NotificationPreference
from .serializers import NotificationSerializer, NotificationPreferenceSerializer
from dashboard.views import get_aqi, get_pollen


def get_or_create_mock_user():
    """Get or create a mock user for notifications"""
    user, created = User.objects.get_or_create(
        username='demo_user',
        defaults={'email': 'demo@example.com', 'first_name': 'Demo', 'last_name': 'User'}
    )
    return user

@api_view(['GET'])
@permission_classes([AllowAny])
def get_notifications(request):
    """Get all notifications for the demo user"""
    try:
        user = get_or_create_mock_user()
        notifications = Notification.objects.filter(user=user)
        serializer = NotificationSerializer(notifications, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'unread_count': notifications.filter(read=False).count()
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def mark_notification_read(request, notification_id):
    """Mark a specific notification as read"""
    try:
        user = get_or_create_mock_user()
        notification = Notification.objects.get(id=notification_id, user=user)
        notification.read = True
        notification.save()
        return Response({'success': True, 'message': 'Notification marked as read'})
    except Notification.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Notification not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def mark_all_notifications_read(request):
    """Mark all notifications as read for the demo user"""
    try:
        user = get_or_create_mock_user()
        Notification.objects.filter(user=user, read=False).update(read=True)
        return Response({'success': True, 'message': 'All notifications marked as read'})
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def notification_preferences(request):
    """Get or update notification preferences"""
    try:
        user = get_or_create_mock_user()
        if request.method == 'GET':
            preferences, created = NotificationPreference.objects.get_or_create(user=user)
            serializer = NotificationPreferenceSerializer(preferences)
            return Response({
                'success': True,
                'data': serializer.data
            })
        
        elif request.method == 'POST':
            preferences, created = NotificationPreference.objects.get_or_create(user=user)
            serializer = NotificationPreferenceSerializer(preferences, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Preferences updated successfully',
                    'data': serializer.data
                })
            else:
                return Response({
                    'success': False,
                    'error': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def generate_air_quality_alert(request):
    """Generate air quality alert based on current AQI data"""
    try:
        location = request.data.get('location', 'Delhi')
        user = get_or_create_mock_user()
        
        # Get AQI data
        aqi_response = get_aqi(request, location)
        if aqi_response.status_code == 200:
            aqi_data = json.loads(aqi_response.content)
            aqi_value = aqi_data.get('aqi', 0)
            
            # Determine alert level and message
            if aqi_value >= 151:
                priority = 'urgent'
                title = "Unhealthy Air Quality Alert"
                message = f"AQI has reached {aqi_value} (Unhealthy) in {location}. Avoid outdoor activities and consider wearing a mask."
            elif aqi_value >= 101:
                priority = 'high'
                title = "Air Quality Alert"
                message = f"AQI has reached {aqi_value} (Unhealthy for Sensitive Groups) in {location}. Consider limiting outdoor activities."
            elif aqi_value >= 51:
                priority = 'medium'
                title = "Moderate Air Quality"
                message = f"AQI is {aqi_value} (Moderate) in {location}. Sensitive individuals may experience minor breathing discomfort."
            else:
                priority = 'low'
                title = "Good Air Quality"
                message = f"AQI is {aqi_value} (Good) in {location}. Perfect time for outdoor activities!"
            
            # Create notification
            notification = Notification.objects.create(
                user=user,
                title=title,
                message=message,
                notification_type='air_quality',
                priority=priority,
                data={'aqi': aqi_value, 'location': location, 'pollutants': aqi_data.get('pollutants', {})}
            )
            
            return Response({
                'success': True,
                'message': 'Air quality alert generated',
                'notification': NotificationSerializer(notification).data
            })
        else:
            return Response({
                'success': False,
                'error': 'Failed to fetch AQI data'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def generate_daily_summary(request):
    """Generate daily air quality summary"""
    try:
        location = request.data.get('location', 'Delhi')
        user = get_or_create_mock_user()
        
        # Get AQI data
        aqi_response = get_aqi(request, location)
        if aqi_response.status_code == 200:
            aqi_data = json.loads(aqi_response.content)
            aqi_value = aqi_data.get('aqi', 0)
            
            # Generate summary message
            if aqi_value >= 151:
                summary = f"Today's air quality in {location} is unhealthy (AQI: {aqi_value}). Avoid outdoor activities."
            elif aqi_value >= 101:
                summary = f"Today's air quality in {location} is unhealthy for sensitive groups (AQI: {aqi_value}). Limit outdoor activities."
            elif aqi_value >= 51:
                summary = f"Today's air quality in {location} is moderate (AQI: {aqi_value}). Generally safe for most people."
            else:
                summary = f"Today's air quality in {location} is good (AQI: {aqi_value}). Perfect for outdoor activities!"
            
            # Create notification
            notification = Notification.objects.create(
                user=user,
                title="Daily Air Quality Summary",
                message=summary,
                notification_type='daily_summary',
                priority='low',
                data={'aqi': aqi_value, 'location': location, 'pollutants': aqi_data.get('pollutants', {})}
            )
            
            return Response({
                'success': True,
                'message': 'Daily summary generated',
                'notification': NotificationSerializer(notification).data
            })
        else:
            return Response({
                'success': False,
                'error': 'Failed to fetch AQI data'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_mock_notifications(request):
    """Get mock notifications for demonstration purposes"""
    try:
        user = get_or_create_mock_user()
        
        # Create some mock notifications if none exist
        if not Notification.objects.filter(user=user).exists():
            mock_notifications = [
                {
                    'title': 'Air Quality Alert',
                    'message': 'AQI has reached 105 (Unhealthy for Sensitive Groups) in your area. Consider limiting outdoor activities.',
                    'notification_type': 'air_quality',
                    'priority': 'high',
                    'data': {'aqi': 105, 'location': 'Your Area'}
                },
                {
                    'title': 'Pollen Forecast',
                    'message': 'High tree pollen expected tomorrow (8.5 grains/m³). Take precautions if you have allergies.',
                    'notification_type': 'pollen',
                    'priority': 'medium',
                    'data': {'pollen_count': 8.5, 'type': 'tree_pollen'}
                },
                {
                    'title': 'Air Quality Improved',
                    'message': 'Great news! AQI has dropped to 42 (Good) in your area. Perfect time for outdoor activities.',
                    'notification_type': 'air_quality',
                    'priority': 'low',
                    'data': {'aqi': 42, 'location': 'Your Area'}
                }
            ]
            
            for i, notif_data in enumerate(mock_notifications):
                Notification.objects.create(
                    user=user,
                    title=notif_data['title'],
                    message=notif_data['message'],
                    notification_type=notif_data['notification_type'],
                    priority=notif_data['priority'],
                    data=notif_data['data'],
                    read=i == 2  # Mark the last one as read
                )
        
        notifications = Notification.objects.filter(user=user)
        serializer = NotificationSerializer(notifications, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'unread_count': notifications.filter(read=False).count()
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
