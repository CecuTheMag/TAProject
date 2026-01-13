import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Dashboard from './Dashboard';

const SchoolDashboard = ({ school, onBack }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Create a modified user context for this school
  const schoolUser = {
    ...user,
    school_id: school.id,
    is_system_admin: false // Hide system admin features in school view
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: '"SF Pro Display", -apple-system, sans-serif',
      display: 'flex',
      width: '100%',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        user={schoolUser}
      />
      
      <div style={{
        flex: 1,
        marginLeft: isMobile ? '0' : 'var(--sidebar-width, 300px)',
        marginTop: isMobile ? '70px' : '0',
        minHeight: isMobile ? 'calc(100vh - 70px)' : '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        width: isMobile ? '100%' : 'calc(100% - var(--sidebar-width, 300px))',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* School Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          padding: '20px 40px',
          borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
              {school.name}
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              School Code: {school.code} • {school.user_count} Users
            </p>
          </div>
          <button
            onClick={onBack}
            style={{
              padding: '8px 16px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ← Back to System Admin
          </button>
        </div>

        {/* Dashboard Content */}
        <div style={{ flex: 1 }}>
          <Dashboard />
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;