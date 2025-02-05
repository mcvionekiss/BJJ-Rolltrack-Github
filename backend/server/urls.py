from django.contrib import admin
from django.urls import path
from server.views import LoginView, LogoutView, RegisterView, get_csrf_token

urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/csrf/", get_csrf_token, name="csrf_token"),  # ✅ Fetch CSRF token before login
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
]