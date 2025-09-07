from rest_framework import serializers
from .models import Notification, NotificationPreference


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'priority', 'read', 'created_at', 'data']
        read_only_fields = ['id', 'created_at']


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = ['air_quality_alerts', 'pollen_alerts', 'community_reports', 'daily_summary', 
                 'email_notifications', 'push_notifications']
