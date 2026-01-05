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

// Add a response interceptor to handle authentication errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle blocked/banned users (403) or unauthorized access (401)
      if (status === 401 || (status === 403 && data?.isBanned)) {
        // Clear local storage
        localStorage.removeItem('user');
        localStorage.removeItem('token');

        // Dispatch a custom event so the UI (like Header/UserContext) can react immediately
        window.dispatchEvent(new Event('auth:logout'));

        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
