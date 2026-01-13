import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import SystemAdminDashboard from './components/SystemAdminDashboard';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SystemAdminDashboard />
      </AuthProvider>
    </Router>
  );
};

export default App;
