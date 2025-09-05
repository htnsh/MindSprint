import os
from datetime import timedelta

class Config:
    # Security
    API_KEY = os.environ.get("API_KEY", "dev-key")
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")

    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///air_quality.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # External APIs
    WAQI_API_TOKEN = os.environ.get("WAQI_API_TOKEN")
    OPENAQ_API_URL = "https://api.openaq.org/v2"

    # Data refresh intervals
    DATA_REFRESH_INTERVAL = timedelta(minutes=30)
    USER_REPORT_RETENTION = timedelta(days=30)
    SENSOR_DATA_RETENTION = timedelta(days=7)

    # Rate limiting
    REQUESTS_PER_MINUTE = 60

    # Geographic bounds for India
    INDIA_BOUNDS = {
        "north": 37.6,
        "south": 6.4,
        "east": 97.25,
        "west": 68.7,
    }
