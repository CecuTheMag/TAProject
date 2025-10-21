import { useState } from 'react';
import { equipment as equipmentApi } from '../api';
import { useAuth } from '../AuthContext';

const RetireFleetSection = ({ equipmentGroup, onRetireComplete }) => {
  const [selectedRetireItems, setSelectedRetireItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  if (user?.role !== 'admin') return null;

  const handleItemSelection = (itemId) => {
    setSelectedRetireItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleRetireFleet = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await equipmentApi.retireFleet({ ids: selectedRetireItems });
      setSelectedRetireItems([]);
      onRetireComplete();
    } catch (error) {
      console.error('Failed to retire fleet:', error);
      alert('Failed to retire fleet');
    } finally {
      setLoading(false);
    }
  };

  const activeItems = equipmentGroup?.items?.filter(item => 
    ['available', 'checked_out', 'under_repair'].includes(item.status)
  ) || [];

  if (activeItems.length === 0) return null;

  return (
    <form onSubmit={handleRetireFleet}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
          🗑️ Retire Fleet Items
        </label>
        <div style={{ 
          maxHeight: '150px', 
          overflowY: 'auto', 
          border: '2px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '8px' 
        }}>
          {activeItems.map(item => (
            <label key={item.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              cursor: 'pointer',
              borderRadius: '4px',
              backgroundColor: selectedRetireItems.includes(item.id) ? '#fef2f2' : 'transparent'
            }}>
              <input
                type="checkbox"
                checked={selectedRetireItems.includes(item.id)}
                onChange={() => handleItemSelection(item.id)}
                style={{ margin: 0 }}
              />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>
                {item.serial_number}
              </span>
              <span style={{
                fontSize: '12px',
                padding: '2px 6px',
                borderRadius: '12px',
                backgroundColor: item.status === 'available' ? '#dcfce7' : 
                               item.status === 'checked_out' ? '#fef3c7' : '#fee2e2',
                color: item.status === 'available' ? '#166534' : 
                       item.status === 'checked_out' ? '#92400e' : '#991b1b'
              }}>
                {item.status.replace('_', ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      <button
        type="submit"
        disabled={loading || selectedRetireItems.length === 0}
        style={{
          padding: '12px 24px',
          backgroundColor: loading || selectedRetireItems.length === 0 ? '#9ca3af' : '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: loading || selectedRetireItems.length === 0 ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Processing...' : `Retire ${selectedRetireItems.length} Item(s) from Fleet`}
      </button>
    </form>
  );
};

export default RetireFleetSection;