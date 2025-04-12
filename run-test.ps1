# Windows PowerShell script for running BJJ-Rolltrack in test mode
# This is a Windows PowerShell-compatible version of run-test.sh

# Define text colors using ANSI escape sequences (works in modern PowerShell)
$ESC = [char]27
$BOLD = "$ESC[1m"
$GREEN = "$ESC[0;32m"
$YELLOW = "$ESC[0;33m"
$RED = "$ESC[0;31m"
$NC = "$ESC[0m" # No Color

# Title
Write-Host "${BOLD}BJJ-Rolltrack Test Runner${NC}"
Write-Host "This script will run the application in test mode."
Write-Host ""

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "Docker installed: $dockerVersion"
} catch {
    Write-Host "${RED}Error: Docker is not installed or not in PATH${NC}" -ForegroundColor Red
    Write-Host "Please install Docker Desktop for Windows and try again."
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Docker is running
try {
    $null = docker info
} catch {
    Write-Host "${RED}Error: Docker daemon is not running${NC}" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again."
    Read-Host "Press Enter to exit"
    exit 1
}

# Check which Docker Compose command to use
$composeCmd = $null
try {
    $null = docker-compose --version
    $composeCmd = "docker-compose"
} catch {
    Write-Host "${YELLOW}Warning: docker-compose not found, trying Docker Compose plugin...${NC}" -ForegroundColor Yellow
    
    try {
        $null = docker compose version
        $composeCmd = "docker compose"
    } catch {
        Write-Host "${RED}Error: Neither docker-compose nor Docker Compose plugin found${NC}" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Start the test environment
Write-Host ""
Write-Host "${BOLD}Starting test environment...${NC}"
Write-Host "Using regular docker-compose.yml with simplified configuration"

# Run the application in test mode
Invoke-Expression "$composeCmd down"
Invoke-Expression "$composeCmd up -d"

if ($LASTEXITCODE -ne 0) {
    Write-Host "${RED}Failed to start test environment${NC}" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Get IP address
$ipConfig = ipconfig
$ipAddress = ($ipConfig | Select-String -Pattern "IPv4 Address" | Select-Object -First 1) -replace ".*: "
if ([string]::IsNullOrWhiteSpace($ipAddress)) {
    $ipAddress = "localhost"
}

# Display success message
Write-Host ""
Write-Host "${GREEN}Test environment started successfully!${NC}" -ForegroundColor Green
Write-Host ""
Write-Host "${BOLD}Access the application:${NC}"
Write-Host "Frontend: ${GREEN}http://$ipAddress`:3000${NC}" -ForegroundColor Green
Write-Host "Backend API: ${GREEN}http://$ipAddress`:8000${NC}" -ForegroundColor Green
Write-Host "API docs: ${GREEN}http://$ipAddress`:8000/health/${NC}" -ForegroundColor Green

# Display configuration info
Write-Host ""
Write-Host "${BOLD}Test Configuration:${NC}"
Write-Host "- Using hardcoded URLs in config.js"
Write-Host "- HTTPS requirements are bypassed"
Write-Host "- Login with any test credentials (test mode)"

# Stop instructions
Write-Host ""
Write-Host "${BOLD}To stop the test environment:${NC}"
Write-Host "$composeCmd down"

Write-Host ""
Read-Host "Press Enter to exit"