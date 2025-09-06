from django.urls import path
from . import views

urlpatterns = [
    path("aqi/<str:city>/", views.get_aqi, name="get_aqi"),
]
