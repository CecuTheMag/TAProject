// AssetFlow Frontend Application - Main Entry Point
// Handles routing, authentication, and global state management

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import HomePage from './components/HomePage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/Toast';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) return <div>🔥 HOT RELOAD WORKING! Loading...</div>;
  
  // Redirect to login if not authenticated, otherwise render children
  return user ? children : <Navigate to="/login" />;
};

/**
 * AppContent Component
 * Defines the main application routes and navigation logic
 */
const AppContent = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Landing page - shows HomePage if not authenticated, redirects to dashboard if authenticated */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <HomePage onGetStarted={() => window.location.href = '/login'} />} />
      
      {/* Login route - redirects to dashboard if already authenticated */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
      
      {/* Main dashboard route - protected, requires authentication */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

/**
 * Main App Component
 * Sets up global providers and error boundaries
 * Provides authentication context and routing to entire application
 */
function App() {
  return (
    <ErrorBoundary> {/* Catches and displays React errors gracefully */}
      <AuthProvider> {/* Provides authentication state to all components */}
        <Router> {/* Enables client-side routing */}
          <AppContent /> {/* Main application routes */}
          <ToastContainer /> {/* Global notification system */}
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App