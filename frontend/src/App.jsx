import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return user ? children : <Navigate to="/login" />;
};

const AppContent = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      {user && (
        <nav style={{ padding: '10px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
          <span>Welcome, {user.username} ({user.role})</span>
          <button 
            onClick={logout} 
            style={{ float: 'right', padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none' }}
          >
            Logout
          </button>
        </nav>
      )}
      
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <AuthPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App