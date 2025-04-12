// test-config.js - Simple configuration for testing environments
// This file provides a straightforward configuration without environment variables

// Use either localhost or your actual machine's IP address for testing
const TEST_API_URL = 'http://localhost:8000';
// If testing from other devices on your network, uncomment and use your machine's IP:
// const TEST_API_URL = 'http://YOUR_IP_ADDRESS:8000';

const config = {
  apiUrl: TEST_API_URL,
  endpoints: {
    auth: {
      csrf: `${TEST_API_URL}/auth/csrf/`,
      login: `${TEST_API_URL}/auth/login/`,
      register: `${TEST_API_URL}/auth/register/`,
      logout: `${TEST_API_URL}/auth/logout/`
    },
    api: {
      checkStudent: `${TEST_API_URL}/api/check_student/`,
      availableClasses: `${TEST_API_URL}/api/available_classes_today/`,
      classDetails: `${TEST_API_URL}/api/class_details/`,
      checkin: `${TEST_API_URL}/api/checkin/`
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