import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001', // Backend API URL
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage or any other storage
    const token = localStorage.getItem('token');
    if (token) {
      // Attach token to Authorization header
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle error
    return Promise.reject(error);
  }
);

export default axiosInstance;
