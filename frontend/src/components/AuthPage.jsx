import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth } from '../api';
import { useAuth } from '../AuthContext';
import { useTranslation } from '../translations';
import logoImage from '../assets/logotp.png';

const AuthPage = () => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationStep, setVerificationStep] = useState(1); // 1: send codes, 2: verify and set password
  const [verificationFormData, setVerificationFormData] = useState({
    emailCode: '',
    smsCode: '',
    password: '',
    confirmPassword: ''
  });
  const [verificationError, setVerificationError] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [codesSent, setCodesSent] = useState(false);
  const [hasPhone, setHasPhone] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
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
      if (isLogin) {
        // Login flow
        const response = await auth.login({ email: formData.email, password: formData.password });
        
        if (response.data.requiresSetup) {
          setVerificationEmail(formData.email);
          setShowVerification(true);
          return;
        }
        
        login(response.data.user, response.data.token);
      } else {
        // Signup flow - show verification to set up account
        setVerificationEmail(formData.email);
        setShowVerification(true);
        return;
      }
    } catch (err) {
      if (!isLogin && err.response?.status === 401) {
        setError('Email not found in school system. Contact your administrator.');
      } else {
        setError(err.response?.data?.error || (isLogin ? t('loginFailed') : 'Account setup failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendCodes = async () => {
    setVerificationLoading(true);
    setVerificationError('');

    try {
      const response = await auth.sendVerificationCodes({ email: verificationEmail });
      setCodesSent(true);
      setHasPhone(response.data.hasPhone);
      setVerificationStep(2);
    } catch (err) {
      setVerificationError(err.response?.data?.error || 'Failed to send verification codes');
    } finally {
      setVerificationLoading(false);
    }
  };

  const setupPassword = async (e) => {
    e.preventDefault();
    setVerificationLoading(true);
    setVerificationError('');

    if (verificationFormData.password !== verificationFormData.confirmPassword) {
      setVerificationError('Passwords do not match');
      setVerificationLoading(false);
      return;
    }

    try {
      const response = await auth.setupPassword({
        email: verificationEmail,
        password: verificationFormData.password,
        confirmPassword: verificationFormData.confirmPassword,
        emailCode: verificationFormData.emailCode,
        smsCode: verificationFormData.smsCode
      });

      login(response.data.user, response.data.token);
    } catch (err) {
      setVerificationError(err.response?.data?.error || 'Password setup failed');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleVerificationChange = (e) => {
    setVerificationFormData({ ...verificationFormData, [e.target.name]: e.target.value });
  };



  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
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
              background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              margin: '0 auto 24px auto',
              boxShadow: '0 8px 32px rgba(255, 255, 255, 0.3), 0 0 60px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
              padding: '12px'
            }}>
              <img 
                src={logoImage} 
                alt="SchoolSync Logo" 
                style={{
                  width: isMobile ? '56px' : '96px',
                  height: isMobile ? '56px' : '96px',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div style="font-size: 32px; font-weight: 800; color: #1e40af;">AF</div>';
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
              SchoolSync
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
          {showVerification ? (
            <motion.div
              key="verification"
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
                First-Time Setup
              </h2>

              <p style={{
                color: '#64748b',
                fontSize: '16px',
                margin: '0 0 32px 0'
              }}>
                {verificationStep === 1 ? 'Verify your identity to set up your account' : 'Enter verification codes and create your password'}
              </p>

              {verificationStep === 1 ? (
                // Step 1: Send verification codes
                <div>
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px'
                  }}>
                    <h3 style={{ margin: '0 0 12px 0', color: '#374151' }}>Account Found</h3>
                    <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>
                      Email: <strong>{verificationEmail}</strong>
                    </p>
                    <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                      We'll send verification codes to your registered email and phone number.
                    </p>
                  </div>

                  {verificationError && (
                    <div style={{
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#dc2626',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      fontSize: '14px'
                    }}>
                      {verificationError}
                    </div>
                  )}

                  <button
                    onClick={sendCodes}
                    disabled={verificationLoading}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: verificationLoading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: verificationLoading ? 'not-allowed' : 'pointer',
                      marginBottom: '16px'
                    }}
                  >
                    {verificationLoading ? 'Sending Codes...' : 'Send Verification Codes'}
                  </button>

                  <button
                    onClick={() => {
                      setShowVerification(false);
                      setVerificationEmail('');
                      setVerificationStep(1);
                      setCodesSent(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'transparent',
                      color: '#64748b',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                // Step 2: Verify codes and set password
                <form onSubmit={setupPassword}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Email Verification Code
                    </label>
                    <input
                      type="text"
                      name="emailCode"
                      placeholder="Enter 6-digit code from email"
                      value={verificationFormData.emailCode}
                      onChange={handleVerificationChange}
                      maxLength="6"
                      required
                      style={{
                        width: '100%',
                        padding: '16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '18px',
                        textAlign: 'center',
                        letterSpacing: '2px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {hasPhone && (
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        SMS Verification Code
                      </label>
                      <input
                        type="text"
                        name="smsCode"
                        placeholder="Enter 6-digit code from SMS"
                        value={verificationFormData.smsCode}
                        onChange={handleVerificationChange}
                        maxLength="6"
                        required
                        style={{
                          width: '100%',
                          padding: '16px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '18px',
                          textAlign: 'center',
                          letterSpacing: '2px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  )}

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Create a secure password"
                      value={verificationFormData.password}
                      onChange={handleVerificationChange}
                      minLength="6"
                      required
                      style={{
                        width: '100%',
                        padding: '16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={verificationFormData.confirmPassword}
                      onChange={handleVerificationChange}
                      minLength="6"
                      required
                      style={{
                        width: '100%',
                        padding: '16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {verificationError && (
                    <div style={{
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#dc2626',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      fontSize: '14px'
                    }}>
                      {verificationError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={verificationLoading}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: verificationLoading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: verificationLoading ? 'not-allowed' : 'pointer',
                      marginBottom: '16px'
                    }}
                  >
                    {verificationLoading ? 'Setting Up Account...' : 'Complete Setup'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerificationStep(1)}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'transparent',
                      color: '#64748b',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Resend Codes
                  </button>
                </form>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 style={{
                fontSize: isMobile ? '24px' : '32px',
                fontWeight: '800',
                color: '#0f172a',
                margin: '0 0 8px 0'
              }}>
                {isLogin ? t('welcomeBack') : 'Get Started'}
              </h2>

              <p style={{
                color: '#64748b',
                fontSize: '16px',
                margin: '0 0 32px 0'
              }}>
                {isLogin ? 'Sign in to your account' : 'Enter your school email to begin'}
              </p>

              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label htmlFor="email-input" style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    {t('emailAddress')}
                  </label>
                  <input
                    id="email-input"
                    type="email"
                    name="email"
                    placeholder={t('enterEmail')}
                    value={formData.email}
                    onChange={handleChange}
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

                {isLogin && (
                  <div style={{ marginBottom: '24px' }}>
                    <label htmlFor="password-input" style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      {t('password')}
                    </label>
                    <input
                      id="password-input"
                      type="password"
                      name="password"
                      placeholder={t('enterPassword')}
                      value={formData.password}
                      onChange={handleChange}
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
                    ? (isLogin ? t('loggingIn') : 'Checking Account...')
                    : (isLogin ? t('login') : 'Continue')
                  }
                </button>
              </form>

              <div style={{
                textAlign: 'center',
                fontSize: '14px',
                color: '#64748b'
              }}>
                {isLogin ? 'New to SchoolSync?' : 'Already have an account?'}
                {' '}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setFormData({ username: '', email: '', password: '', confirmPassword: '', role: 'student' });
                  }}
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
                  {isLogin ? 'Get Started' : t('loginHere')}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
