import axios from 'axios';

const axiosInstance = axios.create({
  // baseURL: 'https://interviewai2-0sever.onrender.com/api',
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include user email for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      config.headers['user-email'] = userData.email;
      console.log('Axios interceptor - sending user email:', userData.email);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
