from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.utils.timezone import localdate
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.utils.decorators import method_decorator
from django.views import View
from django.contrib.auth.decorators import login_required
import json
import logging
import time
from .models import GymOwner, Student, Class, Checkin
from django.utils.timezone import now
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Users, Class, Belts, Roles, ClassAttendance
from django.utils import timezone
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from django.core.cache import cache
from django.conf import settings

# CSRF token endpoint (non-exempt - safe for XHR requests)
def get_csrf_token(request):
    """Returns a CSRF token for the frontend to use."""
    return JsonResponse({"csrfToken": get_token(request)})

# Rate limiting for login attempts
def throttle_login(view_func):
    def wrapped_view(request, *args, **kwargs):
        ip = request.META.get('REMOTE_ADDR')
        key = f"login_attempt:{ip}"
        attempts = cache.get(key, 0)
        
        # Allow 5 attempts per 5 minutes
        if attempts >= 5:
            return JsonResponse({"success": False, "message": "Too many login attempts. Please try again later."}, status=429)
        
        cache.set(key, attempts + 1, 300)  # 5 minutes
        return view_func(request, *args, **kwargs)
    
    return wrapped_view

@method_decorator(csrf_protect, name="dispatch")
@method_decorator(throttle_login, name="dispatch")
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
            logger = logging.getLogger('django.security')
            logger.error(f"Login error: {str(e)}")
            return JsonResponse({"success": False, "message": "Authentication error"}, status=400)

@method_decorator(csrf_protect, name="dispatch")
@method_decorator(login_required, name="dispatch")
class LogoutView(View):
    def post(self, request):
        response = JsonResponse({"success": True, "message": "Logged out successfully"})
        response["Access-Control-Allow-Credentials"] = "true"  # Ensure session cookies are sent
        return response
    
@method_decorator(csrf_protect, name='dispatch')
class RegisterView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('email')
            email = data.get('email')
            password = data.get('password')
            first_name = data.get('firstName', '')
            last_name = data.get('lastName', '')
            belt_id = data.get('belt', 1)  # Default to first belt if not provided
            role_id = data.get('role', 1)  # Default to first role if not provided

            # Check if email already exists
            if Users.objects.filter(email=email).exists():
                return JsonResponse({
                    'success': False,
                    'message': 'Email already registered'
                }, status=400)

            # Create new user
            belt = Belts.objects.get(beltID=belt_id)
            role = Roles.objects.get(roleID=role_id)
            
            user = Users.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                date_enrolled=timezone.now().date(),
                date_of_birth=timezone.now().date(),  # Default value, should be updated later
                belt=belt,
                role=role
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
            logger = logging.getLogger('django.security')
            logger.error(f"Registration error: {str(e)}")
            return JsonResponse({
                'success': False,
                'message': 'Registration failed. Please try again.'
            }, status=400)

@method_decorator(csrf_protect, name='dispatch')
@method_decorator(login_required, name='dispatch')
class CheckinView(View):
    def post(self, request):
        return JsonResponse({"success": True, "message": "Checkin successful"})

@method_decorator(csrf_protect, name='dispatch')
@method_decorator(login_required, name='dispatch')
class CheckinSelectionView(View):
    def post(self, request):
        return JsonResponse({"success": True, "message": "Checkin selection successful"})

@method_decorator(csrf_protect, name='dispatch')
@method_decorator(login_required, name='dispatch')
class GuestCheckinView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            name = data.get('name')
            email = data.get('email')
            phone = data.get('phone')
            experience_level = data.get('experienceLevel')
            referral_source = data.get('referralSource')
            first_time_visit = data.get('firstTimeVisit', True)
            marketing_consent = data.get('marketingConsent', False)
            other_dojos = data.get('otherDojos', '')

            # Validate required fields
            if not all([name, email, phone, experience_level, referral_source]):
                return JsonResponse({
                    'success': False,
                    'message': 'Please fill in all required fields'
                }, status=400)

            # Create a temporary record of the guest check-in
            # You can create a GuestVisit model to store this data permanently if needed
            # For now, we'll just log it
            print(f"Guest Check-in: {name} ({email}) - Experience: {experience_level}, Source: {referral_source}")
            
            return JsonResponse({
                'success': True,
                'message': 'Guest check-in successful',
                'guest': {
                    'name': name,
                    'email': email,
                    'experienceLevel': experience_level
                }
            })

        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': 'Invalid data format'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    
@method_decorator(csrf_protect, name='dispatch')
@method_decorator(login_required, name='dispatch')
class MemberSignupView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            first_name = data.get('firstName')
            last_name = data.get('lastName')
            email = data.get('email')
            phone = data.get('phone')
            dob = data.get('dob')
            password = data.get('password')
            belt_id = data.get('belt', 1)  # Default to first belt if not provided
            role_id = data.get('role', 1)  # Default to first role if not provided

            # Validate required fields
            if not all([first_name, last_name, email, phone, dob, password]):
                return JsonResponse({
                    'success': False,
                    'message': 'All fields are required'
                }, status=400)

            # Check if email already exists
            if Users.objects.filter(email=email).exists():
                return JsonResponse({
                    'success': False,
                    'message': 'Email already registered'
                }, status=400)

            # Create new user
            belt = Belts.objects.get(id=belt_id)
            role = Roles.objects.get(id=role_id)
            
            user = Users.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                date_enrolled=timezone.now().date(),
                date_of_birth=dob,
                belt_id=belt,
                role_id=role,
                phone_number=phone,
                is_gym_owner=False
            )

            return JsonResponse({
                'success': True,
                'message': 'Member registration successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            })

        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=400)

@csrf_protect
@login_required
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
            student_exists = Users.objects.filter(email=email).exists()
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
            return JsonResponse({"exists": False, "message": "An error occurred while processing your request"}, status=400)
    else:
        logger.warning(f"[{request_id}] Method not allowed: {request.method}")
        return JsonResponse({"error": "Method not allowed"}, status=405)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_classes_today(request):
    """Fetch only today's available classes for check-in."""
    today = localdate()  # Get today's date

    try:
        # Try to get cached data first
        cached_classes = cache.get(f"available_classes_{today}")
        if cached_classes:
            return JsonResponse({"success": True, "classes": cached_classes}, status=200)

        # Query classes with required fields for today
        classes = Class.objects.filter(
            date=today,
            is_canceled=0,  # Only get non-canceled classes
            template__isnull=False,  # Only classes with a template
        ).select_related('template', 'template__level').order_by("start_time")

        data = []
        for cls in classes:
            try:
                # Get template and level information
                template = cls.template
                level_name = template.level.name if hasattr(template, 'level') and template.level else "All Levels"
                
                data.append({
                    "id": cls.id,
                    "name": template.name,
                    "startTime": cls.start_time.strftime("%H:%M"),
                    "endTime": cls.end_time.strftime("%H:%M"),
                    "level": level_name,
                    "maxCapacity": template.max_capacity,
                    "description": template.description,
                    "notes": cls.notes
                })
            except Exception as e:
                # Log error but continue processing other classes
                print(f"Error processing class {cls.id}: {str(e)}")
                continue

        # Store in cache for 30 seconds
        cache.set(f"available_classes_{today}", data, timeout=30)

        return JsonResponse({"success": True, "classes": data}, status=200)
    
    except Exception as e:
        # Log the detailed error
        import traceback
        print(f"Error in available_classes_today: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({"success": False, "message": "An error occurred while fetching classes", "error": str(e)}, status=500)

@login_required
def class_details(request, classID):
    """Returns details of a specific class."""
    try:
        class_instance = get_object_or_404(Class, id=classID)
        
        # Check if required fields exist
        if not hasattr(class_instance, 'template') or not class_instance.template:
            return JsonResponse({"success": False, "message": "Class has incomplete data"}, status=400)
        
        template = class_instance.template
        level = template.level if hasattr(template, 'level') else None
            
        data = {
            "success": True,
            "id": class_instance.id,
            "name": template.name,
            "startTime": str(class_instance.start_time),
            "endTime": str(class_instance.end_time),
            "date": str(class_instance.date),
            "isCanceled": class_instance.is_canceled == 1,
            "notes": class_instance.notes or "",
            "description": template.description or "",
            "maxCapacity": template.max_capacity,
        }
        
        # Add level info if available
        if level:
            data["level"] = level.name
            
        return JsonResponse(data)
        
    except Class.DoesNotExist:
        return JsonResponse({"success": False, "message": "Class not found"}, status=404)
    except Exception as e:
        logger = logging.getLogger('django.request')
        logger.error(f"Error retrieving class details: {str(e)}")
        return JsonResponse({"error": "An error occurred retrieving class details"}, status=400)
    
@csrf_protect
@login_required
def checkin(request):
    """Handles student check-ins for a class."""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            class_id = data.get("classID")  # We still accept classID from frontend
            
            if not email or not class_id:
                return JsonResponse({
                    "success": False, 
                    "message": "Email and class ID are required"
                }, status=400)

            # Check if student exists
            student = Users.objects.filter(email=email).first()
            if not student:
                return JsonResponse({
                    "success": False, 
                    "message": "Student not found"
                }, status=404)

            # Check if class exists - using the new id field
            class_instance = Class.objects.filter(id=class_id).first()
            if not class_instance:
                return JsonResponse({
                    "success": False, 
                    "message": "Class not found"
                }, status=404)
                
            # Check if class is canceled
            if class_instance.is_canceled:
                return JsonResponse({
                    "success": False, 
                    "message": "This class has been canceled"
                }, status=400)
                
            # Get class template info
            template = class_instance.template
            if not template:
                return JsonResponse({
                    "success": False, 
                    "message": "Class template not found"
                }, status=404)

            # Create a ClassAttendance record
            attendance, created = ClassAttendance.objects.get_or_create(
                user=student,
                scheduled_class=class_instance,
                defaults={
                    "check_in_time": timezone.now(),
                    "checked_in_by": None  # No instructor checked them in - self check-in
                }
            )
            
            check_in_status = "created" if created else "already exists"
            
            # Record the check-in in logs
            print(f"Student {student.email} checked into class {template.name} on {class_instance.date} - {check_in_status}")
            
            # Format the response data
            current_time = timezone.now()
            response_data = {
                "success": True,
                "message": "Check-in successful!",
                "checkin": {
                    "studentName": f"{student.first_name} {student.last_name}",
                    "className": template.name,
                    "date": str(class_instance.date),
                    "checkinTime": current_time.strftime("%Y-%m-%dT%H:%M:%S%z")
                }
            }
            
            return JsonResponse(response_data, status=200)

        except Exception as e:
            import traceback
            print(f"Error in checkin: {str(e)}")
            print(traceback.format_exc())
            return JsonResponse({
                "success": False, 
                "message": f"An error occurred: {str(e)}"
            }, status=500)
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_protect
@login_required
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
            logger = logging.getLogger('django.request')
            logger.error(f"Add class error: {str(e)}")
            return JsonResponse({"success": False, "message": "An error occurred while adding the class"}, status=400)
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)

@api_view(['GET'])
def student_attendance_history(request, email=None):
    """
    Get the attendance history for a student
    """
    try:
        # Check if student exists
        if email:
            student = get_object_or_404(Users, email=email)
        else:
            # Use the authenticated user if no email is provided
            if not request.user.is_authenticated:
                return JsonResponse({"success": False, "message": "Authentication required"}, status=401)
            student = request.user
        
        # Get attendance records
        attendance_records = ClassAttendance.objects.filter(
            user=student
        ).select_related('scheduled_class', 'scheduled_class__template').order_by('-check_in_time')
        
        # Format the data
        attendance_data = []
        for record in attendance_records:
            scheduled_class = record.scheduled_class
            template = getattr(scheduled_class, 'template', None)
            
            class_data = {
                "id": scheduled_class.id,
                "date": str(scheduled_class.date),
                "checkInTime": record.check_in_time.strftime("%Y-%m-%d %H:%M:%S"),
                "className": template.name if template else "Class",
            }
            
            # Add additional class details if available
            if template:
                class_data.update({
                    "description": template.description,
                    "startTime": scheduled_class.start_time.strftime("%H:%M") if hasattr(scheduled_class, 'start_time') else None,
                    "endTime": scheduled_class.end_time.strftime("%H:%M") if hasattr(scheduled_class, 'end_time') else None,
                })
            
            attendance_data.append(class_data)
        
        return JsonResponse({
            "success": True,
            "student": {
                "id": student.id,
                "email": student.email,
                "name": f"{student.first_name} {student.last_name}",
            },
            "attendanceCount": len(attendance_data),
            "attendanceRecords": attendance_data
        })
            
    except Exception as e:
        import traceback
        print(f"Error in student_attendance_history: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({"success": False, "message": f"An error occurred: {str(e)}"}, status=500)