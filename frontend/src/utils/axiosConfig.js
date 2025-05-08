import axios from 'axios';
import config from '../config';

// Create a pre-configured axios instance with default settings
const instance = axios.create({
  baseURL: config.apiUrl || 'http://localhost:8000/api/',
  timeout: 10000,
  withCredentials: true, // Enable sending cookies with requests
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor for authentication tokens if needed
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Redirect to login or refresh token
      console.log('Authentication error - redirecting to login');
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default instance;