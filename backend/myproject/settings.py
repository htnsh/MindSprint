"""
Django settings for MindSprint project (MongoDB-only, no JWT, no Django auth)
"""

import os
from pathlib import Path
from dotenv import load_dotenv
import mongoengine

# -------------------------------
# Environment variables
# -------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

DEBUG = True
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
ALLOWED_HOSTS = ["*"]

# API Keys
WAQI_API_KEY = os.getenv("WAQI_API_TOKEN")
AMBEE_API_KEY = os.getenv("AMBEE_API_TOKEN")

# -------------------------------
# Installed apps
# -------------------------------
INSTALLED_APPS = [
    'django.contrib.contenttypes',  # required by DRF
    'django.contrib.staticfiles',   # for serving static files

    'rest_framework',               # DRF for APIs
    'corsheaders',                  # for frontend integration

    'authentication',               # your app
    'dashboard',                    # your app
]

# -------------------------------
# Middleware
# -------------------------------
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

# -------------------------------
# URL & WSGI
# -------------------------------
ROOT_URLCONF = 'myproject.urls'
WSGI_APPLICATION = 'myproject.wsgi.application'

# -------------------------------
# Templates
# -------------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
            ],
        },
    },
]

# -------------------------------
# MongoDB connection
# -------------------------------
MONGO_URI = os.getenv("MONGO_URI")
mongoengine.connect(
    db="BreatheBetter",
    host=MONGO_URI,
    tls=True,
    tlsAllowInvalidCertificates=False
)

# -------------------------------
# No SQL DB (disable Django ORM)
# -------------------------------
DATABASES = {}

# -------------------------------
# Internationalization
# -------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# -------------------------------
# Static files
# -------------------------------
STATIC_URL = 'static/'

# -------------------------------
# REST Framework (token-less)
# -------------------------------
class AnonymousUser:
    is_authenticated = False

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'UNAUTHENTICATED_USER': AnonymousUser,  # prevent DRF from using django.contrib.auth
}

# -------------------------------
# CORS
# -------------------------------

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

CORS_ALLOW_CREDENTIALS = False  # keep False if not using cookies
