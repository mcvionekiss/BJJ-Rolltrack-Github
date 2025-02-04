from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
def homepage(request):
    return JsonResponse({"message": "Welcome to RollTrack Backend"})

def hello_world(request):
    return JsonResponse({"message": "Hello, world!"})

@csrf_exempt  # ✅ Disable CSRF for testing (Enable in production with proper security)
def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            password = data.get("password")

            # 🔽 Replace this with actual user authentication logic 🔽
            if email == "admin@admin.com" and password == "password":
                return JsonResponse({"success": True, "access_token": "mock_token"})
                response["Access-Control-Allow-Origin"] = "http://localhost:3000"  # ✅ Allow frontend access
                response["Access-Control-Allow-Credentials"] = "true"  # ✅ Needed for authentication
            else:
                return JsonResponse({"success": False, "message": "Invalid credentials"}, status=401)

        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=405)