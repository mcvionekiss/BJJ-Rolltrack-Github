from django.contrib import admin
from django.urls import path
from .views import login_view, homepage, hello_world

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/hello/', hello_world, name='hello_world'),  # API endpoint
    path('', homepage, name='homepage'),  # API root
    path("api/auth/login/", login_view, name="login"),
]