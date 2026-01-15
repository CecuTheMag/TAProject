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
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(userData));
    setUser(userData);
  };

  /**
   * Logout function - clears all authentication data
   * Removes tokens and user data from both localStorage and React state
   */
  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
  };

  /**
   * Update user function - updates user data while preserving authentication
   * @param {Object} updatedUserData - Updated user profile information
   */
  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    localStorage.setItem('admin_user', JSON.stringify(newUserData));
    setUser(newUserData);
  };

  // Context value object with authentication state and helper functions
  const value = {
    user,                                                    // Current user object
    login,                                                   // Login function
    logout,                                                  // Logout function
    updateUser,                                              // Update user function
    loading,                                                 // Loading state
    
    // Role-based permission helpers for UI conditional rendering
    isSystemAdmin: user?.is_system_admin === true,          // System-wide admin access
    isAdmin: user?.role === 'admin',                         // School admin access
    isManager: user?.role === 'manager',                     // Equipment management access
    isTeacher: user?.role === 'teacher',                     // Enhanced user access
    canManage: ['teacher', 'manager', 'admin'].includes(user?.role) || user?.is_system_admin, // Can approve requests
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};