import axios from 'axios';

const axiosInstance = axios.create({
  // baseURL: 'https://interviewai2-0sever.onrender.com/api',
  // baseURL: "http://localhost:8080/api",
  // baseURL: "http://104.43.106.43:8080/api",
  baseURL: "https://api.interviewai.tech/api",
  headers: {
    'Content-Type': 'application/json',
  },
});


// Add a request interceptor to include user email for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (user) {
      const userData = JSON.parse(user);
      config.headers['user-email'] = userData.email;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
