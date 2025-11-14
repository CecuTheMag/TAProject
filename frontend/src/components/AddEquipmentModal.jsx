import { useState } from 'react';
import { equipment } from '../api';
import { useTranslation } from '../translations';

const AddEquipmentModal = ({ onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    serial_number: '',
    condition: 'good',
    status: 'available',
    location: '',
    quantity: 1,
    stock_threshold: 2,
    requires_approval: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Sending equipment data:', formData);
      const response = await equipment.create(formData);
      console.log('Equipment created:', response.data);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Equipment creation error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.error || err.message || t('failedToAdd'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90%',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '32px 32px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#0f172a',
            margin: 0,
            fontFamily: '"SF Pro Display", -apple-system, sans-serif'
          }}>
            {t('addNewEquipment')}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                {t('equipmentName')} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder={t('equipmentNamePlaceholder')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                {t('type')} *
              </label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                placeholder={t('typePlaceholder')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                {t('serialNumber')}
              </label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                placeholder={t('serialPlaceholder')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                {t('location')}
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder={t('locationPlaceholder')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                {t('condition')} *
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="excellent">{t('excellent')}</option>
                <option value="good">{t('good')}</option>
                <option value="fair">{t('fair')}</option>
                <option value="poor">{t('poor')}</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                {t('status')} *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="available">{t('available')}</option>
                <option value="under_repair">{t('underRepair')}</option>
                <option value="retired">{t('retired')}</option>
              </select>
            </div>


            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                {t('quantity')} *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                {t('lowStockThreshold')} *
              </label>
              <input
                type="number"
                name="stock_threshold"
                value={formData.stock_threshold}
                onChange={handleChange}
                min="1"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                name="requires_approval"
                checked={formData.requires_approval}
                onChange={handleChange}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              <div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {t('requiresApproval')}
                </span>
                <div style={{
                  fontSize: '12px',
                  color: '#64748b',
                  marginTop: '4px'
                }}>
                  {t('requiresApprovalDesc')}
                </div>
              </div>
            </label>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #e2e8f0'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: loading ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? t('adding') : t('addEquipmentBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEquipmentModal;