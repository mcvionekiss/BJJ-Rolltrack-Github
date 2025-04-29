from django.contrib import admin
from django.urls import path, re_path
from django.views.generic import RedirectView
from server.views import (
    LoginView, LogoutView, RegisterView, get_csrf_token, 
    CheckinView, MemberSignupView, GuestCheckinView, CheckinSelectionView, 
    check_student, available_classes_today, class_details, checkin, 
    student_attendance_history, get_gym_hours, google_auth, request_password_reset, reset_password, add_gym,
    # Add new template views
    get_templates, delete_template, update_template, generate_qr
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/csrf/", get_csrf_token, name="csrf_token"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/checkin-selection/", CheckinSelectionView.as_view(), name="checkin_selection"),
    path("auth/checkin-selection/<int:gym_id>/", CheckinSelectionView.as_view(), name="checkin_selection_with_gym"),
    path("auth/checkin/", CheckinView.as_view(), name="checkin"),
    path("auth/member-signup/", MemberSignupView.as_view(), name="member_signup"),
    path("auth/guest-checkin/", GuestCheckinView.as_view(), name="guest_checkin"),
    path("auth/add-gym/", add_gym, name="add_gym"),
    path("api/check_student/", check_student, name="check_student"),
    path("api/available_classes_today/", available_classes_today, name="available_classes_today"),
    path("api/class_details/<int:classID>/", class_details, name="class_details"),
    path("api/checkin/", checkin, name="checkin"),
    path("api/generate-qr/<int:gym_id>/", generate_qr, name="generate_qr"),
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
    re_path(r'^(?!api/|auth/|admin/).*$', RedirectView.as_view(url='/'))
]