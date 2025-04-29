// frontend/src/config.js - Dynamic configuration for development and testing
// This file provides flexible URL configuration that works with both localhost and IP addresses

// Parse API URL from environment variable or use localhost as fallback
// Remove trailing slashes for consistency
const parseApiUrl = (url) => {
  if (!url) return 'http://localhost:8000/';
  return url.endsWith('/') ? url : `${url}/`;
};

// Use environment variable with dynamic fallback
const API_URL = parseApiUrl(process.env.REACT_APP_API_URL || window.location.origin.replace(/:\d+$/, '') + ':8000/');

// Export configuration with all API endpoints
const config = {
  apiUrl: API_URL,
  endpoints: {
    auth: {
      checkinSelection: (gymID) => `${API_URL}/auth/checkin-selection/?gym_id=${gymID}`,
      guestCheckin: `${API_URL}/auth/guest-checkin/`,
      memberSignup: `${API_URL}/auth/member-signup/`,
      register: `${API_URL}/auth/register/`,
      addGym: `${API_URL}/auth/add-gym/`,
      logout: `${API_URL}/auth/logout/`,
      login: `${API_URL}/auth/login/`,
      csrf: `${API_URL}/auth/csrf/`,
    },
    api: {
      classDetails: (classID) => `${API_URL}/api/class_details/${classID}/`,
      generateQR: (gymID) => `${API_URL}/api/generate-qr/${gymID}/`,
      availableClasses: `${API_URL}/api/available_classes_today/`,
      gymHours: (gymID) => `${API_URL}/api/gym-hours/${gymID}/`,
      checkStudent: `${API_URL}/api/check_student/`,
      getTemplates: `${API_URL}/api/templates/`,
      getGymHours: `${API_URL}/api/gym-hours/`,
      checkin: `${API_URL}/api/checkin/`,
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