import requests
from django.conf import settings
from .models import AQIRecord

def fetch_aqi_data():
    city = "ahmedabad"  # or loop for multiple cities
    url = f"http://api.waqi.info/feed/{city}/?token={settings.WAQI_API_KEY}"
    try:
        res = requests.get(url, timeout=10).json()
        if res.get("status") == "ok":
            data = res["data"]
            iaqi = data.get("iaqi", {})
            AQIRecord.objects.create(
                city=data.get("city", {}).get("name", city),
                aqi=data.get("aqi"),
                pm25=iaqi.get("pm25", {}).get("v"),
                pm10=iaqi.get("pm10", {}).get("v"),
            )
    except Exception as e:
        print("Error fetching AQI:", e)
