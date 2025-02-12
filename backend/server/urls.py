from django.contrib import admin
from django.urls import path
from server.views import LoginView, LogoutView, RegisterView, get_csrf_token, CheckinView, check_student, available_classes, class_details, checkin

urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/csrf/", get_csrf_token, name="csrf_token"),  # Fetch CSRF token before login
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/checkin/", CheckinView.as_view(), name="checkin"),
    path("api/check_student/", check_student, name="check_student"),
    path("api/available_classes/", available_classes, name="available_classes"),
    path("api/class_details/<int:classID>/", class_details, name="class_details"),
    path("api/checkin/", checkin, name="checkin"),
]