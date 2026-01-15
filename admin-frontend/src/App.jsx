import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import SystemAdminDashboard from './components/SystemAdminDashboard';
import Login from './components/Login';
import LoadingSpinner from './components/LoadingSpinner';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user || !user.is_system_admin) return <Login />;
  return <SystemAdminDashboard />;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
