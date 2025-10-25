// Authentication Context - Global state management for user authentication
// Provides user data, login/logout functions, and role-based permissions

import { createContext, useContext, useState, useEffect } from 'react';

// Create authentication context for global state sharing
const AuthContext = createContext();

/**
 * Custom hook to access authentication context
 * Ensures components are wrapped in AuthProvider before using auth features
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * Authentication Provider Component
 * Manages user authentication state and provides auth functions to child components
 * Handles token persistence and automatic login restoration
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);      // Current authenticated user data
  const [loading, setLoading] = useState(true); // Loading state during auth check

  // Restore authentication state from localStorage on app startup
  useEffect(() => {
    const token = localStorage.getItem('token');     // JWT token for API requests
    const userData = localStorage.getItem('user');   // User profile data
    
    // Auto-login if valid token and user data exist
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false); // Authentication check complete
  }, []);

  /**
   * Login function - stores user data and token for persistent authentication
   * @param {Object} userData - User profile information from server
   * @param {string} token - JWT token for API authentication
   */
  const login = (userData, token) => {
    localStorage.setItem('token', token);                    // Store JWT for API requests
    localStorage.setItem('user', JSON.stringify(userData));  // Store user profile data
    setUser(userData);                                       // Update React state
  };

  /**
   * Logout function - clears all authentication data
   * Removes tokens and user data from both localStorage and React state
   */
  const logout = () => {
    localStorage.removeItem('token');  // Clear JWT token
    localStorage.removeItem('user');   // Clear user profile
    setUser(null);                     // Clear React state
  };

  // Context value object with authentication state and helper functions
  const value = {
    user,                                                    // Current user object
    login,                                                   // Login function
    logout,                                                  // Logout function
    loading,                                                 // Loading state
    
    // Role-based permission helpers for UI conditional rendering
    isAdmin: user?.role === 'admin',                         // Full system access
    isManager: user?.role === 'manager',                     // Equipment management access
    isTeacher: user?.role === 'teacher',                     // Enhanced user access
    canManage: ['teacher', 'manager', 'admin'].includes(user?.role), // Can approve requests
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};