import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000', // Backend API URL
  // You can set headers here if needed
});

export default axiosInstance;
