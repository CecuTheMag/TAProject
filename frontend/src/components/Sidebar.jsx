import { useState } from 'react';
import { useAuth } from '../AuthContext';

const Sidebar = ({ activeTab, setActiveTab, user }) => {
  const { logout } = useAuth();
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
      </svg>
    )},
    { id: 'equipment', label: 'Equipment', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
      </svg>
    )},
    { id: 'requests', label: 'Requests', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
      </svg>
    )},
    ...(user?.role === 'admin' ? [
      { id: 'analytics', label: 'Analytics', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z"/>
        </svg>
      )},
      { id: 'reports', label: 'Reports', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6,2A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6M6,4H13V9H18V20H6V4M8,12V14H16V12H8M8,16V18H13V16H8Z"/>
        </svg>
      )},
      { id: 'alerts', label: 'Alerts', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10,21H14A2,2 0 0,1 12,23A2,2 0 0,1 10,21M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M17,11A5,5 0 0,0 12,6A5,5 0 0,0 7,11V18H17V11Z"/>
        </svg>
      )},
      { id: 'users', label: 'Users', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01 1l-2.54 3.45c-.28.38-.28.89 0 1.27L14.31 16H16v6h4zm-12.5 0v-6.5H9L7.1 9.4c-.19-.6-.73-1-1.35-1H4.5C3.67 8.4 3 9.07 3 9.9v.6c0 .83.67 1.5 1.5 1.5H6v10h1.5zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5z"/>
        </svg>
      )}
    ] : [])
  ];

  return (
    <div style={{
      width: '280px',
      height: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000,
      boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 32px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h1 style={{
          color: '#ffffff',
          fontSize: '24px',
          fontWeight: '800',
          margin: 0,
          letterSpacing: '0.1em',
          fontFamily: '"SF Pro Display", -apple-system, sans-serif'
        }}>
          SIMS
        </h1>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '24px 0' }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              width: '100%',
              padding: '16px 32px',
              background: activeTab === item.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              border: 'none',
              color: activeTab === item.id ? '#ffffff' : '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '16px',
              fontWeight: '500',
              fontFamily: '"SF Pro Text", -apple-system, sans-serif',
              borderLeft: activeTab === item.id ? '4px solid #ffffff' : '4px solid transparent',
              justifyContent: 'flex-start'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== item.id) {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== item.id) {
                e.target.style.background = 'transparent';
                e.target.style.color = '#94a3b8';
              }
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Info */}
      <div style={{
        padding: '24px 32px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '600',
              fontSize: '16px'
            }}>
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ color: '#ffffff', fontWeight: '600', fontSize: '14px' }}>
                {user?.username}
              </div>
              <div style={{ color: '#64748b', fontSize: '12px', textTransform: 'capitalize' }}>
                {user?.role}
              </div>
            </div>
          </div>
          
          <button
            onClick={logout}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '8px',
              color: '#ef4444',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.2)';
              e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.1)';
              e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }}
            title="Logout"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;