import { motion } from 'framer-motion';
import { equipment } from '../api';
import { toast } from './Toast';
import { useTranslation } from '../translations';

const EquipmentFleetSection = ({ equipmentFleets, isMobile, onDelete }) => {
  const { t } = useTranslation();
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
    <div style={{ padding: isMobile ? '12px' : '32px' }}>
      <h2 style={{ 
        margin: '0 0 24px 0', 
        color: '#0f172a', 
        fontSize: isMobile ? '20px' : '24px', 
        fontWeight: '700' 
      }}>
        {t('equipmentFleet')} Management
      </h2>

      {equipmentFleets.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 24px',
          color: '#64748b',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px'
        }}>
          <h3>{t('noEquipmentFleets')}</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {equipmentFleets.map((fleet) => (
            <motion.div
              key={fleet.base_serial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '16px',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '12px' : '0'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>
                    {fleet.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ 
                      background: '#dbeafe', 
                      color: '#1d4ed8', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '12px' 
                    }}>
                      {fleet.type}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>
                      {fleet.total_count} {t('items')} • {fleet.available_count} {t('available')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(fleet.base_serial, 'fleet')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {t('deleteFleet')}
                </button>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '8px' 
              }}>
                {fleet.items.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>
                        {item.serial_number}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <span style={{
                          padding: '2px 6px',
                          backgroundColor: getStatusColor(item.status),
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '10px'
                        }}>
                          {t(item.status)}
                        </span>
                        <span style={{
                          padding: '2px 6px',
                          backgroundColor: getConditionColor(item.condition),
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '10px'
                        }}>
                          {t(item.condition)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onDelete(item.id, 'equipment')}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {t('delete')}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipmentFleetSection;