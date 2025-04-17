// frontend/src/config.js - Configuration for API endpoints
// This file centralizes all API endpoint configurations
// Hardcoded for production use

// Hardcoded production API URL
const API_URL = 'https://rolltrackapp.com/api';

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