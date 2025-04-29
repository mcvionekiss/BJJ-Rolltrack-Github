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
      csrf: `${API_URL}/auth/csrf/`,
      login: `${API_URL}/auth/login/`,
      register: `${API_URL}/auth/register/`,
      logout: `${API_URL}/auth/logout/`
    },
    api: {
      checkStudent: `${API_URL}/api/check_student/`,
      availableClasses: `${API_URL}/api/available_classes_today/`,
      classDetails: (classID) => `${API_URL}/api/class_details/${classID}/`,
      checkin: `${API_URL}/api/checkin/`,
      addGym: `${API_URL}/auth/add-gym/`,
      generateQR: (gymID) => `${API_URL}/auth/generate-qr/${gymID}/`,
      getTemplates: `${API_URL}/api/templates/`,
      checkinSelection: (gymID) => `${API_URL}/auth/checkin-selection/?gym_id=${gymID}`,
      guestCheckin: `${API_URL}/auth/guest-checkin/`,
      memberSignup: `${API_URL}/auth/member-signup/`,
      gymHours: (gymID) => `${API_URL}/api/gym-hours/${gymID}/`,
      gymHours: `${API_URL}/api/gym-hours/`,
      getGymHours: `${API_URL}/api/gym-hours/`,
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