from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.utils.timezone import localdate
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.utils.decorators import method_decorator
from django.views import View
import json
from .models import GymOwner, Student, Class, Checkin
from django.utils.timezone import now
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from django.core.cache import cache  # Add caching for faster load times


def get_csrf_token(request):
    """Returns a CSRF token for the frontend to use."""
    return JsonResponse({"csrfToken": get_token(request)})

@method_decorator(csrf_exempt, name="dispatch")
class LoginView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            email = data.get("email")
            password = data.get("password")

            # Find user by email
            try:
                user = GymOwner.objects.get(email=email)
            except GymOwner.DoesNotExist:
                return JsonResponse({"success": False, "message": "Invalid credentials"}, status=401)

            # Authenticate user with their email and password
            user = authenticate(username=user.username, password=password)

            if user:
                login(request, user)
                return JsonResponse({
                    "success": True,
                    "message": "Login successful",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "firstName": user.first_name,
                        "lastName": user.last_name,
                    }
                })
            else:
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

class CheckinView(View):
    def post(self, request):
        return JsonResponse({"success": True, "message": "Checkin successful"})


@csrf_exempt
def check_student(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")

            # Check if student exists
            student_exists = Student.objects.filter(email=email).exists()

            if student_exists:
                return JsonResponse({"exists": True, "message": "Student found"}, status=200)
            else:
                return JsonResponse({"exists": False, "message": "Student not found"}, status=404)

        except Exception as e:
            return JsonResponse({"exists": False, "message": str(e)}, status=400)

@api_view(['GET'])
def available_classes_today(request):
    """Fetch only today's available classes for check-in."""
    today = localdate()  # Get today's date

    # Try to get cached data first
    cached_classes = cache.get(f"available_classes_{today}")
    if cached_classes:
        return JsonResponse({"success": True, "classes": cached_classes}, status=200)

    # Query only classes for today
    # classes = Class.objects.filter(date=today).order_by("startTime")

    # Query for ALL classes
    classes = Class.objects.all().order_by("startTime")

    data = [
        {
            "classID": cls.classID,
            "name": cls.name,
            "startTime": cls.startTime.strftime("%H:%M"),
            "endTime": cls.endTime.strftime("%H:%M"),
            "recurring": cls.recurring
        }
        for cls in classes
    ]

    # Store in cache for 30 seconds
    cache.set(f"available_classes_{today}", data, timeout=30)

    return JsonResponse({"success": True, "classes": data}, status=200)

def class_details(request, classID):
    """Returns details of a specific class."""
    try:
        class_instance = get_object_or_404(Class, classID=classID)
        return JsonResponse({
            "classID": class_instance.classID,
            "name": class_instance.name,
            "startTime": str(class_instance.startTime),
            "endTime": str(class_instance.endTime),
            "recurring": class_instance.recurring,
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    

@csrf_exempt
def checkin(request):
    """Handles student check-ins for a class."""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            classID = data.get("classID")

            # Check if student exists
            student = Student.objects.filter(email=email).first()
            if not student:
                return JsonResponse({"success": False, "message": "Student not found"}, status=404)

            # Check if class exists
            class_instance = Class.objects.filter(classID=classID).first()
            if not class_instance:
                return JsonResponse({"success": False, "message": "Class not found"}, status=404)

            # Create a check-in record
            Checkin.objects.create(student=student, class_instance=class_instance)

            return JsonResponse({"success": True, "message": "Check-in successful!"}, status=200)

        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)}, status=400)