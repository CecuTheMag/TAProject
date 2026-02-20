import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../AuthContext';
import { useTranslation } from '../translations';
import logoImage from '../assets/logotp.png';

const Sidebar = ({ activeTab, setActiveTab, user }) => {
  const { logout } = useAuth();
  const { t } = useTranslation();
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
    // System Admin menu items
    return [
      { id: 'dashboard', label: 'Overview', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
        </svg>
      )},
      { id: 'schools', label: 'Schools', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z"/>
        </svg>
      )},
      { id: 'admins', label: 'Admins', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16,13C15.71,13 15.38,13 15.03,13.05C16.19,13.89 17,15 17,16.5V19H23V16.5C23,14.17 18.33,13 16,13M8,13C5.67,13 1,14.17 1,16.5V19H15V16.5C15,14.17 10.33,13 8,13M8,11A3,3 0 0,0 11,8A3,3 0 0,0 8,5A3,3 0 0,0 5,8A3,3 0 0,0 8,11M16,11A3,3 0 0,0 19,8A3,3 0 0,0 16,5A3,3 0 0,0 13,8A3,3 0 0,0 16,11Z"/>
        </svg>
      )},
      { id: 'database', label: 'Database', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z"/>
        </svg>
      )}
    ];
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
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
              boxShadow: '0 2px 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              padding: '4px'
            }}>
              <img src={logoImage} alt="SchoolSync Logo" style={{
                width: '32px',
                height: '32px',
                objectFit: 'contain'
              }} />
            </div>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800', margin: 0 }}>SchoolSync</h1>
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
      width: 'var(--sidebar-width, 300px)',
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
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      overflow: 'hidden'
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
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
          boxShadow: '0 4px 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          padding: '8px'
        }}>
          <img src={logoImage} alt="SchoolSync Logo" style={{
            width: '64px',
            height: '64px',
            objectFit: 'contain'
          }} />
        </div>
        <h1 style={{
          color: '#ffffff',
          fontSize: 'var(--font-3xl, 28px)',
          fontWeight: '900',
          margin: '0 0 8px 0',
          letterSpacing: '0.15em',
          fontFamily: '"SF Pro Display", -apple-system, sans-serif',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          SchoolSync
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
          Professional Solution
        </p>
        </div>

        {/* Navigation */}
        <nav style={{ 
          flex: 1, 
          padding: '32px 0',
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent'
        }}>
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
              fontSize: 'var(--font-base, 16px)',
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

// Add scrollbar styling
const style = document.createElement('style');
style.textContent = `
  nav::-webkit-scrollbar {
    width: 6px;
  }
  nav::-webkit-scrollbar-track {
    background: transparent;
  }
  nav::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
  nav::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;
if (!document.head.querySelector('style[data-sidebar-scroll]')) {
  style.setAttribute('data-sidebar-scroll', 'true');
  document.head.appendChild(style);
}
