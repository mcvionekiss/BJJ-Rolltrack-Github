// frontend/src/config.js - Configuration for API endpoints
// This file centralizes all API endpoint configurations to make environment switching easier

// The environment determines which API base URL to use
// In a production build, this would use the deployed API URL
// For staging and local development, it uses the appropriate servers

// Read from environment variables with fallbacks
// REACT_APP_API_URL should be set in your .env files or deployment environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Export configuration with all API endpoints
const config = {
  apiUrl: API_URL,
  endpoints: {
    auth: {
      csrf: `${API_URL}/auth/csrf/`,
      login: `${API_URL}/auth/login/`,
      register: `${API_URL}/auth/register/`,
      logout: `${API_URL}/auth/logout/`
    },
    api: {
      checkStudent: `${API_URL}/api/check_student/`,
      availableClasses: `${API_URL}/api/available_classes_today/`,
      classDetails: (classID) => `${API_URL}/api/class_details/${classID}/`,
      checkin: `${API_URL}/api/checkin/`
    }
  }
};

export default config;