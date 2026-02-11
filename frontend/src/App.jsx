// AssetFlow Frontend Application - Main Entry Point
// Handles routing, authentication, and global state management

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import HomePage from './components/HomePage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/Toast';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? `${window.location.origin}/api`
  : `http://${window.location.hostname}:5000`;

/**
 * AdminViewRoute Component
 * Auto-logs in with school admin credentials when accessed with school_id
 */
const AdminViewRoute = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const schoolId = searchParams.get('school_id');
  const hasRequested = useRef(false);

  useEffect(() => {
    const autoLogin = async () => {
      if (!schoolId || hasRequested.current) {
        if (!schoolId) {
          setError('No school ID provided');
          setLoading(false);
        }
        return;
      }

      hasRequested.current = true;
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/school-admin/${schoolId}`);
        login(response.data.user, response.data.token);
        // Force a small delay to ensure state is updated
        setTimeout(() => setLoading(false), 100);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load school admin');
        setLoading(false);
        hasRequested.current = false; // Reset on error to allow retry
      }
    };

    autoLogin();
  }, [schoolId]); // Remove login dependency

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading school admin...</div>;
  if (error) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>
      {error}
      <br />
      <button onClick={() => { hasRequested.current = false; setError(null); setLoading(true); }} style={{ marginTop: '10px' }}>
        Retry
      </button>
    </div>
  );
  return <Dashboard />;
};

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
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <HomePage onGetStarted={() => window.location.href = '/login'} />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin-view" element={<AdminViewRoute />} />
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