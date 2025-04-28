from django.contrib import admin
from django.urls import path, re_path, include
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static
from django.views.decorators.cache import cache_page

# Authentication views
from server.views import (
    LoginView, LogoutView, RegisterView, get_csrf_token,
    MemberSignupView, GuestCheckinView, google_auth,
    request_password_reset, reset_password
)

# Check-in related views
from server.views import (
    CheckinView, CheckinSelectionView, check_student,
    checkin
)

# Class and attendance related views
from server.views import (
    available_classes_today, class_details, add_class,
    student_attendance_history, get_gym_hours
)

# Template management views
from server.views import (
    get_templates, delete_template, update_template
)

# API URLs grouped together for better organization
api_patterns = [
    path("check_student/", check_student, name="check_student"),
    path("available_classes_today/", cache_page(60)(available_classes_today), name="available_classes_today"),
    path("class_details/<int:classID>/", class_details, name="class_details"),
    path("checkin/", checkin, name="checkin"),
    path("add_class/", add_class, name="add_class"),
]

# Auth URLs grouped together
auth_patterns = [
    path("csrf/", get_csrf_token, name="csrf_token"),
    path("login/", LoginView.as_view(), name="login"),
    path("register/", RegisterView.as_view(), name="register"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("checkin-selection/", CheckinSelectionView.as_view(), name="checkin_selection"),
    path("checkin/", CheckinView.as_view(), name="checkin"),
    path("member-signup/", MemberSignupView.as_view(), name="member_signup"),
    path("guest-checkin/", GuestCheckinView.as_view(), name="guest_checkin"),
]

# Health check for monitoring
def health_check(request):
    """Simple health check endpoint for monitoring"""
    from django.http import JsonResponse
    from django.db import connection
    
    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_status = "healthy"
    except Exception:
        db_status = "unhealthy"
        
    return JsonResponse({
        "status": "healthy",
        "database": db_status,
        "timestamp": settings.USE_TZ
    })

urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/", include(auth_patterns)),
    path("api/", include(api_patterns)),
    path("health/", health_check, name="health_check"),
    path("api/attendance/history/", student_attendance_history, name="student_attendance_history"),
    path("api/attendance/history/<str:email>/", student_attendance_history, name="student_attendance_history_by_email"),
    path("api/gym-hours/", get_gym_hours, name="gym_hours"),
    path("api/gym-hours/<int:gym_id>/", get_gym_hours, name="gym_hours_by_id"),
    
    # Add template API endpoints
    path("api/templates/", get_templates, name="get_templates"),
    path("api/templates/<int:template_id>/", delete_template, name="delete_template"),
    path("api/templates/<int:template_id>/update/", update_template, name="update_template"),
    path("auth/google/", google_auth),
    path('auth/request-password-reset/', request_password_reset),
    path('auth/reset-password/<uuid:token>/', reset_password),
    
    # Redirect root to login
    path('', RedirectView.as_view(url='/auth/login/')),
    
    # Handle all other routes for SPA
    re_path(r'^(?!api/|auth/|admin/|static/|health/).*$', RedirectView.as_view(url='/'))
]

# Only add static/media URL patterns in debug mode
# In production, these will be handled by nginx
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)