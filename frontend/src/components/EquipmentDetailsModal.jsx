import { useState, useEffect } from 'react';
import { equipment as equipmentApi } from '../api';
import { useAuth } from '../AuthContext';

const EquipmentDetailsModal = ({ equipment, onClose }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
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
  
  const handleRepairSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await equipmentApi.updateRepair({ ids: selectedItems });
      alert(`${selectedItems.length} items put under repair successfully`);
      onClose();
    } catch (error) {
      console.error('Failed to update repair status:', error);
      alert('Failed to update repair status');
    } finally {
      setLoading(false);
    }
  };
  
  const handleItemSelection = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };
  
  const availableItems = equipmentGroup?.items?.filter(item => item.status === 'available') || [];
  
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
          {['manager', 'admin'].includes(user?.role) && equipmentGroup && (
            <div style={{
              marginTop: '32px',
              padding: '24px',
              backgroundColor: '#fef2f2',
              borderRadius: '12px',
              border: '1px solid #fecaca'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#0f172a',
                margin: '0 0 16px 0',
                fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                🔧 Repair Management
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0', fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                  Available: {equipmentGroup.available_count} | 
                  Under Repair: {equipmentGroup.under_repair_count} | 
                  Checked Out: {equipmentGroup.checked_out_count}
                </p>
              </div>
              
              <form onSubmit={handleRepairSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                    Select Items to Repair
                  </label>
                  <div style={{ 
                    maxHeight: '200px', 
                    overflowY: 'auto', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '8px', 
                    padding: '8px' 
                  }}>
                    {availableItems.length === 0 ? (
                      <p style={{ color: '#64748b', fontSize: '14px', margin: '8px', textAlign: 'center', fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                        No available items to repair
                      </p>
                    ) : (
                      availableItems.map(item => (
                        <label key={item.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          backgroundColor: selectedItems.includes(item.id) ? '#f0f9ff' : 'transparent'
                        }}>
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleItemSelection(item.id)}
                            style={{ margin: 0 }}
                          />
                          <span style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a', fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                            {item.serial_number}
                          </span>
                          <span style={{
                            fontSize: '12px',
                            padding: '2px 6px',
                            borderRadius: '12px',
                            backgroundColor: item.condition === 'excellent' ? '#dcfce7' : 
                                           item.condition === 'good' ? '#dbeafe' :
                                           item.condition === 'fair' ? '#fef3c7' : '#fee2e2',
                            color: item.condition === 'excellent' ? '#166534' : 
                                   item.condition === 'good' ? '#1e40af' :
                                   item.condition === 'fair' ? '#92400e' : '#991b1b'
                          }}>
                            {item.condition}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || selectedItems.length === 0}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: loading || selectedItems.length === 0 ? '#9ca3af' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: loading || selectedItems.length === 0 ? 'not-allowed' : 'pointer',
                    fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  {loading ? 'Processing...' : `Put ${selectedItems.length} Item(s) Under Repair`}
                </button>
              </form>
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
                width: '150px',
                height: '150px',
                backgroundColor: 'white',
                border: '2px dashed #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                borderRadius: '8px'
              }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>QR Code Preview</span>
              </div>
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