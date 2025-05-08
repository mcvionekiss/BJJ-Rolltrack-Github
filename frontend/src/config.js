// frontend/src/config.js - Dynamic configuration for development and testing
// This file provides flexible URL configuration that works with both localhost and IP addresses

// Helper function to join URL paths without double slashes
const joinPaths = (...parts) => {
  return parts
    .map(part => part.replace(/^\/+|\/+$/g, '')) // Remove leading/trailing slashes
    .filter(part => part.length > 0)              // Remove empty segments
    .join('/');
};

// Parse API URL from environment variable or use localhost as fallback
const parseApiUrl = (url) => {
  if (!url) return 'http://localhost:8000';
  // Remove trailing slash for consistency
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

// Use environment variable with dynamic fallback
const BASE_URL = parseApiUrl(process.env.REACT_APP_API_URL || window.location.origin.replace(/:\d+$/, '') + ':8000');

// For debugging - log base URL to help troubleshoot path issues
console.log('[CONFIG] Using API base URL:', BASE_URL);

// Export configuration with all API endpoints
const config = {
  apiUrl: BASE_URL,
  endpoints: {
    auth: {
      checkinSelection: (gymID) => `${BASE_URL}/auth/checkin-selection/?gym_id=${gymID}`,
      guestCheckin: `${BASE_URL}/auth/guest-checkin/`,
      memberSignup: `${BASE_URL}/auth/member-signup/`,
      register: `${BASE_URL}/auth/register/`,
      addGym: `${BASE_URL}/auth/add-gym/`,
      logout: `${BASE_URL}/auth/logout/`,
      login: `${BASE_URL}/auth/login/`,
      csrf: `${BASE_URL}/auth/csrf/`,
      resetPassword: (token) => `${BASE_URL}/auth/reset-password/${token}/`,
    },
    api: {
      classDetails: (classID) => `${BASE_URL}/api/class_details/${classID}/`,
      generateQR: (gymID) => `${BASE_URL}/api/generate-qr/${gymID}/`,
      availableClasses: (gymID) => `${BASE_URL}/api/available_classes_today/${gymID}/`,
      gymHours: (gymID) => `${BASE_URL}/api/gym-hours/${gymID}/`,
      checkStudent: `${BASE_URL}/api/check_student/`,
      getTemplates: `${BASE_URL}/api/templates/`,
      getGymHours: `${BASE_URL}/api/gym-hours/`,
      checkin: `${BASE_URL}/api/checkin/`,
      todayAttendance: `${BASE_URL}/api/get-every-class-for-today-with-attendance/`,
      yesterdayAttendance: `${BASE_URL}/api/total-yesterday-attendance/`,
      weeklyAttendance: `${BASE_URL}/api/total-weekly-attendance/`,
      lastWeekAttendance: `${BASE_URL}/api/total-last-week-attendance/`,
      monthlyAttendance: `${BASE_URL}/api/total-monthly-attendance/`,
      lastMonthAttendance: `${BASE_URL}/api/total-last-month-attendance/`,
      todayCategoryAttendance: `${BASE_URL}/api/total-category-attendance-today/`,
      weekCategoryAttendance: `${BASE_URL}/api/total-category-attendance-week/`,
      monthCategoryAttendance: `${BASE_URL}/api/total-category-attendance-month/`,
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