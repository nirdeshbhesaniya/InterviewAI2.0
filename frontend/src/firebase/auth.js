// Firebase Authentication Helper Functions
// Handles all Firebase auth operations with email verification

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config';

/**
 * Register a new user with email and password
 * Automatically sends verification email after successful registration
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} - User credential object
 */
export const registerWithEmailPassword = async (email, password) => {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Send verification email immediately after registration
    await sendEmailVerification(userCredential.user, {
      // Customize the email verification link (optional)
      url: window.location.origin + '/dashboard', // Redirect after verification
      handleCodeInApp: false
    });
    
    return {
      success: true,
      user: userCredential.user,
      message: 'Verification email sent! Please check your inbox.'
    };
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Login user with email and password
 * Checks email verification status before allowing login
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} - User credential object
 */
export const loginWithEmailPassword = async (email, password) => {
  try {
    // Sign in user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if email is verified
    if (!user.emailVerified) {
      // Sign out user immediately if email not verified
      await signOut(auth);
      
      throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
    }
    
    return {
      success: true,
      user: user,
      message: 'Login successful!'
    };
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Resend verification email to current user
 * @returns {Promise<Object>} - Success message
 */
export const resendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    
    if (user.emailVerified) {
      throw new Error('Email is already verified');
    }
    
    await sendEmailVerification(user, {
      url: window.location.origin + '/dashboard',
      handleCodeInApp: false
    });
    
    return {
      success: true,
      message: 'Verification email sent! Please check your inbox.'
    };
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return {
      success: true,
      message: 'Logged out successfully'
    };
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Listen to authentication state changes
 * @param {Function} callback - Callback function to handle user state
 * @returns {Function} - Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user && user.emailVerified) {
      // User is signed in and email is verified
      callback(user);
    } else if (user && !user.emailVerified) {
      // User is signed in but email is not verified
      callback(null); // Treat as not authenticated
    } else {
      // User is signed out
      callback(null);
    }
  });
};

/**
 * Get current authenticated user
 * @returns {Object|null} - Current user or null
 */
export const getCurrentUser = () => {
  const user = auth.currentUser;
  
  // Only return user if email is verified
  if (user && user.emailVerified) {
    return user;
  }
  
  return null;
};

/**
 * Handle Firebase authentication errors
 * Converts Firebase error codes to user-friendly messages
 * @param {Object} error - Firebase error object
 * @returns {Error} - Formatted error
 */
const handleAuthError = (error) => {
  let message = error.message;
  
  // Map Firebase error codes to user-friendly messages
  switch (error.code) {
    case 'auth/email-already-in-use':
      message = 'This email is already registered. Please login instead.';
      break;
    case 'auth/weak-password':
      message = 'Password should be at least 6 characters long.';
      break;
    case 'auth/invalid-email':
      message = 'Please enter a valid email address.';
      break;
    case 'auth/user-not-found':
      message = 'No account found with this email.';
      break;
    case 'auth/wrong-password':
      message = 'Incorrect password. Please try again.';
      break;
    case 'auth/too-many-requests':
      message = 'Too many failed attempts. Please try again later.';
      break;
    case 'auth/network-request-failed':
      message = 'Network error. Please check your internet connection.';
      break;
    case 'auth/invalid-credential':
      message = 'Invalid email or password. Please try again.';
      break;
    default:
      // Use the default message if no specific case matches
      break;
  }
  
  return new Error(message);
};

export default {
  registerWithEmailPassword,
  loginWithEmailPassword,
  resendVerificationEmail,
  logoutUser,
  onAuthStateChange,
  getCurrentUser
};
