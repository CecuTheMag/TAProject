import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth } from '../api';
import { useAuth } from '../AuthContext';
import { useTranslation } from '../translations';

const Login = () => {
  const { t } = useTranslation();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    username: '', 
    confirmPassword: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignup) {
        if (formData.password !== formData.confirmPassword) {
          setError(t('passwordsDoNotMatch'));
          return;
        }
        const response = await auth.register({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        login(response.data.user, response.data.token);
      } else {
        const response = await auth.login({
          email: formData.email,
          password: formData.password
        });
        login(response.data.user, response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.error || (isSignup ? t('signupFailed') : t('loginFailed')));
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setFormData({ email: '', password: '', username: '', confirmPassword: '' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '"SF Pro Display", -apple-system, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: isMobile ? '400px' : '1200px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        minHeight: isMobile ? 'auto' : '600px'
      }}>
        {/* Left Side - Branding */}
        <div style={{
          flex: isMobile ? 'none' : '1',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          padding: isMobile ? '40px 30px' : '60px 50px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.3
          }}></div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            {/* Logo */}
            <div style={{
              width: isMobile ? '80px' : '120px',
              height: isMobile ? '80px' : '120px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }}>
              <img 
                src="./src/assets/logotp.png" 
                alt="AssetFlow Logo" 
                style={{
                  width: isMobile ? '50px' : '70px',
                  height: isMobile ? '50px' : '70px',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div style="font-size: 32px; font-weight: 800; color: white;">AF</div>';
                }}
              />
            </div>
            
            <h1 style={{
              fontSize: isMobile ? '28px' : '36px',
              fontWeight: '800',
              margin: '0 0 8px 0',
              background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              AssetFlow
            </h1>
            
            <div style={{
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '600',
              color: '#3b82f6',
              marginBottom: '16px'
            }}>
              {t('enterpriseGrade')}
            </div>
            
            <div style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: '700',
              marginBottom: '12px'
            }}>
              {t('inventoryManagement')}
            </div>
            
            <p style={{
              fontSize: isMobile ? '14px' : '16px',
              opacity: 0.9,
              lineHeight: '1.6',
              margin: '0 0 32px 0',
              maxWidth: '300px'
            }}>
              {t('modernSolution')}
            </p>
            
            {/* Features */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              {[
                '✨ Real-time tracking',
                '📊 Advanced analytics', 
                '🔒 Enterprise security',
                '📱 Mobile responsive'
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  style={{
                    fontSize: '14px',
                    opacity: 0.8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {feature}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Side - Form */}
        <div style={{
          flex: isMobile ? 'none' : '1',
          padding: isMobile ? '40px 30px' : '60px 50px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 style={{
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: '800',
              color: '#0f172a',
              margin: '0 0 8px 0'
            }}>
              {isSignup ? t('createAccount') : t('welcomeBack')}
            </h2>
            
            <p style={{
              color: '#64748b',
              fontSize: '16px',
              margin: '0 0 32px 0'
            }}>
              {isSignup ? t('getStarted') : 'Sign in to your account'}
            </p>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              {isSignup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginBottom: '20px' }}
                >
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    {t('username')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('enterUsername')}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required={isSignup}
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </motion.div>
              )}
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  {t('emailAddress')}
                </label>
                <input
                  type="email"
                  placeholder={t('enterEmail')}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              
              <div style={{ marginBottom: isSignup ? '20px' : '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  {t('password')}
                </label>
                <input
                  type="password"
                  placeholder={t('enterPassword')}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              
              {isSignup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginBottom: '24px' }}
                >
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    {t('confirmPassword')}
                  </label>
                  <input
                    type="password"
                    placeholder={t('confirmPassword')}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required={isSignup}
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </motion.div>
              )}
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '14px'
                  }}
                >
                  {error}
                </motion.div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: '24px'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {loading 
                  ? (isSignup ? t('signingUp') : t('loggingIn'))
                  : (isSignup ? t('signup') : t('login'))
                }
              </button>
            </form>
            
            <div style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#64748b'
            }}>
              {isSignup ? t('alreadyHaveAccount') : t('dontHaveAccount')}
              {' '}
              <button
                onClick={toggleMode}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '14px'
                }}
              >
                {isSignup ? t('loginHere') : t('signUpHere')}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;