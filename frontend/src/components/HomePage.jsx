import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { useTranslation } from '../translations';
import logoImage from '../assets/logotp.png';

const ThemeContext = createContext();

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const getTheme = (isDark) => ({
  background: isDark 
    ? 'linear-gradient(180deg, #0a0f1c 0%, #0f172a 25%, #1e293b 75%, #334155 100%)'
    : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 75%, #cbd5e1 100%)',
  text: isDark ? '#ffffff' : '#1f2937',
  textSecondary: isDark ? '#94a3b8' : '#4b5563',
  textMuted: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(31, 41, 55, 0.7)',
  cardBg: isDark 
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
    : 'rgba(255, 255, 255, 0.95)',
  cardBorder: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(226, 232, 240, 0.8)',
  sectionBg: isDark 
    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.8) 100%)'
    : 'rgba(255, 255, 255, 0.95)',
  navBg: isDark
    ? 'linear-gradient(135deg, rgba(10, 15, 28, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
  buttonSecondaryBg: isDark 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(31, 41, 55, 0.1)',
  buttonSecondaryBorder: isDark 
    ? 'rgba(59, 130, 246, 0.3)' 
    : 'rgba(31, 41, 55, 0.3)'
});

const HomePage = ({ onGetStarted }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -20]);
  const theme = getTheme(isDark);
  const { t } = useTranslation();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, theme }}>
    <div style={{
      minHeight: '100vh',
      background: theme.background,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Navbar */}
      <Navbar onLogin={() => window.location.href = '/login'} onSignup={() => window.location.href = '/login'} isMobile={isMobile} />
      
      {/* Subtle Background Elements */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse at 30% 20%, rgba(59, 130, 246, 0.12) 0%, rgba(16, 185, 129, 0.06) 40%, transparent 70%)',
          y: y1
        }}
      />
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)'
      }} />

      {/* Hero Section */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '80px 20px 40px 20px' : '100px 20px 0 20px',
        textAlign: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ maxWidth: '1200px' }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 32px auto',
              boxShadow: '0 8px 32px rgba(255, 255, 255, 0.3), 0 0 60px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              padding: '8px'
            }}
          >
            <img 
              src={logoImage} 
              alt="SchoolSync Logo" 
              style={{
                width: '64px',
                height: '64px',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div style="font-size: 32px; font-weight: 800; color: #1e40af; font-family: Inter, -apple-system, sans-serif;">SS</div>';
              }}
            />
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              fontSize: isMobile ? 'clamp(40px, 8vw, 64px)' : '64px',
              fontWeight: '700',
              margin: '0 0 20px 0',
              color: theme.text,
              fontFamily: 'Inter, -apple-system, sans-serif',
              letterSpacing: '-0.025em',
              lineHeight: '1.1'
            }}
          >
            {t('enterpriseAssetManagement')}
            <br />
            <span style={{ color: isDark ? '#64748b' : '#6b7280' }}>{t('forModernSchools')}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: '400',
              color: theme.textSecondary,
              marginBottom: '40px',
              fontFamily: 'Inter, -apple-system, sans-serif',
              lineHeight: '1.6',
              maxWidth: '560px',
              margin: '0 auto 40px auto'
            }}
          >
            {t('secureScalableInfrastructure')}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              marginBottom: '80px'
            }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGetStarted}
              style={{
                padding: '18px 36px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'Inter, -apple-system, sans-serif',
                transition: 'all 0.3s ease',
                minWidth: isMobile ? '100%' : '160px',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              {t('requestAccess')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '18px 36px',
                background: theme.buttonSecondaryBg,
                border: `1px solid ${theme.buttonSecondaryBorder}`,
                borderRadius: '12px',
                color: theme.text,
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                fontFamily: 'Inter, -apple-system, sans-serif',
                transition: 'all 0.3s ease',
                minWidth: isMobile ? '100%' : '160px',
                backdropFilter: 'blur(10px)'
              }}
            >
              {t('viewPlatform')}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Trust Section */}
      <TrustSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Security Section */}
      <SecuritySection />
      
      {/* Scalability Section */}
      <ScalabilitySection />
      
      {/* Who It's For Section */}
      <WhoItsForSection />
      
      {/* CTA Section */}
      <CTASection onGetStarted={onGetStarted} />

      {/* Footer */}
      <Footer />
    </div>
    </ThemeContext.Provider>
  );
};

const TrustSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <motion.div
      ref={ref}
      style={{
        position: 'relative',
        zIndex: 10,
        padding: '80px 20px',
        background: theme.sectionBg,
        borderTop: `1px solid ${theme.cardBorder}`,
        borderBottom: `1px solid ${theme.cardBorder}`,
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      }}
    >
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
        gap: '40px',
        textAlign: 'center'
      }}>
        {[
          { label: t('enterpriseGradeSecurity'), value: t('socCompliant') },
          { label: t('containerIsolation'), value: t('perSchoolEnvironments') },
          { label: t('roleBasedAccess'), value: t('strictBoundaries') },
          { label: t('highAvailability'), value: t('uptimeGuarantee') }
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#3b82f6',
              marginBottom: '8px',
              fontFamily: 'Inter, -apple-system, sans-serif'
            }}>
              {item.value}
            </div>
            <div style={{
              fontSize: '14px',
              color: theme.textSecondary,
              fontFamily: 'Inter, -apple-system, sans-serif'
            }}>
              {item.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <motion.div
      ref={ref}
      style={{
        position: 'relative',
        zIndex: 10,
        padding: '120px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          fontSize: isMobile ? '32px' : '40px',
          fontWeight: '700',
          color: theme.text,
          textAlign: 'center',
          marginBottom: '80px',
          fontFamily: 'Inter, -apple-system, sans-serif'
        }}
      >
        {t('coreFeatures')}
      </motion.h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: '32px'
      }}>
        {[
          { title: t('equipmentAssetTracking'), desc: t('completeLifecycleManagement') },
          { title: t('roleBasedAccessControl'), desc: t('studentTeacherAdminRoles') },
          { title: t('approvalWorkflows'), desc: t('automatedRoutingNotifications') },
          { title: t('auditLogsHistory'), desc: t('comprehensiveTrackingCompliance') },
          { title: t('analyticsReporting'), desc: t('realTimeDashboardsUsageInsights') },
          { title: t('documentManagement'), desc: t('secureFileStorageVersionControl') }
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: '16px',
              padding: '32px',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              boxShadow: theme.shadow
            }}
          >
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: theme.text,
              marginBottom: '12px',
              fontFamily: 'Inter, -apple-system, sans-serif'
            }}>
              {feature.title}
            </h3>
            <p style={{
              fontSize: '14px',
              color: theme.textSecondary,
              margin: 0,
              lineHeight: '1.5',
              fontFamily: 'Inter, -apple-system, sans-serif'
            }}>
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const SecuritySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isMobile, setIsMobile] = useState(false);
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <motion.div
      ref={ref}
      style={{
        position: 'relative',
        zIndex: 10,
        padding: '120px 20px',
        background: isDark ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.4) 100%)' : 'rgba(255, 255, 255, 0.95)',
        borderTop: isDark ? '1px solid rgba(16, 185, 129, 0.2)' : `1px solid ${theme.cardBorder}`,
        borderBottom: isDark ? 'none' : `1px solid ${theme.cardBorder}`
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at center top, rgba(59, 130, 246, 0.05) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />
      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            fontSize: isMobile ? '32px' : '40px',
            fontWeight: '700',
            color: theme.text,
            textAlign: 'center',
            marginBottom: '80px',
            fontFamily: 'Inter, -apple-system, sans-serif'
          }}
        >
          {t('securityArchitecture')}
        </motion.h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: '40px',
          alignItems: 'start'
        }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h3 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: theme.text,
              marginBottom: '24px',
              fontFamily: 'Inter, -apple-system, sans-serif'
            }}>
              {t('institutionalIsolation')}
            </h3>
            <div style={{ marginBottom: '32px' }}>
              {[
                t('perSchoolIsolatedEnvironments'),
                t('separateDatabasesPerInstitution'),
                t('centralSystemAdministration'),
                t('strictAccessBoundaries'),
                t('noCrossSchoolDataExposure')
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                  color: theme.text,
                  fontSize: '16px',
                  fontFamily: 'Inter, -apple-system, sans-serif'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    background: '#3b82f6',
                    borderRadius: '50%'
                  }} />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
              color: '#3b82f6'
            }}>
              🛡️
            </div>
            <h4 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: theme.text,
              marginBottom: '12px',
              fontFamily: 'Inter, -apple-system, sans-serif'
            }}>
              {t('enterpriseSecurityFeatures')}
            </h4>
            <p style={{
              fontSize: '14px',
              color: theme.textSecondary,
              margin: 0,
              lineHeight: '1.5',
              fontFamily: 'Inter, -apple-system, sans-serif'
            }}>
              {t('bankLevelEncryption')}
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const ScalabilitySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <motion.div
      ref={ref}
      style={{
        position: 'relative',
        zIndex: 10,
        padding: '120px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          fontSize: isMobile ? '32px' : '40px',
          fontWeight: '700',
          color: theme.text,
          textAlign: 'center',
          marginBottom: '80px',
          fontFamily: 'Inter, -apple-system, sans-serif'
        }}
      >
        {t('scalabilityReliability')}
      </motion.h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
        gap: '32px',
        textAlign: 'center'
      }}>
        {[
          { metric: '10,000+', label: t('concurrentUsers') },
          { metric: '99.9%', label: t('uptimeSLA') },
          { metric: '<100ms', label: t('responseTime') },
          { metric: '24/7', label: t('monitoring') }
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(59, 130, 246, 0.03) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '16px',
              padding: '40px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#3b82f6',
              marginBottom: '8px',
              fontFamily: 'Inter, -apple-system, sans-serif'
            }}>
              {item.metric}
            </div>
            <div style={{
              fontSize: '14px',
              color: theme.textSecondary,
              fontFamily: 'Inter, -apple-system, sans-serif'
            }}>
              {item.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const WhoItsForSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isMobile, setIsMobile] = useState(false);
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <motion.div
      ref={ref}
      style={{
        position: 'relative',
        zIndex: 10,
        padding: '120px 20px',
        background: isDark ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.7) 0%, rgba(30, 41, 59, 0.9) 100%)' : 'rgba(255, 255, 255, 0.95)',
        borderTop: isDark ? '1px solid rgba(139, 92, 246, 0.2)' : `1px solid ${theme.cardBorder}`,
        borderBottom: isDark ? 'none' : `1px solid ${theme.cardBorder}`
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.06) 0%, transparent 60%)',
        pointerEvents: 'none'
      }} />
      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            fontSize: isMobile ? '32px' : '40px',
            fontWeight: '700',
            color: theme.text,
            textAlign: 'center',
            marginBottom: '80px',
            fontFamily: 'Inter, -apple-system, sans-serif'
          }}
        >
          {t('builtForEducationalInstitutions')}
        </motion.h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: '40px'
        }}>
          {[
            {
              title: t('schoolAdministrators'),
              desc: t('completeOversightEquipmentAllocation')
            },
            {
              title: t('teachers'),
              desc: t('streamlinedEquipmentRequests')
            },
            {
              title: t('students'),
              desc: t('simpleSecureAccess')
            },
            {
              title: t('itDepartments'),
              desc: t('centralizedManagementRoleBasedAccess')
            }
          ].map((segment, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '16px',
                padding: '36px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
              }}
            >
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: theme.text,
                marginBottom: '16px',
                fontFamily: 'Inter, -apple-system, sans-serif'
              }}>
                {segment.title}
              </h3>
              <p style={{
                fontSize: '16px',
                color: theme.textSecondary,
                margin: 0,
                lineHeight: '1.5',
                fontFamily: 'Inter, -apple-system, sans-serif'
              }}>
                {segment.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const CTASection = ({ onGetStarted }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <motion.div
      ref={ref}
      style={{
        position: 'relative',
        zIndex: 10,
        padding: '120px 20px',
        textAlign: 'center'
      }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          fontSize: isMobile ? '32px' : '40px',
          fontWeight: '700',
          color: theme.text,
          marginBottom: '24px',
          fontFamily: 'Inter, -apple-system, sans-serif'
        }}
      >
        {t('readyToTransformInstitution')}
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          fontSize: '18px',
          color: theme.textSecondary,
          marginBottom: '40px',
          maxWidth: '600px',
          margin: '0 auto 40px auto',
          fontFamily: 'Inter, -apple-system, sans-serif'
        }}
      >
        {t('joinLeadingEducationalInstitutions')}
      </motion.p>
      
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onGetStarted}
        style={{
          padding: '18px 36px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
          border: 'none',
          borderRadius: '12px',
          color: 'white',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          fontFamily: 'Inter, -apple-system, sans-serif',
          transition: 'all 0.3s ease',
          boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
        }}
      >
        {t('scheduleDemo')}
      </motion.button>
    </motion.div>
  );
};

const Footer = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{
        position: 'relative',
        zIndex: 10,
        background: theme.navBg,
        borderTop: `1px solid ${theme.cardBorder}`,
        backdropFilter: 'blur(20px)',
        padding: '40px 20px 30px 20px'
      }}
    >
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '20px' : '0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(255, 255, 255, 0.3), 0 0 16px rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            padding: '2px'
          }}>
            <img 
              src={logoImage} 
              alt="SchoolSync Logo" 
              style={{
                width: '28px',
                height: '28px',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span style="font-size: 16px; font-weight: 800; color: #1e40af;">SS</span>';
              }}
            />
          </div>
          <span style={{
            fontSize: '24px',
            fontWeight: '700',
            color: theme.text,
            fontFamily: 'Inter, -apple-system, sans-serif'
          }}>
            SchoolSync
          </span>
        </div>
        
        <p style={{
          color: theme.textMuted,
          fontSize: '16px',
          fontFamily: 'Inter, -apple-system, sans-serif'
        }}>
          {t('enterpriseAssetManagementForEducationalInstitutions')}
        </p>
      </div>
      
      <div style={{
        borderTop: `1px solid ${theme.cardBorder}`,
        paddingTop: '30px',
        textAlign: 'center',
        color: theme.textSecondary,
        fontSize: '14px',
        fontFamily: 'Inter, -apple-system, sans-serif'
      }}>
        {t('allRightsReserved')}
      </div>
    </motion.footer>
  );
};

const Navbar = ({ onLogin, onSignup, isMobile }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDark, setIsDark, theme } = useTheme();
  const { language, t } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'bg' : 'en';
    localStorage.setItem('language', newLanguage);
    window.location.reload();
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: theme.navBg,
        backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${theme.cardBorder}`,
        padding: isMobile ? '12px 20px' : '16px 20px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(255, 255, 255, 0.3), 0 0 16px rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            padding: '2px'
          }}>
            <img 
              src={logoImage} 
              alt="SchoolSync Logo" 
              style={{
                width: '28px',
                height: '28px',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span style="font-size: 14px; font-weight: 800; color: #1e40af;">SS</span>';
              }}
            />
          </div>
          <span style={{
            fontSize: '20px',
            fontWeight: '700',
            color: theme.text,
            fontFamily: 'Inter, -apple-system, sans-serif'
          }}>
            SchoolSync
          </span>
        </div>

        {/* Desktop Menu */}
        {!isMobile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLanguage}
              style={{
                padding: '8px 12px',
                background: theme.buttonSecondaryBg,
                border: `1px solid ${theme.buttonSecondaryBorder}`,
                borderRadius: '8px',
                color: theme.text,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
            >
              {language === 'en' ? 'BG' : 'EN'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDark(!isDark)}
              style={{
                padding: '8px',
                background: theme.buttonSecondaryBg,
                border: `1px solid ${theme.buttonSecondaryBorder}`,
                borderRadius: '8px',
                color: theme.text,
                fontSize: '16px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
            >
              {isDark ? '☀️' : '🌙'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogin}
              style={{
                padding: '12px 24px',
                background: theme.buttonSecondaryBg,
                border: `1px solid ${theme.buttonSecondaryBorder}`,
                borderRadius: '10px',
                color: theme.text,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                fontFamily: 'Inter, -apple-system, sans-serif',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
            >
              {t('login')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSignup}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'Inter, -apple-system, sans-serif',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease'
              }}
            >
              {t('signup')}
            </motion.button>
          </div>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleLanguage}
              style={{
                background: 'none',
                border: 'none',
                color: theme.text,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {language === 'en' ? 'BG' : 'EN'}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDark(!isDark)}
              style={{
                background: 'none',
                border: 'none',
                color: theme.text,
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              {isDark ? '☀️' : '🌙'}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: theme.text,
                fontSize: '24px',
                cursor: 'pointer'
              }}
            >
              {isMenuOpen ? '✕' : '☰'}
            </motion.button>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobile && isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            marginTop: '12px',
            padding: '12px 0',
            borderTop: `1px solid ${theme.cardBorder}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <button
            onClick={() => { onLogin(); setIsMenuOpen(false); }}
            style={{
              padding: '10px 16px',
              background: theme.buttonSecondaryBg,
              border: `1px solid ${theme.buttonSecondaryBorder}`,
              borderRadius: '6px',
              color: theme.text,
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              fontFamily: 'Inter, -apple-system, sans-serif'
            }}
          >
            {t('login')}
          </button>
          <button
            onClick={() => { onSignup(); setIsMenuOpen(false); }}
            style={{
              padding: '10px 16px',
              background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'Inter, -apple-system, sans-serif'
            }}
          >
            {t('signup')}
          </button>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default HomePage;
