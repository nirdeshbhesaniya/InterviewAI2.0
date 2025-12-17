import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChange, logoutUser } from '../firebase/auth';

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
  
  // Loading state for authentication check
  const [authLoading, setAuthLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        // User is authenticated and email is verified
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // User is not authenticated or email not verified
        setUser(null);
        localStorage.removeItem('user');
      }
      
      setAuthLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

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
    try {
      await logoutUser();
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      if (navigate) {
        navigate('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, authLoading }}>
      {children}
    </UserContext.Provider>
  );
};

