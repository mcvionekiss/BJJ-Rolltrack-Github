from django.contrib import admin
from django.urls import path, re_path
from django.views.generic import RedirectView
from server.views import LoginView, LogoutView, RegisterView, get_csrf_token, CheckinView, MemberSignupView, GuestCheckinView, CheckinSelectionView, check_student, available_classes_today, class_details, checkin, student_attendance_history
from .views import google_auth


urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/csrf/", get_csrf_token, name="csrf_token"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/checkin-selection/", CheckinSelectionView.as_view(), name="checkin_selection"),
    path("auth/checkin/", CheckinView.as_view(), name="checkin"),
    path("auth/member-signup/", MemberSignupView.as_view(), name="member_signup"),
    path("auth/guest-checkin/", GuestCheckinView.as_view(), name="guest_checkin"),
    path("api/check_student/", check_student, name="check_student"),
    path("api/available_classes_today/", available_classes_today, name="available_classes_today"),
    path("api/class_details/<int:classID>/", class_details, name="class_details"),
    path("api/checkin/", checkin, name="checkin"),
    path("api/attendance/history/", student_attendance_history, name="student_attendance_history"),
    path("api/attendance/history/<str:email>/", student_attendance_history, name="student_attendance_history_by_email"),
    path("auth/google/", google_auth),
    
    # Redirect root to login
    path('', RedirectView.as_view(url='/auth/login/')),
    
    # Handle all other routes for SPA
    re_path(r'^(?!api/|auth/|admin/).*$', RedirectView.as_view(url='/'))
]