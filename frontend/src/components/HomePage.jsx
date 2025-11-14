import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useTranslation } from '../translations';
import { useState, useEffect, useRef } from 'react';

const HomePage = ({ onGetStarted }) => {
  const { t } = useTranslation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15) 0%, transparent 50%)`,
          transition: 'background 0.3s ease'
        }}
      />
      
      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            background: '#3b82f6',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            y: y1
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}

      {/* Hero Section */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px',
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
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            whileHover={{ scale: 1.05 }}
            style={{
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              borderRadius: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 40px auto',
              boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <img 
              src="/src/assets/logotp.png" 
              alt="AssetFlow Logo" 
              style={{
                width: '70px',
                height: '70px',
                objectFit: 'contain',
                filter: 'brightness(1.2)'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div style="font-size: 36px; font-weight: 800; color: white;">AF</div>';
              }}
            />
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{
              fontSize: 'clamp(48px, 8vw, 96px)',
              fontWeight: '700',
              margin: '0 0 24px 0',
              background: 'linear-gradient(135deg, #ffffff 0%, #3b82f6 50%, #60a5fa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              letterSpacing: '-0.02em'
            }}
          >
            AssetFlow
          </motion.h1>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            style={{
              fontSize: 'clamp(20px, 3vw, 32px)',
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '32px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            }}
          >
            Enterprise-Grade Inventory Management
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            style={{
              fontSize: 'clamp(16px, 2vw, 22px)',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: '1.6',
              margin: '0 auto 48px auto',
              maxWidth: '600px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            }}
          >
            Professional equipment tracking and management solution built for educational institutions and organizations seeking excellence.
          </motion.p>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)'
            }}
            whileTap={{ scale: 0.98 }}
            onClick={onGetStarted}
            style={{
              padding: '18px 36px',
              background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
              border: 'none',
              borderRadius: '50px',
              color: 'white',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              transition: 'all 0.3s ease',
              marginBottom: '80px'
            }}
          >
            Get Started
          </motion.button>
        </motion.div>
      </div>

      {/* Features Section */}
      <FeaturesSection />
      
      {/* Detailed Sections */}
      <DetailedSection />
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* CTA Section */}
      <CTASection onGetStarted={onGetStarted} />

      {/* Footer */}
      <Footer />
    </div>
  );
};

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  return (
    <motion.div
      ref={ref}
      style={{
        position: 'relative',
        zIndex: 10,
        padding: '120px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: '700',
          color: 'white',
          textAlign: 'center',
          marginBottom: '60px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
        }}
      >
        Why Choose AssetFlow?
      </motion.h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '32px',
        maxWidth: '1200px',
        width: '100%'
      }}>
        {[
          { icon: '⚡', title: 'Lightning Fast', desc: 'Sub-100ms response times with optimized performance and real-time synchronization' },
          { icon: '🔒', title: 'Enterprise Security', desc: 'Bank-level encryption, JWT authentication, and comprehensive audit trails' },
          { icon: '📊', title: 'Advanced Analytics', desc: 'Real-time dashboards, usage metrics, and predictive maintenance insights' },
          { icon: '📱', title: 'Cross-Platform', desc: 'Seamless experience across desktop, tablet, and mobile devices' }
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '40px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <div style={{ 
              fontSize: '56px', 
              marginBottom: '24px',
              filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))'
            }}>
              {feature.icon}
            </div>
            <h3 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              margin: '0 0 16px 0',
              color: 'white',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            }}>
              {feature.title}
            </h3>
            <p style={{ 
              fontSize: '16px', 
              color: 'rgba(255, 255, 255, 0.7)', 
              margin: 0,
              lineHeight: '1.6',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            }}>
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const DetailedSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  return (
    <motion.div
      ref={ref}
      style={{
        position: 'relative',
        zIndex: 10,
        padding: '120px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <div style={{ maxWidth: '1200px', width: '100%' }}>
        {[
          {
            title: 'Complete Equipment Lifecycle Management',
            desc: 'Track every piece of equipment from acquisition to retirement with detailed maintenance logs, condition monitoring, and automated alerts.',
            features: ['QR Code Integration', 'Maintenance Scheduling', 'Condition Tracking', 'Document Management'],
            reverse: false
          },
          {
            title: 'Intelligent Request & Approval System',
            desc: 'Streamlined workflow with automated routing, due date management, email notifications, and comprehensive approval chains.',
            features: ['Smart Routing', 'Email Notifications', 'Due Date Tracking', 'Return Processing'],
            reverse: true
          },
          {
            title: 'Educational Institution Focus',
            desc: 'Purpose-built for schools and universities with curriculum mapping, lesson plan integration, and subject-based organization.',
            features: ['Curriculum Integration', 'Lesson Planning', 'Subject Management', 'Teacher Workflows'],
            reverse: false
          }
        ].map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 60 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '60px',
              alignItems: 'center',
              marginBottom: '120px'
            }}
          >
            <div style={{ order: section.reverse ? 2 : 1 }}>
              <h3 style={{
                fontSize: 'clamp(28px, 4vw, 36px)',
                fontWeight: '700',
                color: 'white',
                marginBottom: '24px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
              }}>
                {section.title}
              </h3>
              <p style={{
                fontSize: '18px',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.6',
                marginBottom: '32px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
              }}>
                {section.desc}
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                {section.features.map((feature, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '16px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: '#3b82f6',
                      borderRadius: '50%',
                      boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
                    }} />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
            <div style={{
              order: section.reverse ? 1 : 2,
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '24px',
              padding: '60px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '72px',
                marginBottom: '20px',
                filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.5))'
              }}>
                {['🎯', '🔄', '🎓'][index]}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <motion.div
      ref={ref}
      style={{
        position: 'relative',
        zIndex: 10,
        padding: '120px 20px',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '40px',
        maxWidth: '800px',
        width: '100%',
        textAlign: 'center'
      }}>
        {[
          { number: '10,000+', label: 'Concurrent Users' },
          { number: '99.9%', label: 'Uptime Guarantee' },
          { number: '<100ms', label: 'Response Time' },
          { number: '24/7', label: 'Support Available' }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div style={{
              fontSize: 'clamp(36px, 6vw, 48px)',
              fontWeight: '800',
              color: '#3b82f6',
              marginBottom: '8px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            }}>
              {stat.number}
            </div>
            <div style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const CTASection = ({ onGetStarted }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <motion.div
      ref={ref}
      style={{
        position: 'relative',
        zIndex: 10,
        padding: '120px 20px',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(30, 64, 175, 0.1))',
          borderRadius: '32px',
          padding: '80px 60px',
          textAlign: 'center',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          backdropFilter: 'blur(20px)',
          maxWidth: '800px'
        }}
      >
        <h2 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: '700',
          color: 'white',
          marginBottom: '24px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
        }}>
          Ready to Transform Your Inventory Management?
        </h2>
        <p style={{
          fontSize: '20px',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '40px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
        }}>
          Join thousands of institutions already using AssetFlow
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGetStarted}
          style={{
            padding: '20px 40px',
            background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
            border: 'none',
            borderRadius: '50px',
            color: 'white',
            fontSize: '20px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 15px 35px rgba(59, 130, 246, 0.4)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
          }}
        >
          Start Your Free Trial
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{
        position: 'relative',
        zIndex: 10,
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '60px 20px 40px 20px'
      }}
    >
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: '800',
              color: 'white'
            }}>
              AF
            </div>
            <span style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'white',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            }}>
              AssetFlow
            </span>
          </div>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '16px',
            lineHeight: '1.6',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
          }}>
            Enterprise-grade inventory management solution for educational institutions and organizations.
          </p>
        </div>
        
        <div>
          <h4 style={{
            color: 'white',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
          }}>
            Features
          </h4>
          {['Equipment Tracking', 'Request Management', 'Analytics Dashboard', 'Mobile Access'].map((item, i) => (
            <div key={i} style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '16px',
              marginBottom: '12px',
              cursor: 'pointer',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            }}>
              {item}
            </div>
          ))}
        </div>
        
        <div>
          <h4 style={{
            color: 'white',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '20px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
          }}>
            Support
          </h4>
          {['Documentation', 'API Reference', 'Community', 'Contact Us'].map((item, i) => (
            <div key={i} style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '16px',
              marginBottom: '12px',
              cursor: 'pointer',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            }}>
              {item}
            </div>
          ))}
        </div>
      </div>
      
      <div style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '30px',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: '14px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
      }}>
        © 2024 AssetFlow. All rights reserved. Built with ❤️ for professional excellence.
      </div>
    </motion.footer>
  );
};

export default HomePage;