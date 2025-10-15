import { useState, useEffect } from 'react';
import { alerts } from '../api';
import { useAuth } from '../AuthContext';

const AlertsTab = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [overdueItems, setOverdueItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchAlerts();
  }, [user]);

  const fetchAlerts = async () => {
    if (!['teacher', 'admin'].includes(user?.role)) return;
    
    try {
      setRefreshing(true);
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
      setRefreshing(false);
    }
  };

  const updateThreshold = async (equipmentId, newThreshold) => {
    try {
      await alerts.updateThreshold(equipmentId, newThreshold);
      await fetchAlerts();
    } catch (error) {
      console.error('Failed to update threshold:', error);
    }
  };

  if (!['teacher', 'admin'].includes(user?.role)) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#fef2f2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#ef4444">
            <path d="M12,2L13.09,8.26L22,9L17,14L18.18,22L12,19L5.82,22L7,14L2,9L10.91,8.26L12,2Z"/>
          </svg>
        </div>
        <h2 style={{ color: '#0f172a', margin: 0 }}>Access Restricted</h2>
        <p style={{ color: '#64748b', margin: 0 }}>Only teachers and administrators can view system alerts.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #0f172a',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#64748b' }}>Loading system alerts...</p>
      </div>
    );
  }

  const totalAlerts = lowStockItems.length + overdueItems.length;
  const criticalAlerts = overdueItems.filter(item => 
    Math.ceil((new Date() - new Date(item.due_date)) / (1000 * 60 * 60 * 24)) > 7
  ).length;

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: '40px',
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#0f172a',
              margin: '0 0 8px 0'
            }}>
              System Alerts
            </h1>
            <p style={{ color: '#64748b', margin: 0 }}>
              Monitor equipment status and take action on critical issues
            </p>
          </div>
          
          <button
            onClick={fetchAlerts}
            disabled={refreshing}
            style={{
              padding: '12px 24px',
              backgroundColor: refreshing ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{
              animation: refreshing ? 'spin 1s linear infinite' : 'none'
            }}>
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
            </svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Alert Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: `2px solid ${totalAlerts > 0 ? '#dc2626' : '#16a34a'}`,
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: '800',
              color: totalAlerts > 0 ? '#dc2626' : '#16a34a',
              marginBottom: '8px'
            }}>
              {totalAlerts}
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Total Alerts
            </div>
          </div>
          
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: `2px solid ${criticalAlerts > 0 ? '#dc2626' : '#6b7280'}`,
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: '800',
              color: criticalAlerts > 0 ? '#dc2626' : '#6b7280',
              marginBottom: '8px'
            }}>
              {criticalAlerts}
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Critical (7+ days)
            </div>
          </div>
          
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: `2px solid ${lowStockItems.length > 0 ? '#ea580c' : '#6b7280'}`,
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: '800',
              color: lowStockItems.length > 0 ? '#ea580c' : '#6b7280',
              marginBottom: '8px'
            }}>
              {lowStockItems.length}
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Low Stock
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        padding: '0 40px',
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)'
      }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {[
            { id: 'overview', label: 'Overview', count: totalAlerts },
            { id: 'stock', label: 'Low Stock', count: lowStockItems.length },
            { id: 'overdue', label: 'Overdue', count: overdueItems.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '16px 24px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #3b82f6' : '3px solid transparent',
                color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  backgroundColor: activeTab === tab.id ? '#3b82f6' : '#ef4444',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  minWidth: '20px',
                  textAlign: 'center'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ padding: '40px' }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gap: '32px' }}>
            {totalAlerts === 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '60px',
                textAlign: 'center',
                border: '2px solid #16a34a',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="#16a34a">
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                  </svg>
                </div>
                <h3 style={{ color: '#0f172a', fontSize: '24px', fontWeight: '700', margin: '0 0 12px 0' }}>
                  All Systems Normal
                </h3>
                <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
                  No alerts detected. All equipment is properly stocked and returned on time.
                </p>
              </div>
            ) : (
              <>
                {lowStockItems.length > 0 && (
                  <AlertSection
                    title="Low Stock Items"
                    items={lowStockItems.slice(0, 3)}
                    type="stock"
                    onUpdateThreshold={updateThreshold}
                    showMore={lowStockItems.length > 3}
                    onShowMore={() => setActiveTab('stock')}
                  />
                )}
                {overdueItems.length > 0 && (
                  <AlertSection
                    title="Overdue Equipment"
                    items={overdueItems.slice(0, 3)}
                    type="overdue"
                    showMore={overdueItems.length > 3}
                    onShowMore={() => setActiveTab('overdue')}
                  />
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'stock' && (
          <AlertSection
            title="Low Stock Management"
            items={lowStockItems}
            type="stock"
            onUpdateThreshold={updateThreshold}
            fullView
          />
        )}

        {activeTab === 'overdue' && (
          <AlertSection
            title="Overdue Equipment Management"
            items={overdueItems}
            type="overdue"
            fullView
          />
        )}
      </div>
    </div>
  );
};

const AlertSection = ({ title, items, type, onUpdateThreshold, showMore, onShowMore, fullView }) => {
  if (items.length === 0) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        border: '2px solid #10b981'
      }}>
        <h3 style={{ color: '#065f46', margin: '0 0 8px 0' }}>
          {type === 'stock' ? 'All Equipment Adequately Stocked' : 'No Overdue Equipment'}
        </h3>
        <p style={{ color: '#047857', margin: 0 }}>
          {type === 'stock' ? 'All items are above their stock thresholds.' : 'All borrowed equipment has been returned on time.'}
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#0f172a',
          margin: 0
        }}>
          {title}
        </h3>
        {showMore && (
          <button
            onClick={onShowMore}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            View All ({items.length})
          </button>
        )}
      </div>
      
      <div style={{
        display: 'grid',
        gap: '16px'
      }}>
        {items.map((item) => (
          <AlertCard
            key={item.id}
            item={item}
            type={type}
            onUpdateThreshold={onUpdateThreshold}
          />
        ))}
      </div>
    </div>
  );
};

const AlertCard = ({ item, type, onUpdateThreshold }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [threshold, setThreshold] = useState(item.stock_threshold || 0);

  const handleThresholdUpdate = () => {
    onUpdateThreshold(item.id, threshold);
    setIsEditing(false);
  };

  if (type === 'stock') {
    return (
      <div style={{
        background: 'white',
        border: '2px solid #ea580c',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ flex: 1 }}>
          <h4 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#0f172a',
            margin: '0 0 8px 0'
          }}>
            {item.name}
          </h4>
          <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
            <span>Available: <strong>{item.available}</strong></span>
            <span>Threshold: <strong>{item.stock_threshold}</strong></span>
            <span>Type: <strong>{item.type}</strong></span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isEditing ? (
            <>
              <input
                type="number"
                min="1"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                style={{
                  width: '80px',
                  padding: '8px',
                  border: '2px solid #ea580c',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              />
              <button
                onClick={handleThresholdUpdate}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Edit Threshold
              </button>
              <span style={{
                padding: '8px 16px',
                backgroundColor: '#ea580c',
                color: 'white',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                LOW STOCK
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  const daysOverdue = Math.ceil((new Date() - new Date(item.due_date)) / (1000 * 60 * 60 * 24));
  const isCritical = daysOverdue > 7;

  return (
    <div style={{
      background: 'white',
      border: `2px solid ${isCritical ? '#dc2626' : '#ea580c'}`,
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px'
      }}>
        <div style={{ flex: 1 }}>
          <h4 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#0f172a',
            margin: '0 0 8px 0'
          }}>
            {item.equipment_name}
          </h4>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            <div>Borrowed by: <strong>{item.username}</strong> ({item.email})</div>
            <div>Due date: <strong>{new Date(item.due_date).toLocaleDateString()}</strong></div>
          </div>
        </div>
        
        <span style={{
          padding: '8px 16px',
          backgroundColor: isCritical ? '#dc2626' : '#ea580c',
          color: 'white',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '700'
        }}>
          {isCritical ? 'CRITICAL' : 'OVERDUE'}
        </span>
      </div>
      
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#6b7280">
            <path d="M12,2L13.09,8.26L22,9L17,14L18.18,22L12,19L5.82,22L7,14L2,9L10.91,8.26L12,2Z"/>
          </svg>
          <span style={{
            color: '#374151',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {daysOverdue} days overdue
            {isCritical && ' - Requires immediate attention'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AlertsTab;