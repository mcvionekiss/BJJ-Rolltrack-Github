from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
import json

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