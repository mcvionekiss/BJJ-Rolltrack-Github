@echo off
:: Windows batch script for running BJJ-Rolltrack in test mode
:: This is a Windows-compatible version of run-test.sh

:: Enable command extensions
SETLOCAL ENABLEEXTENSIONS

:: Set text colors
set BOLD=
set GREEN=92m
set YELLOW=93m
set RED=91m
set NC=0m

:: Function to print colored text (using ANSI escape sequences - works in newer Windows versions)
:: Usage: call :printColored "message" "color"
:printColored
echo [%~2%~1[%NC%
goto :eof

:: Title
echo BJJ-Rolltrack Test Runner
echo This script will run the application in test mode.
echo.

:: Check if Docker is installed
where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    call :printColored "Error: Docker is not installed or not in PATH" "%RED%"
    pause
    exit /b 1
)

:: Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    call :printColored "Error: Docker daemon is not running" "%RED%"
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

:: Check which Docker Compose command to use
where docker-compose >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    call :printColored "Warning: docker-compose not found, trying Docker Compose plugin..." "%YELLOW%"
    
    docker compose version >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        call :printColored "Error: Neither docker-compose nor Docker Compose plugin found" "%RED%"
        pause
        exit /b 1
    ) else (
        set COMPOSE_CMD=docker compose
    )
) else (
    set COMPOSE_CMD=docker-compose
)

:: Start the test environment
echo.
call :printColored "Starting test environment..." "%BOLD%"
echo Using regular docker-compose.yml with simplified configuration

:: Stop any running containers first
%COMPOSE_CMD% down
:: Start the containers
%COMPOSE_CMD% up -d

if %ERRORLEVEL% NEQ 0 (
    call :printColored "Failed to start test environment" "%RED%"
    pause
    exit /b 1
)

:: Get IP address for instructions (using ipconfig)
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP_ADDRESS=%%a
    goto :found_ip
)
:found_ip
:: Trim spaces from IP
set IP_ADDRESS=%IP_ADDRESS:~1%
if "%IP_ADDRESS%"=="" set IP_ADDRESS=localhost

:: Display success message
echo.
call :printColored "Test environment started successfully!" "%GREEN%"
echo.
call :printColored "Access the application:" "%BOLD%"
call :printColored "Frontend: http://%IP_ADDRESS%:3000" "%GREEN%"
call :printColored "Backend API: http://%IP_ADDRESS%:8000" "%GREEN%"
call :printColored "API docs: http://%IP_ADDRESS%:8000/health/" "%GREEN%"

:: Display configuration info
echo.
call :printColored "Test Configuration:" "%BOLD%"
echo - Using hardcoded URLs in config.js
echo - HTTPS requirements are bypassed
echo - Login with any test credentials (test mode)

:: Stop instructions
echo.
call :printColored "To stop the test environment:" "%BOLD%"
echo %COMPOSE_CMD% down

echo.
echo Press any key to exit...
pause >nul

exit /b 0