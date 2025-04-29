// frontend/src/config.js - Simplified configuration for testing
// This file provides hardcoded URLs instead of environment variables

// Use hardcoded localhost URL for simplified testing
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/';

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