from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('air_quality', 'Air Quality Alert'),
        ('pollen', 'Pollen Forecast'),
        ('community', 'Community Report'),
        ('daily_summary', 'Daily Summary'),
        ('system', 'System Notification'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='medium')
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    data = models.JSONField(default=dict, blank=True)  # Store additional data like AQI values, location, etc.
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"


class NotificationPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    air_quality_alerts = models.BooleanField(default=True)
    pollen_alerts = models.BooleanField(default=True)
    community_reports = models.BooleanField(default=True)
    daily_summary = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=False)
    push_notifications = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - Notification Preferences"
