import { motion } from 'framer-motion';

const Footer = ({ isMobile }) => {
  // Always render footer, but adjust styling based on screen size
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: isMobile
          ? 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(90deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
        padding: isMobile ? '20px' : '16px 40px',
        margin: '0',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
        border: 'none',
        textAlign: 'center',
        width: '100%',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10
      }}
    >
      <div style={{
        color: '#ffffff',
        fontSize: isMobile ? '14px' : '13px',
        fontWeight: '600',
        fontFamily: '"SF Pro Text", -apple-system, sans-serif',
        marginBottom: isMobile ? '8px' : '0'
      }}>
        AssetFlow - Inventory Management System
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: isMobile ? '12px' : '12px',
          fontWeight: '400',
          fontFamily: '"SF Pro Text", -apple-system, sans-serif'
        }}>
          Professional IT Solution © 2025
        </div>
        {!isMobile && (
          <div style={{
            display: 'flex',
            gap: '8px',
            marginLeft: '16px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981'
            }}></div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '11px',
              fontFamily: '"SF Pro Text", -apple-system, sans-serif'
            }}>
              System Online
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Footer;
