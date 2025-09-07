from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_notifications, name='get_notifications'),
    path('mock/', views.get_mock_notifications, name='get_mock_notifications'),
    path('<int:notification_id>/read/', views.mark_notification_read, name='mark_notification_read'),
    path('mark-all-read/', views.mark_all_notifications_read, name='mark_all_notifications_read'),
    path('preferences/', views.notification_preferences, name='notification_preferences'),
    path('generate-air-quality-alert/', views.generate_air_quality_alert, name='generate_air_quality_alert'),
    path('generate-daily-summary/', views.generate_daily_summary, name='generate_daily_summary'),
]
