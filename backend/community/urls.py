from django.urls import path
from . import views

urlpatterns = [
    path('reports/', views.get_community_reports, name='get_community_reports'),
    path('reports/create/', views.create_community_report, name='create_community_report'),
    path('reports/<str:report_id>/vote/', views.vote_on_report, name='vote_on_report'),
    path('reports/<str:report_id>/delete/', views.delete_community_report, name='delete_community_report'),
    path('stats/', views.get_report_stats, name='get_report_stats'),
    path('map-data/', views.get_map_data, name='get_map_data'),
]
