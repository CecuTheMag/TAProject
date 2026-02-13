import { useState } from 'react';
import { motion } from 'framer-motion';
import { auth } from '../api';
import { useAuth } from '../AuthContext';
import logoImage from '../assets/logotp.png';

const VerificationPage = ({ email, onBack }) => {
  const [step, setStep] = useState(1); // 1: send codes, 2: verify and set password
  const [formData, setFormData] = useState({
    emailCode: '',
    smsCode: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [codesSent, setCodesSent] = useState(false);
  const [hasPhone, setHasPhone] = useState(false);
  const { login } = useAuth();

  const sendCodes = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await auth.sendVerificationCodes({ email });
      setCodesSent(true);
      setHasPhone(response.data.hasPhone);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send verification codes');
    } finally {
      setLoading(false);
    }
  };

  const setupPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await auth.setupPassword({
        email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        emailCode: formData.emailCode,
        smsCode: formData.smsCode
      });
      
      login(response.data.user, response.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Password setup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        maxWidth: '500px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        padding: '40px'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <img 
                src={logoImage} 
                alt="SchoolSync Logo" 
                style={{
                  width: '50px',
                  height: '50px',
                  objectFit: 'contain'
                }}
              />
            </div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#0f172a',
              margin: '0 0 8px 0'
            }}>
              First-Time Setup
            </h1>
            <p style={{
              color: '#64748b',
              fontSize: '16px',
              margin: '0'
            }}>
              {step === 1 ? 'Verify your identity to set up your account' : 'Enter verification codes and create your password'}
            </p>
          </div>

          {step === 1 ? (
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
                  Email: <strong>{email}</strong>
                </p>
                <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                  We'll send verification codes to your registered email and phone number.
                </p>
              </div>

              {error && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              <button
                onClick={sendCodes}
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
                  marginBottom: '16px'
                }}
              >
                {loading ? 'Sending Codes...' : 'Send Verification Codes'}
              </button>

              <button
                onClick={onBack}
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
                  value={formData.emailCode}
                  onChange={handleChange}
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
                    value={formData.smsCode}
                    onChange={handleChange}
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
                  value={formData.password}
                  onChange={handleChange}
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
                  value={formData.confirmPassword}
                  onChange={handleChange}
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

              {error && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
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
                  marginBottom: '16px'
                }}
              >
                {loading ? 'Setting Up Account...' : 'Complete Setup'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
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
      </div>
    </div>
  );
};

export default VerificationPage;