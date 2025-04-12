// frontend/src/config.js - Simplified configuration for testing
// This file provides hardcoded URLs instead of environment variables

// Use hardcoded localhost URL for simplified testing
const API_URL = 'http://localhost:8000';
// If testing from other devices on your network, uncomment and use your machine's IP:
// const API_URL = 'http://YOUR_IP_ADDRESS:8000';

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
  },
  
  // Testing-specific settings
  testing: {
    bypassAuth: false,  // Set to true to bypass authentication in frontend for testing
    mockData: false,    // Set to true to use mock data instead of API calls
    debugMode: true     // Enable detailed console logging
  }
};

export default config;