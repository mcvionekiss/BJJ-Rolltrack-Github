import axios from 'axios';

// Set default base URL for all axios requests
axios.defaults.baseURL = 'http://localhost:8000';

// Enable sending cookies with cross-origin requests
axios.defaults.withCredentials = true;

export default axios; 
