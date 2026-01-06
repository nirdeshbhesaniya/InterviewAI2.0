import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const UserContext = createContext();

// Custom hook to use UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  // State for user data
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  // Update localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user]);

  // Logout function
  const logout = async (navigate) => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    if (navigate) {
      navigate('/');
    }
  };

  // Sync user data with backend on mount
  useEffect(() => {
    const syncUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { default: axios } = await import('../utils/axiosInstance');
          const { API } = await import('../utils/apiPaths');
          const res = await axios.get(API.PROFILE.GET);
          if (res.data.success) {
            setUser(prev => ({ ...prev, ...res.data.data.user }));
          }
        } catch (error) {
          console.error('Failed to sync user data:', error);
          if (error.response?.status === 401 || error.response?.status === 403) {
            logout();
          }
        }
      }
    };

    syncUser();

    // Heartbeat to check user status every 30 seconds
    // This ensures banned users are auto-logged out even without page refresh
    const intervalId = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        syncUser();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

