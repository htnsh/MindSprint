import requests
from django.http import JsonResponse
from django.conf import settings
from django.utils.timezone import now, timedelta
from .models import AQIRecord
import math

def get_aqi(request, city="Delhi"):
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

import requests
from django.http import JsonResponse
from django.conf import settings

def get_pollen(request, city="Delhi"):
    url = f"https://api.ambeedata.com/latest/pollen/by-place?place={city}"
    headers = {"x-api-key": settings.AMBEE_API_KEY}

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.RequestException as e:
        return JsonResponse({"error": f"Request failed: {str(e)}"}, status=500)

    if "data" in data and len(data["data"]) > 0:
        pollen_data = data["data"][0]

        counts = pollen_data.get("Count", {})
        risks = pollen_data.get("Risk", {})

        result = {
            "city": city,
            "updated_at": pollen_data.get("updatedAt"),
            "tree_pollen": counts.get("tree_pollen"),
            "grass_pollen": counts.get("grass_pollen"),
            "weed_pollen": counts.get("weed_pollen"),
            "tree_risk": risks.get("tree_pollen"),
            "grass_risk": risks.get("grass_pollen"),
            "weed_risk": risks.get("weed_pollen"),
        }
        return JsonResponse(result, safe=False)

    return JsonResponse({"error": data.get("message", "Could not fetch pollen data")}, status=500)
