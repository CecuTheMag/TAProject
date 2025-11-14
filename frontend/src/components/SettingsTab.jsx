import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { users } from '../api';
import { useAuth } from '../AuthContext';
import { toast } from './Toast';
import { useTranslation } from '../translations';

const SettingsTab = () => {
  const { user, updateUser } = useAuth();
  const { t, language } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [currentLanguage, setCurrentLanguage] = useState(language);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update basic profile info
      if (formData.username !== user.username || formData.email !== user.email) {
        const response = await users.updateProfile(user.id, {
          username: formData.username,
          email: formData.email
        });
        updateUser(response.data);
        toast.success(t('profileUpdatedSuccess'));
      }

      // Update password if provided
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error(t('passwordsDoNotMatch'));
          return;
        }
        
        await users.updatePassword(user.id, {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        });
        
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        toast.success(t('passwordUpdatedSuccess'));
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || t('updateProfileError');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    toast.success(newLanguage === 'en' ? 'Language changed to English' : 'Езикът е сменен на български');
    window.location.reload(); // Reload to apply translations
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: isMobile ? '16px' : '32px',
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        textAlign: isMobile ? 'center' : 'left'
      }}>
        <h1 style={{
          fontSize: isMobile ? '24px' : '32px',
          fontWeight: '800',
          color: '#0f172a',
          margin: '0 0 8px 0'
        }}>
          {t('settings')}
        </h1>
        <p style={{
          color: '#64748b',
          fontSize: isMobile ? '14px' : '16px',
          fontWeight: '500',
          margin: 0
        }}>
          {t('settingsDescription')}
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: isMobile ? '16px' : '32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '24px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          
          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(226, 232, 240, 0.3)'
            }}
          >
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 20px 0'
            }}>
              {t('profileSettings')}
            </h2>

            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  {t('username')}
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{
                borderTop: '1px solid #e5e7eb',
                paddingTop: '16px',
                marginTop: '8px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#0f172a',
                  margin: '0 0 16px 0'
                }}>
                  {t('changePassword')}
                </h3>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '14px'
                  }}>
                    {t('currentPassword')}
                  </label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => handleChange('currentPassword', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '14px'
                  }}>
                    {t('newPassword')}
                  </label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => handleChange('newPassword', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '14px'
                  }}>
                    {t('confirmNewPassword')}
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {loading ? t('updating') : t('updateProfile')}
              </button>
            </form>
          </motion.div>

          {/* Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(226, 232, 240, 0.3)'
            }}
          >
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 20px 0'
            }}>
              {t('preferences')}
            </h2>

            {/* Language Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '12px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '16px'
              }}>
                {t('language')}
              </label>
              <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                <button
                  onClick={() => handleLanguageChange('en')}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    background: currentLanguage === 'en' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'rgba(255, 255, 255, 0.8)',
                    color: currentLanguage === 'en' ? 'white' : '#374151',
                    border: currentLanguage === 'en' ? 'none' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  🇺🇸 English
                </button>
                <button
                  onClick={() => handleLanguageChange('bg')}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    background: currentLanguage === 'bg' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'rgba(255, 255, 255, 0.8)',
                    color: currentLanguage === 'bg' ? 'white' : '#374151',
                    border: currentLanguage === 'bg' ? 'none' : '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  🇧🇬 Български
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div style={{
              borderTop: '1px solid #e5e7eb',
              paddingTop: '20px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#0f172a',
                margin: '0 0 16px 0'
              }}>
                {t('accountInformation')}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontWeight: '600', color: '#374151' }}>{t('role')}</span>
                  <span style={{
                    padding: '4px 12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {user?.role}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontWeight: '600', color: '#374151' }}>{t('memberSince')}</span>
                  <span style={{ color: '#10b981', fontWeight: '600', fontSize: '14px' }}>
                    {new Date(user?.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;