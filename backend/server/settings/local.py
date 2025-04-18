"""
Django settings for server project - Development Environment.

This file contains settings specific to the local development environment.
"""

from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
from server.settings import get_secret
SECRET_KEY = get_secret('DJANGO_SECRET_KEY', "django-insecure-vf1ql$l*ln)wabh$4g#!&9&3v6-j#w+-8r!$ci9948i7wx^(fr")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = get_secret('DEBUG', 'True').lower() == 'true'

# ALLOWED_HOSTS will be overridden by environment variables in __init__.py
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "192.168.2.1"]

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    'rest_framework',
    'corsheaders',  # Allow frontend requests
    'server',
    'django_extensions',  # Helpful development tools
]

AUTH_USER_MODEL = 'server.GymOwner'

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# CSRF_TRUSTED_ORIGINS will be overridden by environment variables in __init__.py
CSRF_TRUSTED_ORIGINS = ["http://localhost:3000", "http://192.168.2.1:3000"]

# CORS_ALLOWED_ORIGINS will be overridden by environment variables in __init__.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://192.168.2.1:3000",
]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-CSRFToken",
]

ROOT_URLCONF = "server.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "server.wsgi.application"


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DB_NAME = get_secret("DB_NAME", 'test')
DB_USER = get_secret("DB_USER", 'admin')
DB_PASSWORD = get_secret("DB_PASSWORD", 'RollTrackTeam495080')
DB_HOST = get_secret("DB_HOST", 'rds-mysql-bjjrolltrack.cnaa6y844puy.us-east-1.rds.amazonaws.com')
DB_PORT = get_secret("DB_PORT", '3306')

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": DB_NAME,
        "USER": DB_USER,
        "PASSWORD": DB_PASSWORD,
        "HOST": DB_HOST,
        "PORT": DB_PORT,
    }
}

# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = "static/"

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Development-specific logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
        },
        'server': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}