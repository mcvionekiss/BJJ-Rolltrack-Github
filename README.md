# BJJ-Rolltrack Application

A web application for Brazilian Jiu Jitsu gym management, allowing student check-ins, class scheduling, and attendance tracking.

## Simplified Testing Setup

This application has been configured with a simplified setup for easier testing and development:

- **Hardcoded URLs**: No environment variables needed
- **Development Mode**: Easier debugging with source maps and hot reloading
- **Built-in Testing Tools**: Debugging helpers included
- **Cross-Platform Scripts**: Run on Windows, Mac, or Linux

## Key Features

- React frontend with hardcoded API configuration
- Django backend with REST API
- Docker-based deployment
- MySQL database support
- Built-in testing configuration
- Production-ready security measures

## Project Structure

```
├── backend/                 # Django backend application
│   ├── server/              # Main application
│   │   ├── settings/        # Environment-specific settings
│   │   │   ├── __init__.py  # Settings loader
│   │   │   ├── local.py     # Development settings
│   │   │   ├── staging.py   # Staging settings
│   │   │   └── production.py # Production settings
│   │   ├── views.py         # API endpoints
│   │   └── urls.py          # URL routing
│   ├── Dockerfile           # Backend Docker configuration
│   └── docker-entrypoint.sh # Backend startup script
│
├── frontend/                # React frontend application
│   ├── src/                 # React source code
│   │   ├── components/      # React components
│   │   └── config.js        # API configuration with hardcoded URLs
│   └── Dockerfile           # Frontend Docker configuration
│
├── docker-compose.yml             # Main compose file
├── docker-compose.staging.yml     # Staging compose file (optional)
├── run-test.sh                    # Helper script for testing (Linux/Mac)
├── run-test.bat                   # Helper script for testing (Windows cmd)
├── run-test.ps1                   # Helper script for testing (Windows PowerShell)
```

## Quick Start

```bash
# Start the application with a single command
docker-compose up -d
```

That's it! The application uses hardcoded configurations for simplicity.

## Accessing the Application

Once running, you can access the application at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Health Check**: http://localhost:8000/health/

If testing from other devices on your network, use your machine's IP address instead of localhost.

## Helper Scripts

For even easier testing, use the included script for your platform:

### Linux/Mac
```bash
# Make the script executable
chmod +x run-test.sh

# Run the test environment
./run-test.sh
```

### Windows - Command Prompt
```cmd
# Simply double-click the run-test.bat file, or run:
run-test.bat
```

### Windows - PowerShell
```powershell
# You may need to adjust execution policy first
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# Run the test script
.\run-test.ps1
```

## Testing From Other Devices

If you need to test from another device on your network:

1. Find your machine's IP address (e.g., 192.168.1.100)
2. Edit `frontend/src/config.js` to use your IP instead of localhost
3. Restart the containers: `docker-compose down && docker-compose up -d`
4. Access from the other device using http://YOUR_IP_ADDRESS:3000

## Staging and Production

For staging and production deployment:

1. Create appropriate environment files (.env.staging, .env.production)
2. Deploy using the docker-compose.staging.yml file:
   ```bash
   docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d
   ```

## Additional Documentation

For more detailed information, see:

- [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment instructions
- [TECHNICAL_GUIDE.md](TECHNICAL_GUIDE.md) - Technical details and architecture
- [TEST_README.md](TEST_README.md) - Detailed testing guide