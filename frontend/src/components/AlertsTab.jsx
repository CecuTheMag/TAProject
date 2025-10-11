import { useState, useEffect } from 'react';
import { alerts } from '../api';
import { useAuth } from '../AuthContext';

const AlertsTab = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [overdueItems, setOverdueItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const [lowStockResponse, overdueResponse] = await Promise.all([
          alerts.getLowStock(),
          alerts.getOverdue()
        ]);
        setLowStockItems(lowStockResponse.data);
        setOverdueItems(overdueResponse.data);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchAlerts();
    }
  }, [user]);

  const updateThreshold = async (equipmentId, newThreshold) => {
    try {
      await alerts.updateThreshold(equipmentId, newThreshold);
      // Refresh data
      const response = await alerts.getLowStock();
      setLowStockItems(response.data);
    } catch (error) {
      console.error('Failed to update threshold:', error);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Only administrators can view alerts.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #0f172a',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'white',
        padding: '32px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#0f172a',
          margin: '0 0 8px 0'
        }}>
          System Alerts
        </h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          Monitor low stock and overdue equipment
        </p>
      </div>

      <div style={{ padding: '32px' }}>
        {/* Low Stock Alerts */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '16px'
          }}>
            Low Stock Alerts ({lowStockItems.length})
          </h2>
          
          {lowStockItems.length === 0 ? (
            <div style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#10b981', fontSize: '16px', fontWeight: '600' }}>
                ✓ All equipment is adequately stocked
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'white',
                    border: '1px solid #f59e0b',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#0f172a',
                      margin: '0 0 8px 0'
                    }}>
                      {item.name}
                    </h3>
                    <p style={{ color: '#64748b', margin: 0 }}>
                      Available: {item.available} | Threshold: {item.stock_threshold}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="number"
                      min="1"
                      defaultValue={item.stock_threshold}
                      onBlur={(e) => updateThreshold(item.id, parseInt(e.target.value))}
                      style={{
                        width: '80px',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px'
                      }}
                    />
                    <span style={{
                      padding: '6px 12px',
                      backgroundColor: '#f59e0b',
                      color: 'white',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      LOW STOCK
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overdue Equipment */}
        <div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '16px'
          }}>
            Overdue Equipment ({overdueItems.length})
          </h2>
          
          {overdueItems.length === 0 ? (
            <div style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#10b981', fontSize: '16px', fontWeight: '600' }}>
                ✓ No overdue equipment
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {overdueItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'white',
                    border: '1px solid #ef4444',
                    borderRadius: '12px',
                    padding: '20px'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#0f172a',
                        margin: '0 0 8px 0'
                      }}>
                        {item.equipment_name}
                      </h3>
                      <p style={{ color: '#64748b', margin: '0 0 4px 0' }}>
                        Borrowed by: {item.username} ({item.email})
                      </p>
                      <p style={{ color: '#64748b', margin: 0 }}>
                        Due: {new Date(item.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <span style={{
                      padding: '6px 12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      OVERDUE
                    </span>
                  </div>
                  
                  <div style={{
                    backgroundColor: '#fef2f2',
                    padding: '12px',
                    borderRadius: '8px'
                  }}>
                    <p style={{
                      color: '#dc2626',
                      fontSize: '14px',
                      margin: 0,
                      fontWeight: '500'
                    }}>
                      {Math.ceil((new Date() - new Date(item.due_date)) / (1000 * 60 * 60 * 24))} days overdue
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsTab;