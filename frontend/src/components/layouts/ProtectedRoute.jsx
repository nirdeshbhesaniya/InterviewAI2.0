// src/components/layouts/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

/**
 * Protected Route Component
 * Ensures user is authenticated AND email is verified before granting access
 * 
 * Requirements:
 * 1. User must be logged in
 * 2. User's email must be verified
 * 
 * If either condition fails, redirects to home page
 */
const ProtectedRoute = ({ children }) => {
  const { user, authLoading } = useContext(UserContext);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-body))]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[rgb(var(--text-muted))]">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user exists and email is verified
  if (!user || !user.emailVerified) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
