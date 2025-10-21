import { useState } from 'react';
import { equipment as equipmentApi } from '../api';
import RetireFleetSection from './RetireFleetSection';

const RepairManagement = ({ equipmentGroup, onRepairComplete }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedRepairItems, setSelectedRepairItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [repairCondition, setRepairCondition] = useState('good');

  const handleItemSelection = (itemId, type) => {
    if (type === 'repair') {
      setSelectedItems(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      setSelectedRepairItems(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    }
  };

  const handleRepairSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await equipmentApi.updateRepair({ ids: selectedItems });
      setSelectedItems([]);
      onRepairComplete();
    } catch (error) {
      console.error('Failed to update repair status:', error);
      alert('Failed to update repair status');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRepair = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await equipmentApi.completeRepair({ ids: selectedRepairItems, condition: repairCondition });
      setSelectedRepairItems([]);
      onRepairComplete();
    } catch (error) {
      console.error('Failed to complete repair:', error);
      alert('Failed to complete repair');
    } finally {
      setLoading(false);
    }
  };

  const availableItems = equipmentGroup?.items?.filter(item => item.status === 'available') || [];
  const repairItems = equipmentGroup?.items?.filter(item => item.status === 'under_repair') || [];

  return (
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
        margin: '0 0 16px 0'
      }}>
        🔧 Repair Management
      </h3>
      
      <div style={{ marginBottom: '24px' }}>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0' }}>
          Available: {equipmentGroup.available_count} | 
          Under Repair: {equipmentGroup.under_repair_count} | 
          Checked Out: {equipmentGroup.checked_out_count}
        </p>
      </div>

      {/* Put Items Under Repair */}
      {availableItems.length > 0 && (
        <form onSubmit={handleRepairSubmit} style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Put Items Under Repair
            </label>
            <div style={{ 
              maxHeight: '150px', 
              overflowY: 'auto', 
              border: '2px solid #e5e7eb', 
              borderRadius: '8px', 
              padding: '8px' 
            }}>
              {availableItems.map(item => (
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
                    onChange={() => handleItemSelection(item.id, 'repair')}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>
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
              ))}
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
              cursor: loading || selectedItems.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processing...' : `Put ${selectedItems.length} Item(s) Under Repair`}
          </button>
        </form>
      )}

      {/* Complete Repairs */}
      {repairItems.length > 0 && (
        <form onSubmit={handleCompleteRepair}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Complete Repairs
            </label>
            <div style={{ 
              maxHeight: '150px', 
              overflowY: 'auto', 
              border: '2px solid #e5e7eb', 
              borderRadius: '8px', 
              padding: '8px' 
            }}>
              {repairItems.map(item => (
                <label key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  backgroundColor: selectedRepairItems.includes(item.id) ? '#fef3c7' : 'transparent'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedRepairItems.includes(item.id)}
                    onChange={() => handleItemSelection(item.id, 'complete')}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>
                    {item.serial_number}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    padding: '2px 6px',
                    borderRadius: '12px',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b'
                  }}>
                    under repair
                  </span>
                </label>
              ))}
            </div>
          </div>

          {selectedRepairItems.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                New Condition After Repair
              </label>
              <select
                value={repairCondition}
                onChange={(e) => setRepairCondition(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || selectedRepairItems.length === 0}
            style={{
              padding: '12px 24px',
              backgroundColor: loading || selectedRepairItems.length === 0 ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading || selectedRepairItems.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processing...' : `Complete Repair for ${selectedRepairItems.length} Item(s)`}
          </button>
        </form>
      )}

      {/* Retire Fleet */}
      <RetireFleetSection 
        equipmentGroup={equipmentGroup}
        onRetireComplete={onRepairComplete}
      />
    </div>
  );
};

export default RepairManagement;