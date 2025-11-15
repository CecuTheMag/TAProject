const Footer = ({ isMobile }) => {
  if (!isMobile) return null;

  return (
    <div style={{
      background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
      padding: '24px 20px 24px 20px',
      margin: '0',
      marginBottom: '0',
      boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
      border: 'none',
      textAlign: 'center',
      width: '100%',
      display: 'block',
      marginTop: 'auto'
    }}>
      <div style={{
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '600',
        fontFamily: '"SF Pro Text", -apple-system, sans-serif',
        marginBottom: '8px'
      }}>
        AssetFlow - Inventory Management System
      </div>
      <div style={{
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '12px',
        fontWeight: '400',
        fontFamily: '"SF Pro Text", -apple-system, sans-serif'
      }}>
        Professional IT Solution © 2025
      </div>
    </div>
  );
};

export default Footer;