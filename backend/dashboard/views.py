import requests
from django.http import JsonResponse
from django.conf import settings
from django.utils.timezone import now, timedelta
from .models import AQIRecord
import math

def get_aqi(request, city="shanghai"):
    api_token = settings.WAQI_API_KEY
    url = f"http://api.waqi.info/feed/{city}/?token={api_token}"

    try:
        response = requests.get(url, timeout=10).json()
    except Exception as e:
        return JsonResponse({"error": f"Request failed: {str(e)}"}, status=500)

    if response.get("status") == "ok":
        data = response.get("data", {})
        iaqi = data.get("iaqi", {})

        result = {
            "city": data.get("city", {}).get("name", city),
            "aqi": data.get("aqi"),
            "dominant_pollutant": data.get("dominentpol"),
            "pollutants": {
                "pm25": iaqi.get("pm25", {}).get("v"),
                "pm10": iaqi.get("pm10", {}).get("v"),
                "o3": iaqi.get("o3", {}).get("v"),
                "no2": iaqi.get("no2", {}).get("v"),
                "so2": iaqi.get("so2", {}).get("v"),
                "co": iaqi.get("co", {}).get("v"),
            },
            "time": data.get("time", {}).get("s")
        }
        return JsonResponse(result, safe=False)
    
    return JsonResponse({"error": response.get("data", "Could not fetch AQI data")}, status=500)

def round_to_nearest_3h(dt):
    """Round datetime to nearest 3-hour slot"""
    hours = dt.hour
    rounded_hour = int(math.floor(hours / 3) * 3)  # floor to nearest multiple of 3
    return dt.replace(hour=rounded_hour, minute=0, second=0, microsecond=0)

def get_aqi_history(request, city="ahmedabad"):
    end = round_to_nearest_3h(now())
    start = end - timedelta(hours=24)

    records = (
        AQIRecord.objects.filter(city__icontains=city, timestamp__range=(start, end))
        .order_by("timestamp")
    )

    # build dict by slot (to avoid multiple values in same 3h slot)
    slots = {}
    for r in records:
        slot_time = round_to_nearest_3h(r.timestamp)
        slots[slot_time] = {
            "time": slot_time.strftime("%I %p"),  # e.g. 03 PM
            "aqi": r.aqi,
            "pm25": r.pm25,
            "pm10": r.pm10,
        }

    # sort slots and keep last 9 (8 intervals + current)
    result = [v for k, v in sorted(slots.items())][-9:]

    return JsonResponse({"city": city, "history": result})
