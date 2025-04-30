# Django imports
from django.conf import settings
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.core import serializers
from django.core.cache import cache
from django.core.mail import send_mail
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse, FileResponse, HttpResponse
from django.utils.timezone import localdate, now, timedelta
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.utils.decorators import method_decorator
from django.views import View
import json
import logging
import time
import requests
from .models import Users, Class, Belts, Roles, ClassAttendance, GymHours, Gym, ClassTemplates, ClassLevel, PasswordResetToken, GymAddress, GymsOwners
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.utils.timezone import localdate, now, timedelta
from django.views import View
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required

# Rest framework imports
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

# Google auth imports
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# Python standard library imports
import json
import logging
import os
import time
import requests
from django.core.mail import send_mail
from django.conf import settings
import subprocess
import tempfile
import sys
import qrcode
from PIL import Image
import io


# Local imports
from .models import (
    Belts, 
    Class, 
    ClassAttendance, 
    ClassLevel, 
    ClassTemplates, 
    Gym, 
    GymHours, 
    PasswordResetToken, 
    Roles, 
    Users
)

# CSRF token endpoint (non-exempt - safe for XHR requests)
def get_csrf_token(request):
    """Returns a CSRF token for the frontend to use."""
    token = get_token(request)
    response = JsonResponse({"csrfToken": token})
    # Ensure the cookie is accessible to JavaScript
    response["Access-Control-Allow-Credentials"] = "true"
    # Ensure headers are exposed to the frontend
    response["Access-Control-Expose-Headers"] = "Set-Cookie"
    
    # Check if we're in a development environment, adjust cookie settings
    if settings.DEBUG:
        # In development, we need to allow credentials across origins
        response["Access-Control-Allow-Origin"] = request.headers.get("Origin", "*")
        
    print(f"Generated new CSRF token: {token}")
    return response

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
            gym_id = data.get("gymId")  # Get gym_id from request if provided

            # Find user by email
            try:
                user = Users.objects.get(email=email)
            except Users.DoesNotExist:
                return JsonResponse({"success": False, "message": "Invalid credentials"}, status=401)

            # Authenticate user with their email and password
            user = authenticate(username=user.username, password=password)

            if not user:
                return JsonResponse({"success": False, "message": "Invalid credentials"}, status=401)
                
            # If gym_id is provided, check if the user has access to this gym
            if gym_id:
                # Check if user has membership for this gym in the gym_memberships table
                from django.db import connection
                with connection.cursor() as cursor:
                    cursor.execute("""
                        SELECT COUNT(*) FROM gym_memberships 
                        WHERE user_id = %s AND gym_id = %s AND active = %s
                    """, [user.id, gym_id, True])
                    
                    has_membership = cursor.fetchone()[0] > 0
                
                if not has_membership:
                    return JsonResponse({
                        "success": False,
                        "message": "You don't have access to this gym"
                    }, status=403)
                    
                # If user has access, get the gym details
                try:
                    gym = Gym.objects.get(id=gym_id)
                    gym_name = gym.name
                except Gym.DoesNotExist:
                    gym_name = None
                    
                # Login the user
                login(request, user)
                
                # Return successful response with gym info
                return JsonResponse({
                    "success": True,
                    "message": "Login successful",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "firstName": user.first_name,
                        "lastName": user.last_name,
                    },
                    "gym": {
                        "id": gym_id,
                        "name": gym_name
                    }
                })
            else:
                # No gym_id provided, just login the user
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
            first_name = data.get('first_name', '')
            last_name = data.get('last_name', '')
            belt_id = data.get('belt', 1)  # Default to first belt if not provided
            role_id = data.get('role', 1)  # Default to first role if not provided

            # Check if email already exists
            if Users.objects.filter(email=email).exists():
                return JsonResponse({
                    'success': False,
                    'message': 'Email already registered'
                }, status=400)

            # Create new user
            try:
                belt = Belts.objects.get(id=belt_id)
            except Roles.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': f'Role with ID {belt_id} does not exist.'
                }, status=400)
            try:
                role = Roles.objects.get(id=role_id)
            except Roles.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': f'Role with ID {role_id} does not exist.'
                }, status=400)
            
            user = Users.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                date_enrolled=timezone.now().date(),
                date_of_birth=timezone.now().date(),  # Default value, should be updated later
                belt_id=belt,
                role_id=role
            )

            # Log the user in
            user.backend = "django.contrib.auth.backends.ModelBackend"
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
            gym_id = data.get('gymId')  # Get gym ID from request

            # Validate required fields
            if not all([first_name, last_name, email, phone, dob, password]):
                return JsonResponse({
                    'success': False,
                    'message': 'All fields are required'
                }, status=400)
                
            # Validate gym_id is provided
            if not gym_id:
                return JsonResponse({
                    'success': False,
                    'message': 'Gym ID is required'
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
            
            # Associate user with the gym by creating a gym membership record
            try:
                gym = Gym.objects.get(id=gym_id)
                
                # Create the gym membership entry in the "gym_memberships" table
                # Using the structure visible in the schema image: id, join_date, active, gym_id, user_id
                from django.db import connection
                with connection.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO gym_memberships (join_date, active, gym_id, user_id)
                        VALUES (%s, %s, %s, %s)
                    """, [
                        timezone.now().date(),  # join_date
                        True,                   # active
                        gym_id,                 # gym_id
                        user.id                 # user_id
                    ])
                
                return JsonResponse({
                    'success': True,
                    'message': 'Member registration successful',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'lastName': user.last_name,
                        'gym_id': gym_id
                    }
                })
            except Gym.DoesNotExist:
                # If gym doesn't exist, delete the user we just created
                user.delete()
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid gym ID'
                }, status=400)
            except Exception as e:
                # If there's an error creating the gym membership, delete the user and return an error
                user.delete()
                return JsonResponse({
                    'success': False,
                    'message': f'Error creating gym membership: {str(e)}'
                }, status=400)

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

@csrf_exempt
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
            gym_id = data.get("gym_id")  # Get gym_id from request
            
            logger.info(f"[{request_id}] Parsed request body. Email to check: {email}, Gym ID: {gym_id}")
            
            # Check if student exists
            logger.debug(f"[{request_id}] Querying database for student with email: {email}")
            query_start_time = time.time()
            student = Users.objects.filter(email=email).first()
            query_time = time.time() - query_start_time
            logger.debug(f"[{request_id}] Database query completed in {query_time:.4f}s")
            
            # Prepare response
            if student:
                logger.info(f"[{request_id}] Student found with email: {email}")
                response = {
                    "success": True, 
                    "exists": True, 
                    "message": "Student found",
                    "student": {
                        "id": student.id,
                        "email": student.email,
                        "firstName": student.first_name,
                        "lastName": student.last_name,
                    }
                }
                status_code = 200
            else:
                logger.warning(f"[{request_id}] Student not found with email: {email}")
                response = {"success": False, "exists": False, "message": "Student not found"}
                status_code = 404
            
            # Log response details
            total_time = time.time() - start_time
            logger.info(f"[{request_id}] Returning response with status: {status_code}, exists: {student is not None}, total processing time: {total_time:.4f}s")
            
            return JsonResponse(response, status=status_code)

        except json.JSONDecodeError as e:
            logger.error(f"[{request_id}] JSON decode error: {str(e)}")
            return JsonResponse({"success": False, "exists": False, "message": f"Invalid JSON: {str(e)}"}, status=400)
        except Exception as e:
            logger.error(f"[{request_id}] Unexpected error in check_student: {str(e)}", exc_info=True)
            return JsonResponse({"success": False, "exists": False, "message": "An error occurred while processing your request"}, status=400)
    else:
        logger.warning(f"[{request_id}] Method not allowed: {request.method}")
        return JsonResponse({"error": "Method not allowed"}, status=405)

@api_view(['GET'])
@permission_classes([AllowAny])  # Allow any user to access this endpoint for testing
def available_classes_today(request, gym_id=None):
    """Fetch only today's available classes for check-in."""
    today = localdate()  # Get today's date
    
    try:
        # Try to get cached data first, with gym_id in the cache key
        cache_key = f"available_classes_{today}_{gym_id}" if gym_id else f"available_classes_{today}"
        cached_classes = cache.get(cache_key)
        if cached_classes:
            return JsonResponse({"success": True, "classes": cached_classes}, status=200)

        # Base query - filter by date and not canceled
        query = Class.objects.filter(
            date=today,
            is_canceled=0,  # Only get non-canceled classes
            template__isnull=False,  # Only classes with a template
        )        
        # Add gym filter if gym_id is provided
        if gym_id:
            query = query.filter(template__gym_id=gym_id)
        
        # Get the classes with related data
        classes = query.select_related('template', 'template__level').order_by("start_time")

        data = []
        for cls in classes:
            try:
                # Get template and level information
                template = cls.template
                level_name = template.level.name if hasattr(template, 'level') and template.level else "All Levels"
                
                # Set attendance count to 0 instead of trying to query the missing table
                attendance_count = 0  # Skip the classattendance_set query that's causing errors
                                
                data.append({
                    "id": cls.id,
                    "name": template.name,
                    "startTime": cls.start_time.strftime("%H:%M"),
                    "endTime": cls.end_time.strftime("%H:%M"),
                    "level": level_name,
                    "maxCapacity": template.max_capacity,
                    "currentAttendance": attendance_count,
                    "description": template.description,
                    "notes": cls.notes,
                    "gymId": template.gym_id if hasattr(template, 'gym_id') else None
                })
            except Exception as e:
                # Log error but continue processing other classes
                print(f"Error processing class {cls.id}: {str(e)}")
                continue

        # Store in cache for 30 seconds
        cache.set(cache_key, data, timeout=30)
                
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
        
        # Skip attendance count query that would cause errors
        attendance_count = 0  # Avoid querying the missing classattendance_set
            
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
            "currentAttendance": attendance_count,
            "gymId": template.gym_id if hasattr(template, 'gym') else None,
        }
        
        # Add gym details if available
        if hasattr(template, 'gym') and template.gym:
            data["gymName"] = template.gym.name
        
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
    
@csrf_exempt
def checkin(request):
    """Handles student check-ins for a class."""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            class_id = data.get("classID")  # We still accept classID from frontend
            gym_id = data.get("gym_id")  # Get gym_id from request
            
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
                
            # Validate that the class belongs to the specified gym if gym_id is provided
            if gym_id and str(template.gym_id) != str(gym_id):
                return JsonResponse({
                    "success": False,
                    "message": "This class does not belong to the specified gym"
                }, status=400)

            # Create a check-in record in the checkin table
            try:
                gym = Gym.objects.get(id=gym_id) if gym_id else None
                
                # Create a new check-in record
                from .models import Checkin
                checkin_record = Checkin.objects.create(
                    user=student,
                    class_instance=class_instance,
                    gym=gym
                )
                print(f"Created check-in record with ID: {checkin_record.checkinID}")
            except Exception as create_error:
                print(f"Error creating check-in record: {str(create_error)}")
                # Continue with the response even if record creation fails
            
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

@api_view(['GET', 'POST'])
@csrf_exempt
@permission_classes([AllowAny])
def get_templates(request):
    """
    GET: Get all templates
    POST: Create a new template
    """
    if request.method == 'GET':
        try:
            # Get all templates
            templates = ClassTemplates.objects.all().select_related('level', 'gym')
            
            # Serialize the data
            data = []
            for template in templates:
                level_name = template.level.name if template.level else "All Levels"
                
                data.append({
                    "id": template.id,
                    "name": template.name,
                    "description": template.description,
                    "duration_minutes": template.duration_minutes,
                    "max_capacity": template.max_capacity,
                    "level_id": level_name,
                    "gym_id": template.gym.id if template.gym else None,
                    "gym_name": template.gym.name if template.gym else None
                })
            
            return JsonResponse(data, safe=False)
        except Exception as e:
            import traceback
            print(f"Error getting templates: {e}")
            print(traceback.format_exc())
            return JsonResponse({"error": str(e)}, status=500)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Get required fields
            name = data.get('name')
            level_id = data.get('level_id')
            
            if not name:
                return JsonResponse({"error": "Template name is required"}, status=400)
            
            # Get or create level
            level = None
            try:
                if level_id:
                    try:
                        # First try to get an existing level
                        level = ClassLevel.objects.get(name=level_id)
                        print(f"Found existing level: {level.name}")
                    except ClassLevel.DoesNotExist:
                        # If it doesn't exist, make sure we have at least one gym
                        gym = None
                        try:
                            gym = Gym.objects.first()
                        except:
                            # Create a default gym if none exists
                            gym = Gym.objects.create(
                                name="Default Gym",
                                email="default@example.com",
                                phone_number="555-555-5555"
                            )
                            print(f"Created default gym: {gym.name}")
                        
                        # Now create the level
                        level = ClassLevel.objects.create(
                            name=level_id,
                            description=f'{level_id} level',
                            gym=gym
                        )
                        print(f"Created new level: {level.name}")
            except Exception as e:
                print(f"Error handling level: {e}")
                # Use a default level or continue without one
            
            # Make sure we have a gym
            gym = None
            try:
                gym = Gym.objects.first()
            except:
                gym = Gym.objects.create(
                    name="Default Gym",
                    email="default@example.com",
                    phone_number="555-555-5555"
                )
                print(f"Created default gym: {gym.name}")
            
            # Create new template
            new_template = ClassTemplates.objects.create(
                name=name,
                description=data.get('description') or f"{name} template",
                duration_minutes=data.get('duration_minutes') or 60,
                max_capacity=data.get('max_capacity') or 20,
                level=level or ClassLevel.objects.first(),  # Default to first level if not specified
                gym=gym
            )
            
            print(f"Created new template: {new_template.name}")
            
            # Return the new template
            return JsonResponse({
                "id": new_template.id,
                "name": new_template.name,
                "description": new_template.description,
                "duration_minutes": new_template.duration_minutes,
                "max_capacity": new_template.max_capacity,
                "level_id": new_template.level.name if new_template.level else "All Levels",
                "gym_id": new_template.gym.id if new_template.gym else None,
                "gym_name": new_template.gym.name if new_template.gym else None
            }, status=201)
        except Exception as e:
            import traceback
            print(f"Error creating template: {e}")
            print(traceback.format_exc())
            return JsonResponse({"error": str(e)}, status=500)


@api_view(['DELETE'])
@csrf_exempt
@permission_classes([AllowAny])
def delete_template(request, template_id):
    """Delete a template by ID"""
    try:
        template = get_object_or_404(ClassTemplates, id=template_id)
        template.delete()
        return JsonResponse({"success": True, "message": "Template deleted successfully"})
    except Exception as e:
        import traceback
        print(f"Error deleting template {template_id}: {e}")
        print(traceback.format_exc())
        return JsonResponse({"error": str(e)}, status=500)


@api_view(['PUT'])
@csrf_exempt
@permission_classes([AllowAny])
def update_template(request, template_id):
    """Update a template by ID"""
    try:
        template = get_object_or_404(ClassTemplates, id=template_id)
        data = json.loads(request.body)
        
        # Update fields
        if 'name' in data:
            template.name = data['name']
        if 'description' in data:
            template.description = data['description']
        if 'duration_minutes' in data:
            template.duration_minutes = data['duration_minutes']
        if 'max_capacity' in data:
            template.max_capacity = data['max_capacity']
        if 'level_id' in data:
            # Get or create level
            try:
                level = ClassLevel.objects.get(name=data['level_id'])
            except ClassLevel.DoesNotExist:
                level = ClassLevel.objects.create(
                    name=data['level_id'],
                    description=f'{data["level_id"]} level',
                    gym=template.gym or Gym.objects.first()  # Use the same gym or default
                )
            template.level = level
            
        # Save the updated template
        template.save()
        
        # Return the updated template
        return JsonResponse({
            "id": template.id,
            "name": template.name,
            "description": template.description,
            "duration_minutes": template.duration_minutes,
            "max_capacity": template.max_capacity,
            "level_id": template.level.name if template.level else "All Levels",
            "gym_id": template.gym.id if template.gym else None,
            "gym_name": template.gym.name if template.gym else None
        })
    except Exception as e:
        import traceback
        print(f"Error updating template {template_id}: {e}")
        print(traceback.format_exc())
        return JsonResponse({"error": str(e)}, status=500)

@api_view(['GET'])
def get_gym_hours(request, gym_id=None):
    """
    Get gym hours for a specific gym
    If gym_id is not provided, uses the user's associated gym
    Returns hours for all days of the week
    """
    try:
        # Determine which gym to use
        if gym_id:
            gym = get_object_or_404(Gym, id=gym_id)
        else:
            # Use the user's gym if authenticated
            if request.user.is_authenticated:
                if hasattr(request.user, 'gym') and request.user.gym:
                    gym = request.user.gym
                elif hasattr(request.user, 'gym_id') and request.user.gym_id:
                    gym = get_object_or_404(Gym, id=request.user.gym_id)
                else:
                    # Fallback to first gym if no gym is associated
                    gym = Gym.objects.first()
                    if not gym:
                        return Response({
                            "success": False,
                            "message": "No gyms in the system"
                        }, status=404)
            else:
                # Not authenticated, use first gym
                gym = Gym.objects.first()
                if not gym:
                    return Response({
                        "success": False,
                        "message": "No gyms in the system"
                    }, status=404)
        
        # Get hours for this gym
        gym_hours = GymHours.objects.filter(gym=gym).order_by('day_of_week')
        
        # Format the response
        hours_data = []
        for hour in gym_hours:
            # Format the times as HH:MM strings
            open_time = hour.open_time.strftime('%H:%M') if hour.open_time else None
            close_time = hour.close_time.strftime('%H:%M') if hour.close_time else None
            
            hours_data.append({
                "day": hour.day_of_week,
                "open": open_time,
                "close": close_time,
                "is_closed": hour.is_closed if hasattr(hour, 'is_closed') else (open_time is None or close_time is None)
            })
        
        return Response({
            "success": True,
            "gym_id": gym.id,
            "gym_name": gym.name,
            "hours": hours_data
        })
        
    except Exception as e:
        import traceback
        print(f"Error getting gym hours: {e}")
        print(traceback.format_exc())
        return Response({
            "success": False,
            "message": str(e)
        }, status=500)
    

User = get_user_model()
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
  # ✅ optional but more secure
@api_view(["POST"])
def google_auth(request):
    token_str = request.data.get("id_token")
    if not token_str:
        return Response({"error": "ID token required"}, status=400)

    try:
        # 👇 Secure local verification
        idinfo = id_token.verify_oauth2_token(token_str, google_requests.Request(), audience=GOOGLE_CLIENT_ID)

        email = idinfo.get("email")
        first_name = idinfo.get("given_name", "")
        last_name = idinfo.get("family_name", "")
        phone = idinfo.get("phone_number", "")  # Optional if returned

        if not email:
            return Response({"error": "Email not in token"}, status=400)

        user = Users.objects.filter(email=email).first()

        if user:
            # Already registered → log them in and redirect
            user.backend = "django.contrib.auth.backends.ModelBackend"
            login(request, user)
            return Response({
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "firstName": user.first_name,
                    "lastName": user.last_name,
                },
                "new_user": False,
                "redirect": "/dashboard"
            })
        else:
            # Not registered yet → frontend should route to signup
            return Response({
                "new_user": True,
                "email": email,
                "first_name": first_name,
                "last_name": last_name
            })

    except ValueError as e:
        return Response({"error": "Invalid token", "details": str(e)}, status=401)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    print("request_password_reset() method runs")
    email = request.data.get("email")
    user = Users.objects.filter(email=email).first()
    if not user:
        return Response({"success": False, "message": "No user with that email."}, status=404)

    try:
        token = PasswordResetToken.objects.create(
            user=user,
            expires_at=now() + timedelta(hours=1)
        )
    except Exception as e:
        print("❌ TOKEN CREATION ERROR:", str(e))
        return Response({"success": False, "message": "Token creation failed."}, status=500)
    reset_url = f"http://localhost:3000/reset-password/{token.token}"

    try:
        send_mail(
            subject="Reset your RollTrack App password",
            message=f"Click the link to reset your password: {reset_url}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
        )
    except Exception as e:
        print("❌ EMAIL ERROR:", str(e))
        return Response({"success": False, "message": "Email sending failed."}, status=500)

    return Response({"success": True, "message": "Password reset link sent."})

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request, token):
    new_password = request.data.get("password")
    token_obj = PasswordResetToken.objects.filter(token=token).first()

    if not token_obj or token_obj.is_expired():
        return Response({"success": False, "message": "Invalid or expired token"}, status=400)

    user = token_obj.user
    user.set_password(new_password)
    user.save()
    token_obj.delete()
    return Response({"success": True, "message": "Password updated successfully"})

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def add_gym(request):
    """API endpoint to add a new gym to the database."""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            name = data.get("gymName")
            email = data.get("gymEmail")
            phone_number = data.get("gymPhoneNumber")
            address = data.get("address")
            city = data.get("city")
            state = data.get("state")
            schedule = data.get("schedule")
            
            # Get user ID from request.user (if authenticated) or from data
            user_id = None
            if request.user.is_authenticated:
                user_id = request.user.id
            elif data.get("userId"):
                user_id = data.get("userId")
            
            if not all([name, email, phone_number, address, city, state]):
                return JsonResponse({"success": False, "message": "Missing required fields"}, status=400)

            new_gym = Gym.objects.create(
                name=name,
                email=email,
                phone_number=phone_number
            )

            # Create the gym address
            gym_address = GymAddress.objects.create(
                street_line1=data.get("address"),
                street_line2=data.get("address2", ""),  # if you have a second address line
                city=data.get("city"),
                state=data.get("state"),
                postal_code=data.get("postal_code", ""),
                country=data.get("country", ""),
                gym=new_gym
            )

            # Create gym hours if provided
            if schedule:
                for entry in schedule:
                    day_of_week = entry.get("day")
                    open_time = entry.get("open_time")
                    close_time = entry.get("close_time")
                    is_closed = entry.get("is_closed", False)
                    GymHours.objects.create(
                        day_of_week=day_of_week,
                        open_time=open_time,
                        close_time=close_time,
                        is_closed=is_closed,
                        gym=new_gym
                    )
            
            # Associate user with the gym if user is authenticated
            if user_id:
                try:
                    # Update user to be a gym owner
                    user = Users.objects.get(id=user_id)
                    user.is_gym_owner = True
                    user.save()
                    
                    # Create the gym owner association
                    GymsOwners.objects.create(
                        user=user,
                        gym=new_gym
                    )
                    print(f"Created gym owner association for user {user_id} and gym {new_gym.id}")
                except Users.DoesNotExist:
                    print(f"User with ID {user_id} not found, could not create gym owner association")
                except Exception as e:
                    print(f"Error creating gym owner association: {str(e)}")

            return JsonResponse({
                "success": True,
                "message": "Gym added successfully",
                "gym": {
                    "id": new_gym.id,
                    "name": new_gym.name,
                    "email": new_gym.email,
                    "phone_number": new_gym.phone_number
                }
            }, status=201)

        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)}, status=400)
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def generate_qr(request, gym_id):
    try:
        # Generate QR code data
        # Use the frontend URL from settings instead of hardcoding
        frontend_url = settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else "http://localhost:3000"
        qr_data = f"{frontend_url}/checkin-selection?gym_id={gym_id}"
        qr = qrcode.QRCode(
            version=6,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        qr_img = qr.make_image(fill="black", back_color="white").convert("RGBA")

        # --- Add the logo ---
        # Path to your logo
        logo_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
            "frontend", "src", "assets", "logo.jpeg"
        )
        if os.path.exists(logo_path):
            logo = Image.open(logo_path).convert("RGBA")
            # Resize logo to fit in the QR code
            logo_size = (qr_img.size[0] // 4, qr_img.size[1] // 4)
            logo = logo.resize(logo_size, Image.LANCZOS)

            # Create a white border around the logo
            border_size = 10
            bordered_logo_size = (logo_size[0] + border_size * 2, logo_size[1] + border_size * 2)
            bordered_logo = Image.new("RGBA", bordered_logo_size, "white")
            bordered_logo.paste(logo, (border_size, border_size), logo)

            # Center the logo on the QR code
            pos = (
                (qr_img.size[0] - bordered_logo.size[0]) // 2,
                (qr_img.size[1] - bordered_logo.size[1]) // 2
            )
            mask = bordered_logo.split()[3] if bordered_logo.mode == "RGBA" else None
            qr_img.paste(bordered_logo, pos, mask)
        # --- End logo addition ---

        # Save to in-memory buffer
        buffer = io.BytesIO()
        qr_img.save(buffer, format="PNG")
        buffer.seek(0)

        return HttpResponse(buffer, content_type="image/png")
    except Exception as e:
        return JsonResponse({"success": False, "message": str(e)}, status=500)

