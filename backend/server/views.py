from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.utils.timezone import localdate
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.utils.decorators import method_decorator
from django.views import View
import json
import logging
import time
from .models import Users, Student, Class, Checkin, Gym, GymAddress, GymHours, Roles
from django.utils.timezone import now
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from django.core.cache import cache  # Add caching for faster load times
from django.db import connection

@csrf_exempt
def get_csrf_token(request):
    """Returns a CSRF token for the frontend to use."""
    return JsonResponse({"csrfToken": get_token(request)})

@csrf_exempt
@api_view(['GET'])
def health_check(request):
    """
    Health check endpoint for monitoring and load balancing.
    Checks database connection and returns service status.
    """
    status = {
        "status": "healthy",
        "timestamp": now().isoformat(),
        "service": "BJJ RollTrack API",
        "checks": {
            "database": "ok"
        }
    }

    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception as e:
        status["status"] = "unhealthy"
        status["checks"]["database"] = str(e)

    # Return 200 if healthy, 503 if unhealthy
    status_code = 200 if status["status"] == "healthy" else 503
    return JsonResponse(status, status=status_code)

@method_decorator(csrf_exempt, name="dispatch")
class LoginView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            email = data.get("email")
            password = data.get("password")

            # Find user by email
            try:
                user = Users.objects.get(email=email)
            except Users.DoesNotExist:
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
        response["Access-Control-Allow-Credentials"] = "true"  # Ensure session cookies are sent
        return response

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('email')
            email = data.get('email')
            password = data.get('password')
            first_name = data.get('firstName', '')
            last_name = data.get('lastName', '')

            # Check if email already exists
            if Users.objects.filter(email=email).exists():
                return JsonResponse({
                    'success': False,
                    'message': 'Email already registered'
                }, status=400)

            # Create new gym owner
            user = Users.objects.create_user(
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
    logger = logging.getLogger(__name__)
    request_id = f"req_{int(time.time() * 1000)}"  # Generate a unique request ID

    logger.info(f"[{request_id}] check_student endpoint called with method: {request.method}")

    if request.method == "POST":
        logger.info(f"[{request_id}] Processing POST request to check_student")
        try:
            # Log request headers for debugging
            logger.debug(f"[{request_id}] Request headers: {dict(request.headers)}")

            # Parse request body
            start_time = time.time()
            data = json.loads(request.body)
            email = data.get("email")
            logger.info(f"[{request_id}] Parsed request body. Email to check: {email}")

            # Check if student exists
            logger.debug(f"[{request_id}] Querying database for student with email: {email}")
            query_start_time = time.time()
            student_exists = Student.objects.filter(email=email).exists()
            query_time = time.time() - query_start_time
            logger.debug(f"[{request_id}] Database query completed in {query_time:.4f}s")

            # Prepare response
            if student_exists:
                logger.info(f"[{request_id}] Student found with email: {email}")
                response = {"exists": True, "message": "Student found"}
                status_code = 200
            else:
                logger.warning(f"[{request_id}] Student not found with email: {email}")
                response = {"exists": False, "message": "Student not found"}
                status_code = 404

            # Log response details
            total_time = time.time() - start_time
            logger.info(f"[{request_id}] Returning response with status: {status_code}, exists: {student_exists}, total processing time: {total_time:.4f}s")

            return JsonResponse(response, status=status_code)

        except json.JSONDecodeError as e:
            logger.error(f"[{request_id}] JSON decode error: {str(e)}")
            return JsonResponse({"exists": False, "message": f"Invalid JSON: {str(e)}"}, status=400)
        except Exception as e:
            logger.error(f"[{request_id}] Unexpected error in check_student: {str(e)}", exc_info=True)
            return JsonResponse({"exists": False, "message": str(e)}, status=400)
    else:
        logger.warning(f"[{request_id}] Method not allowed: {request.method}")
        return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
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

@csrf_exempt
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

@csrf_exempt
def add_class(request):
    """API endpoint to add a new class to the database."""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            name = data.get("name")
            start_time = data.get("startTime")
            end_time = data.get("endTime")
            recurring = data.get("recurring", False)

            if not all([name, start_time, end_time]):
                return JsonResponse({"success": False, "message": "Missing required fields"}, status=400)

            new_class = Class.objects.create(
                name=name,
                startTime=start_time,
                endTime=end_time,
                recurring=recurring
            )

            return JsonResponse({
                "success": True,
                "message": "Class added successfully",
                "class": {
                    "classID": new_class.classID,
                    "name": new_class.name,
                    "startTime": str(new_class.startTime),
                    "endTime": str(new_class.endTime),
                    "recurring": new_class.recurring
                }
            }, status=201)

        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)}, status=400)
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)

@method_decorator(csrf_exempt, name='dispatch')
class GymOwnerRegistration(View):
    def post(self, request):
        try:

            roles = Roles.objects.get(role="owner")

            data = json.loads(request.body)
            first_name = data.get('firstName', '')
            last_name = data.get('lastName', '')
            email = data.get('email')
            password = data.get('password')
            phone = data.get('phone')
            role = roles;
            gym_name = data.get('gymName')
            gym_email = data.get('gymEmail')
            gym_phone = data.get('gymPhoneNumber')
            gym_address = data.get('address')
            gym_city = data.get('city')
            gym_state = data.get('state')
            gym_schedule = data.get('schedule')


            # Check if email already exists
            if Users.objects.filter(email=email).exists():
                return JsonResponse({
                    'success': False,
                    'message': 'Email already registered'
                }, status=400)

            # Create new gym owner
            user = Users.objects.create_user(
                username = email,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                phone_number = phone,
                date_enrolled = localdate(),
                role = role
            )

            gym = Gym.objects.create(
                name = gym_name,
                email = gym_email,
                phone_number = gym_phone
            )

            gym_address = GymAddress.objects.create(
                street1 = gym_address,
                street2 = "",
                city = gym_city,
                state = gym_state,
                #zipcode = gym_zipcode,
                gym = gym
            )


            index = 0
            for days in gym_schedule:
                if days["closed"] == "true":
                    hours = GymHours.objects.create(
                        day = index,
                        closed = days["closed"],
                        gym = gym
                    )
                    index = index + 1
                else:
                    hours = GymHours.objects.create(
                        day = index,
                        open_time = days["openTime"],
                        close_time = days["closeTime"],
                        closed = days["closed"],
                        gym = gym
                    )
                    index = index + 1

            """

            # sunday
            if gym_schedule[0].closed == "true":
                hours = GymHours.objects.create(
                    day = 0,
                    gym = gym
                )
            else:
                hours = GymHours.objects.create(
                    day = 0,
                    open_time = gym_schedule[0].openTime,
                    close_time = gym_schedule[0].closeTime,
                    gym = gym
                )

            # monday
            if gym_schedule[1].closed == "true":
                hours = GymHours.objects.create(
                    day = 1,
                    gym = gym
                )
            else:
                hours = GymHours.objects.create(
                    day = 1,
                    open_time = gym_schedule[1].openTime,
                    close_time = gym_schedule[1].closeTime,
                    gym = gym
                )

            #tuesday
            if gym_schedule[2].closed == "true":
                hours = GymHours.objects.create(
                    day = 2,
                    gym = gym
                )
            else:
                hours = GymHours.objects.create(
                    day = 2,
                    open_time = gym_schedule[2].openTime,
                    close_time = gym_schedule[2].closeTime,
                    gym = gym
                )

            #wednesday
            if gym_schedule[3].closed == "true":
                hours = GymHours.objects.create(
                    day = 3,
                    gym = gym
                )
            else:
                hours = GymHours.objects.create(
                    day = 3,
                    open_time = gym_schedule[3].openTime,
                    close_time = gym_schedule[3].closeTime,
                    gym = gym
                )

            #thursday
            if gym_schedule[4].closed == "true":
                hours = GymHours.objects.create(
                    day = 4,
                    gym = gym
                )
            else:
                hours = GymHours.objects.create(
                    day = 4,
                    open_time = gym_schedule[4].openTime,
                    close_time = gym_schedule[4].closeTime,
                    gym = gym
                )

            #friday
            if gym_schedule[5].closed == "true":
                hours = GymHours.objects.create(
                    day = 5,
                    gym = gym
                )
            else:
                hours = GymHours.objects.create(
                    day = 5,
                    open_time = gym_schedule[5].openTime,
                    close_time = gym_schedule[5].closeTime,
                    gym = gym
                )

            #saturday
            if gym_schedule[6].closed == "true":
                hours = GymHours.objects.create(
                    day = 6,
                    gym = gym
                )
            else:
                hours = GymHours.objects.create(
                    day = 6,
                    open_time = gym_schedule[6].openTime,
                    close_time = gym_schedule[6].closeTime,
                    gym = gym
                )
            """





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
