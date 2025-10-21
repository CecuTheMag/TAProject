import { useState, useEffect } from 'react';
import { equipment as equipmentApi } from '../api';
import { useAuth } from '../AuthContext';
import RepairManagement from './RepairManagement';

const EquipmentDetailsModal = ({ equipment, onClose }) => {
  const [equipmentGroup, setEquipmentGroup] = useState(null);
  const { user } = useAuth();
  
  useEffect(() => {
    if (equipment?.serial_number && ['manager', 'admin'].includes(user?.role)) {
      fetchEquipmentGroup();
    }
  }, [equipment?.serial_number, user?.role]);
  
  const fetchEquipmentGroup = async () => {
    try {
      const response = await equipmentApi.getGroups();
      const baseSerial = equipment.serial_number.replace(/\d{3}$/, '');
      const group = response.data.find(g => g.base_serial === baseSerial);
      setEquipmentGroup(group);
    } catch (error) {
      console.error('Failed to fetch equipment group:', error);
    }
  };
  

  
  if (!equipment) return null;



  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10b981';
      case 'checked_out': return '#f59e0b';
      case 'under_repair': return '#ef4444';
      case 'retired': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'fair': return '#f59e0b';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
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
          alignItems: 'flex-start'
        }}>
          <div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#0f172a',
              margin: '0 0 8px 0',
              fontFamily: '"SF Pro Display", -apple-system, sans-serif'
            }}>
              {equipment.name}
            </h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{
                backgroundColor: getStatusColor(equipment.status) + '20',
                color: getStatusColor(equipment.status),
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'capitalize'
              }}>
                {equipment.status.replace('_', ' ')}
              </span>
              <span style={{
                backgroundColor: getConditionColor(equipment.condition) + '20',
                color: getConditionColor(equipment.condition),
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'capitalize'
              }}>
                {equipment.condition}
              </span>
            </div>
          </div>
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

        {/* Content */}
        <div style={{ padding: '32px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px'
          }}>
            {/* Basic Info */}
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#0f172a',
                margin: '0 0 16px 0'
              }}>
                Basic Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>Type:</span>
                  <p style={{ color: '#0f172a', fontSize: '16px', fontWeight: '600', margin: '4px 0 0 0' }}>
                    {equipment.type}
                  </p>
                </div>
                {equipment.serial_number && (
                  <div>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>Serial Number:</span>
                    <p style={{
                      color: '#0f172a',
                      fontSize: '16px',
                      fontFamily: 'monospace',
                      backgroundColor: '#f8fafc',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      margin: '4px 0 0 0'
                    }}>
                      {equipment.serial_number}
                    </p>
                  </div>
                )}
                {equipment.location && (
                  <div>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>Location:</span>
                    <p style={{ color: '#0f172a', fontSize: '16px', fontWeight: '600', margin: '4px 0 0 0' }}>
                      {equipment.location}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#0f172a',
                margin: '0 0 16px 0'
              }}>
                Additional Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>Added:</span>
                  <p style={{ color: '#0f172a', fontSize: '16px', fontWeight: '600', margin: '4px 0 0 0' }}>
                    {new Date(equipment.created_at).toLocaleDateString()}
                  </p>
                </div>

                {equipment.requires_approval && (
                  <div style={{
                    backgroundColor: '#fef3c7',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #f59e0b'
                  }}>
                    <p style={{
                      color: '#92400e',
                      fontSize: '14px',
                      fontWeight: '600',
                      margin: 0
                    }}>
                      ⚠️ Requires Admin Approval
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Repair Management Section */}
          {['manager', 'admin'].includes(user?.role) && equipmentGroup && equipment.status !== 'retired' && (
            <RepairManagement 
              equipmentGroup={equipmentGroup}
              onRepairComplete={() => {
                fetchEquipmentGroup();
                // Force refresh parent dashboard
                window.location.reload();
              }}
            />
          )}

          {/* Retired Item Notice */}
          {equipment.status === 'retired' && (
            <div style={{
              marginTop: '32px',
              padding: '24px',
              backgroundColor: '#f3f4f6',
              borderRadius: '12px',
              border: '1px solid #d1d5db',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#6b7280',
                margin: '0 0 8px 0'
              }}>
                ✖ Retired Equipment
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '14px',
                margin: 0
              }}>
                This equipment has been retired from active service and is no longer available for use.
              </p>
            </div>
          )}

          {/* QR Code Section */}
          {equipment.qr_code && (
            <div style={{
              marginTop: '32px',
              padding: '24px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#0f172a',
                margin: '0 0 16px 0'
              }}>
                QR Code
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}>
                <img 
                  src={equipment.qr_code} 
                  alt={`QR Code for ${equipment.serial_number}`}
                  style={{
                    width: '150px',
                    height: '150px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
              </div>
              <p style={{
                color: '#64748b',
                fontSize: '12px',
                margin: '8px 0 0 0'
              }}>
                Serial: {equipment.serial_number}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px 32px 32px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetailsModal;