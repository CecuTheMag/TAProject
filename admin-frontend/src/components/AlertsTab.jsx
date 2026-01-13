import { useState, useEffect } from 'react';
import { alerts } from '../api';
import { useAuth } from '../AuthContext';
import { useTranslation } from '../translations';

const AlertsTab = () => {
  const { t } = useTranslation();
  const [lowStockItems, setLowStockItems] = useState([]);
  const [overdueItems, setOverdueItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        <h2 style={{ color: '#0f172a', margin: 0 }}>{t('accessRestricted')}</h2>
        <p style={{ color: '#64748b', margin: 0 }}>{t('onlyTeachersAdmins')}</p>
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
        <p style={{ color: '#64748b' }}>{t('loadingSystemAlerts')}</p>
      </div>
    );
  }

  const totalAlerts = lowStockItems.length + overdueItems.length;
  const criticalAlerts = overdueItems.filter(item => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(item.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24)) > 7;
  }).length;

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: isMobile ? '12px' : '40px',
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        margin: '0',
        borderRadius: '0'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'center' : 'center',
          gap: isMobile ? '16px' : '0',
          marginBottom: '24px',
          width: '100%',
          maxWidth: isMobile ? 'calc(100vw - 24px)' : '100%',
          boxSizing: 'border-box'
        }}>
          <div>
            <h1 style={{
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: '800',
              color: '#0f172a',
              margin: '0 0 8px 0',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              {t('systemAlerts')}
            </h1>
            <p style={{ 
              color: '#64748b', 
              margin: 0,
              textAlign: isMobile ? 'center' : 'left',
              fontSize: isMobile ? '14px' : '16px'
            }}>
              {t('monitorEquipmentStatus')}
            </p>
          </div>
          
          <button
            onClick={fetchAlerts}
            disabled={refreshing}
            style={{
              padding: isMobile ? '10px 20px' : '12px 24px',
              backgroundColor: refreshing ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: '600',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              maxWidth: isMobile ? 'calc(100vw - 24px)' : 'auto',
              boxSizing: 'border-box'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{
              animation: refreshing ? 'spin 1s linear infinite' : 'none'
            }}>
              <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
            </svg>
            {refreshing ? t('refreshing') : t('refresh')}
          </button>
        </div>

        {/* Alert Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: isMobile ? '8px' : '16px',
          width: '100%',
          maxWidth: '100%'
        }}>
          <div style={{
            background: 'white',
            padding: isMobile ? '12px' : '24px',
            borderRadius: '12px',
            border: `2px solid ${totalAlerts > 0 ? '#dc2626' : '#16a34a'}`,
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: isMobile ? 'calc(100vw - 24px)' : '100%',
            minWidth: 0,
            boxSizing: 'border-box'
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
              {t('totalAlerts')}
            </div>
          </div>
          
          <div style={{
            background: 'white',
            padding: isMobile ? '12px' : '24px',
            borderRadius: '12px',
            border: `2px solid ${criticalAlerts > 0 ? '#dc2626' : '#6b7280'}`,
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: isMobile ? 'calc(100vw - 24px)' : '100%',
            minWidth: 0,
            boxSizing: 'border-box'
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
              {t('criticalDays')}
            </div>
          </div>
          
          <div style={{
            background: 'white',
            padding: isMobile ? '12px' : '24px',
            borderRadius: '12px',
            border: `2px solid ${lowStockItems.length > 0 ? '#ea580c' : '#6b7280'}`,
            textAlign: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: isMobile ? 'calc(100vw - 24px)' : '100%',
            minWidth: 0,
            boxSizing: 'border-box'
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
              {t('lowStock')}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        padding: isMobile ? '0 12px' : '0 40px',
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
        margin: '0',
        overflowX: isMobile ? 'auto' : 'visible'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '0',
          minWidth: isMobile ? 'max-content' : 'auto',
          width: '100%',
          maxWidth: isMobile ? 'calc(100vw - 24px)' : '100%',
          boxSizing: 'border-box',
          justifyContent: isMobile ? 'center' : 'flex-start'
        }}>
          {[
            { id: 'overview', label: t('overview'), count: totalAlerts },
            { id: 'stock', label: t('lowStock'), count: lowStockItems.length },
            { id: 'overdue', label: t('overdue'), count: overdueItems.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: isMobile ? '12px 16px' : '16px 24px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #3b82f6' : '3px solid transparent',
                color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxSizing: 'border-box'
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
      <div style={{ 
        padding: isMobile ? '12px' : '40px',
        margin: '0'
      }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gap: '32px' }}>
            {totalAlerts === 0 ? (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: isMobile ? '40px 20px' : '60px',
                textAlign: 'center',
                border: '2px solid #16a34a',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                width: '100%',
                maxWidth: isMobile ? 'calc(100vw - 24px)' : '100%',
                minWidth: 0,
                boxSizing: 'border-box'
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
                  {t('allSystemsNormal')}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
                  {t('noAlertsDetected')}
                </p>
              </div>
            ) : (
              <>
                {lowStockItems.length > 0 && (
                  <AlertSection
                    title={t('lowStockItems')}
                    items={lowStockItems.slice(0, 3)}
                    type="stock"
                    onUpdateThreshold={updateThreshold}
                    showMore={lowStockItems.length > 3}
                    onShowMore={() => setActiveTab('stock')}
                    isMobile={isMobile}
                  />
                )}
                {overdueItems.length > 0 && (
                  <AlertSection
                    title={t('overdueEquipment')}
                    items={overdueItems.slice(0, 3)}
                    type="overdue"
                    showMore={overdueItems.length > 3}
                    onShowMore={() => setActiveTab('overdue')}
                    isMobile={isMobile}
                  />
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'stock' && (
          <AlertSection
            title={t('lowStockManagement')}
            items={lowStockItems}
            type="stock"
            onUpdateThreshold={updateThreshold}
            fullView
            isMobile={isMobile}
          />
        )}

        {activeTab === 'overdue' && (
          <AlertSection
            title={t('overdueEquipmentManagement')}
            items={overdueItems}
            type="overdue"
            fullView
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
};

const AlertSection = ({ title, items, type, onUpdateThreshold, showMore, onShowMore, fullView, isMobile }) => {
  const { t } = useTranslation();
  if (items.length === 0) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '12px',
        padding: isMobile ? '24px' : '40px',
        textAlign: 'center',
        border: '2px solid #10b981',
        width: '100%',
        maxWidth: isMobile ? 'calc(100vw - 24px)' : '100%',
        minWidth: 0,
        boxSizing: 'border-box'
      }}>
        <h3 style={{ color: '#065f46', margin: '0 0 8px 0' }}>
          {type === 'stock' ? t('allEquipmentStocked') : t('noOverdueEquipment')}
        </h3>
        <p style={{ color: '#047857', margin: 0 }}>
          {type === 'stock' ? t('allItemsAboveThreshold') : t('allEquipmentReturned')}
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '12px',
      padding: isMobile ? '16px' : '32px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      width: '100%',
      maxWidth: isMobile ? 'calc(100vw - 24px)' : '100%',
      minWidth: 0,
      boxSizing: 'border-box'
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
            {t('viewAll')} ({items.length})
          </button>
        )}
      </div>
      
      <div style={{
        display: 'grid',
        gap: '16px'
      }}>
        {items.map((item, index) => (
          <AlertCard
            key={item.id || item.base_serial || `${type}-${index}`}
            item={item}
            type={type}
            onUpdateThreshold={onUpdateThreshold}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  );
};

const AlertCard = ({ item, type, onUpdateThreshold, isMobile }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [threshold, setThreshold] = useState(item.stock_threshold || 0);

  const handleThresholdUpdate = () => {
    // Use base_serial for group updates
    const baseSerial = item.base_serial;
    if (baseSerial) {
      onUpdateThreshold(baseSerial, threshold);
      setIsEditing(false);
    } else {
      console.error('No base serial found for threshold update');
    }
  };

  if (type === 'stock') {
    return (
      <div style={{
        background: 'white',
        border: '2px solid #ea580c',
        borderRadius: '12px',
        padding: isMobile ? '12px' : '24px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? '16px' : '0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: isMobile ? 'calc(100vw - 24px)' : '100%',
        minWidth: 0,
        boxSizing: 'border-box'
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
          <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6b7280', flexWrap: 'wrap' }}>
            <span>{t('available')}: <strong>{item.available_count || item.available || 0}</strong></span>
            <span>{t('threshold')}: <strong>{item.stock_threshold}</strong></span>
            {!isMobile && <span>{t('type')}: <strong>{item.type}</strong></span>}
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: isMobile ? 'center' : 'flex-start'
        }}>
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
                {t('save')}
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
                {t('cancel')}
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
                {t('editThreshold')}
              </button>
              <span style={{
                padding: '8px 16px',
                backgroundColor: '#ea580c',
                color: 'white',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                {t('lowStockLabel')}
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(item.due_date);
  dueDate.setHours(0, 0, 0, 0);
  const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
  const isCritical = daysOverdue > 7;

  return (
    <div style={{
      background: 'white',
      border: `2px solid ${isCritical ? '#dc2626' : '#ea580c'}`,
      borderRadius: '12px',
      padding: isMobile ? '12px' : '24px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: isMobile ? 'calc(100vw - 24px)' : '100%',
      minWidth: 0,
      boxSizing: 'border-box'
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
            <div>{t('borrowedBy')}: <strong>{item.username}</strong> ({item.email})</div>
            <div>{t('dueDate')}: <strong>{new Date(item.due_date).toLocaleDateString()}</strong></div>
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
          {isCritical ? t('criticalLabel') : t('overdueLabel')}
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
            {daysOverdue} {t('daysOverdue')}
            {isCritical && ` - ${t('requiresAttention')}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AlertsTab;