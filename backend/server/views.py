from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.utils.decorators import method_decorator
from django.views import View
import json
from .models import GymOwner

def get_csrf_token(request):
    """Returns a CSRF token for the frontend to use."""
    return JsonResponse({"csrfToken": get_token(request)})

@method_decorator(csrf_exempt, name="dispatch")
class LoginView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            email = data.get("username")  # ✅ Match frontend input (username = email)
            password = data.get("password")

            try:
                user = User.objects.get(email=email)  # ✅ Look up user by email
                user = authenticate(username=user.username, password=password)  # ✅ Authenticate with username
            except User.DoesNotExist:
                user = None

            if user:
                login(request, user)
                return JsonResponse({"success": True, "message": "Login successful"})

            return JsonResponse({"success": False, "message": "Invalid credentials"}, status=401)

        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)}, status=400)

@method_decorator(csrf_protect, name="dispatch")  # ✅ Protects against CSRF attacks but allows valid tokens
class LogoutView(View):
    def post(self, request):
        response = JsonResponse({"success": True, "message": "Logged out successfully"})
        response["Access-Control-Allow-Credentials"] = "true"  # ✅ Ensure session cookies are sent
        return response

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            first_name = data.get('firstName', '')
            last_name = data.get('lastName', '')

            # Check if email already exists
            if GymOwner.objects.filter(email=email).exists():
                return JsonResponse({
                    'success': False,
                    'message': 'Email already registered'
                }, status=400)

            # Create new gym owner
            user = GymOwner.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )

            # Log the user in
            login(request, user)

            return JsonResponse({
                'success': True,
                'message': 'Registration successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'firstName': user.first_name,
                    'lastName': user.last_name
                }
            })

        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=400)