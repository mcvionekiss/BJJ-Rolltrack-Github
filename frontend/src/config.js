/**
 * Application Configuration
 *
 * This file centralizes all configuration settings for the application.
 * It uses environment variables with fallbacks for development.
 */

// API URL - Backend server URL
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Public URL - Frontend URL (for QR codes, etc.)
export const PUBLIC_URL = process.env.REACT_APP_PUBLIC_URL || 'http://localhost:3000';

// Environment (development, staging, production)
export const ENV = process.env.REACT_APP_ENV || 'development';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    CSRF: `${API_URL}/auth/csrf/`,
    LOGIN: `${API_URL}/auth/login/`,
    LOGOUT: `${API_URL}/auth/logout/`,
    REGISTER: `${API_URL}/auth/register/`,
    GYM_OWNER_REGISTER: `${API_URL}/auth/gym_owner_registration/`,
  },
  // Student endpoints
  STUDENT: {
    CHECK: `${API_URL}/check-student/`,
    CHECKIN: `${API_URL}/checkin/`,
  },
  // Class endpoints
  CLASS: {
    AVAILABLE: `${API_URL}/available-classes/`,
    DETAILS: (id) => `${API_URL}/class-details/${id}/`,
    ADD: `${API_URL}/add-class/`,
  },
};

// QR Code URL
export const QR_CODE_URL = `${PUBLIC_URL}/checkin`;

// Is Production Environment
export const IS_PRODUCTION = ENV === 'production';

// Is Development Environment
export const IS_DEVELOPMENT = ENV === 'development';

// Is Staging Environment
export const IS_STAGING = ENV === 'staging';
