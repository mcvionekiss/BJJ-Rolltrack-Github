import os

def get_secret(secret_id, backup=None):
    return os.getenv(secret_id, backup)

# Determine which settings file to load based on PIPELINE environment variable
pipeline = get_secret('PIPELINE', 'development')

if pipeline == 'production':
    from .production import *
elif pipeline == 'staging':
    from .staging import *
else:  # Default to development
    from .local import *

# Override settings with environment variables if they exist
ALLOWED_HOSTS = get_secret('ALLOWED_HOSTS', '').split(',') or ALLOWED_HOSTS
CORS_ALLOWED_ORIGINS = get_secret('CORS_ALLOWED_ORIGINS', '').split(',') or CORS_ALLOWED_ORIGINS
CSRF_TRUSTED_ORIGINS = get_secret('CSRF_TRUSTED_ORIGINS', '').split(',') or CSRF_TRUSTED_ORIGINS