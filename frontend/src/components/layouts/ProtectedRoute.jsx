// src/components/layouts/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

/**
 * Protected Route Component
 * Ensures user is authenticated before granting access
 */
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(UserContext);

  // Check if user exists
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
