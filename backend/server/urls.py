from django.contrib import admin
from django.urls import path, re_path
from django.views.generic import RedirectView
from server.views import (
    LoginView, LogoutView, RegisterView, get_csrf_token, CheckinView,
    check_student, available_classes_today, class_details, checkin,
    GymOwnerRegistration,
    health_check
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/csrf/", get_csrf_token, name="csrf_token"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/gym_owner_registration/", GymOwnerRegistration.as_view(), name="gym_owner_registration"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/checkin/", CheckinView.as_view(), name="checkin"),
    path("api/check_student/", check_student, name="check_student"),
    path("api/available_classes_today/", available_classes_today, name="available_classes_today"),
    path("api/class_details/<int:classID>/", class_details, name="class_details"),
    path("api/checkin/", checkin, name="checkin"),

    # Health check endpoint for monitoring and load balancing
    path("health/", health_check, name="health_check"),

    # Redirect root to login
    path('', RedirectView.as_view(url='/auth/login/')),

    # Handle all other routes for SPA
    re_path(r'^(?!api/|auth/|admin/|health/).*$', RedirectView.as_view(url='/'))
]
