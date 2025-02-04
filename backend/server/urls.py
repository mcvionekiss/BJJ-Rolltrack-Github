from django.contrib import admin
from django.urls import path
from server.views import LoginView, get_csrf_token

urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/csrf/", get_csrf_token, name="csrf_token"),  # ✅ Fetch CSRF token before login
    path("auth/login/", LoginView.as_view(), name="login"),
]