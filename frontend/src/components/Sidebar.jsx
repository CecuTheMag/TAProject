import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../AuthContext';

const Sidebar = ({ activeTab, setActiveTab, user }) => {
  const { logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsMenuOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const getMenuItems = () => {
    const baseItems = [
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
      )}
    ];

    // Students get basic tabs
    if (user?.role === 'student') {
      return baseItems;
    }

    // Teachers get analytics and education
    if (user?.role === 'teacher') {
      return [
        ...baseItems,
        { id: 'education', label: 'Education', icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z"/>
          </svg>
        )},
        { id: 'analytics', label: 'Analytics', icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z"/>
          </svg>
        )}
      ];
    }

    // Managers get everything except users
    if (user?.role === 'manager') {
      return [
        ...baseItems,
        { id: 'education', label: 'Education', icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z"/>
          </svg>
        )},
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
        )}
      ];
    }

    // Admins get everything
    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { id: 'education', label: 'Education', icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z"/>
          </svg>
        )},
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
        )},
        { id: 'management', label: 'Management', icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
          </svg>
        )}
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  if (isMobile) {
    return (
      <>
        {/* Mobile Top Navbar */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '70px',
          background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 1000,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M2,10H7V9H2M2,12H7V11H2M20,12H22V10H20M20,9H22V7H20M20,15H22V13H20M11,9H13V7H11M11,12H13V10H11M11,15H13V13H11M11,18H13V16H11M14,9H16V7H14M14,12H16V10H14M14,15H16V13H14M14,18H16V16H14M17,9H19V7H17M17,12H19V10H17M17,15H19V13H17M17,18H19V16H17M8,18H10V16H8M8,15H10V13H8M8,12H10V10H8M8,9H10V7H8M5,18H7V16H5M5,15H7V13H5M5,12H7V10H5M5,9H7V7H5M2,18H4V16H2M2,15H4V13H2M20,18H22V16H20Z"/>
              </svg>
            </div>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800', margin: 0 }}>SIMS</h1>
          </div>
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              width: '44px',
              height: '44px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ width: '18px', height: '2px', backgroundColor: 'white', borderRadius: '1px' }}></div>
              <div style={{ width: '18px', height: '2px', backgroundColor: 'white', borderRadius: '1px' }}></div>
              <div style={{ width: '18px', height: '2px', backgroundColor: 'white', borderRadius: '1px' }}></div>
            </div>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1001
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                style={{
                  width: '320px',
                  height: 'calc(100vh - 60px)',
                  maxHeight: '90vh',
                  background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '8px 0 32px rgba(0, 0, 0, 0.25)',
                  overflowY: 'auto',
                  margin: '20px 0'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {renderSidebarContent()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div style={{
      width: '300px',
      height: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000,
      boxShadow: '8px 0 32px rgba(0, 0, 0, 0.25)',
      display: 'flex',
      flexDirection: 'column',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      {renderSidebarContent()}
    </div>
  );

  function renderSidebarContent() {
    return (
      <>
        {/* Header */}
        <div style={{
          padding: '32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)'
        }}>
        <div style={{
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
            <path d="M2,10H7V9H2M2,12H7V11H2M20,12H22V10H20M20,9H22V7H20M20,15H22V13H20M11,9H13V7H11M11,12H13V10H11M11,15H13V13H11M11,18H13V16H11M14,9H16V7H14M14,12H16V10H14M14,15H16V13H14M14,18H16V16H14M17,9H19V7H17M17,12H19V10H17M17,15H19V13H17M17,18H19V16H17M8,18H10V16H8M8,15H10V13H8M8,12H10V10H8M8,9H10V7H8M5,18H7V16H5M5,15H7V13H5M5,12H7V10H5M5,9H7V7H5M2,18H4V16H2M2,15H4V13H2M20,18H22V16H20Z"/>
          </svg>
        </div>
        <h1 style={{
          color: '#ffffff',
          fontSize: '28px',
          fontWeight: '900',
          margin: '0 0 8px 0',
          letterSpacing: '0.15em',
          fontFamily: '"SF Pro Display", -apple-system, sans-serif',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          SIMS
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '12px',
          fontWeight: '500',
          margin: 0,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          textAlign: 'center'
        }}>
          Inventory Management
        </p>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '32px 0' }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (isMobile) setIsMenuOpen(false);
              }}
              style={{
              width: '100%',
              padding: '18px 32px',
              background: activeTab === item.id 
                ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)' 
                : 'transparent',
              border: 'none',
              color: activeTab === item.id ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '16px',
              fontWeight: activeTab === item.id ? '600' : '500',
              fontFamily: '"SF Pro Text", -apple-system, sans-serif',
              borderLeft: activeTab === item.id ? '4px solid #3b82f6' : '4px solid transparent',
              justifyContent: 'flex-start',
              borderRadius: activeTab === item.id ? '0 12px 12px 0' : '0',
              marginRight: activeTab === item.id ? '8px' : '0',
              boxShadow: activeTab === item.id ? '0 4px 12px rgba(59, 130, 246, 0.2)' : 'none',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== item.id) {
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                e.target.style.color = '#ffffff';
                e.target.style.transform = 'translateX(4px)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== item.id) {
                e.target.style.background = 'transparent';
                e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                e.target.style.transform = 'translateX(0)';
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
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)'
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
      </>
    );
  }
};

export default Sidebar;