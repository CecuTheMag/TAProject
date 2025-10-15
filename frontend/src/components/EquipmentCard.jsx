import { useState } from 'react';
import DocumentViewer from './DocumentViewer';

const EquipmentCard = ({ item, onViewDetails, onRequest, user }) => {
  const [showDocuments, setShowDocuments] = useState(false);
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
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '20px',
      padding: '28px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.12)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0) scale(1)';
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
    }}>
      {/* Status Indicator */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '4px',
        height: '100%',
        background: getStatusColor(item.status)
      }}></div>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#0f172a',
          margin: 0,
          lineHeight: '1.3',
          fontFamily: '"SF Pro Display", -apple-system, sans-serif'
        }}>
          {item.name}
        </h3>
        <span style={{
          backgroundColor: getStatusColor(item.status) + '20',
          color: getStatusColor(item.status),
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          textTransform: 'capitalize',
          whiteSpace: 'nowrap'
        }}>
          {item.status.replace('_', ' ')}
        </span>
      </div>

      {/* Details Grid */}
      <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: '#64748b' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.5,7A1.5,1.5 0 0,1 4,5.5A1.5,1.5 0 0,1 5.5,4A1.5,1.5 0 0,1 7,5.5A1.5,1.5 0 0,1 5.5,7M21.41,11.58L12.41,2.58C12.05,2.22 11.55,2 11,2H4C2.89,2 2,2.89 2,4V11C2,11.55 2.22,12.05 2.59,12.41L11.58,21.41C11.95,21.77 12.45,22 13,22C13.55,22 14.05,21.77 14.41,21.41L21.41,14.41C21.77,14.05 22,13.55 22,13C22,12.45 21.77,11.95 21.41,11.58Z"/>
            </svg>
          </div>
          <div>
            <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Type: </span>
            <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: '600' }}>{item.type}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: '#64748b' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
            </svg>
          </div>
          <div>
            <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Condition: </span>
            <span style={{
              color: getConditionColor(item.condition),
              fontSize: '14px',
              fontWeight: '600',
              textTransform: 'capitalize'
            }}>
              {item.condition}
            </span>
          </div>
        </div>

        {item.serial_number && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ color: '#64748b' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M4,6V18H20V6H4M6,9H18V11H6V9M6,13H16V15H6V13Z"/>
              </svg>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Serial: </span>
              <span style={{
                color: '#0f172a',
                fontSize: '14px',
                fontFamily: 'monospace',
                backgroundColor: '#f8fafc',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {item.serial_number}
              </span>
            </div>
          </div>
        )}

        {item.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ color: '#64748b' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
              </svg>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Location: </span>
              <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: '600' }}>{item.location}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{
        paddingTop: '20px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        gap: '12px'
      }}>
        <button
          onClick={() => onViewDetails(item)}
          style={{
            flex: 1,
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: '"SF Pro Text", -apple-system, sans-serif'
          }}
          onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'}
          onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'}
        >
          View Details
        </button>
        
        <button
          onClick={() => setShowDocuments(true)}
          style={{
            padding: '12px 16px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            fontFamily: '"SF Pro Text", -apple-system, sans-serif'
          }}
        >
          Documents
        </button>
        
        {item.status === 'available' && (
          <button
            onClick={() => onRequest(item)}
            style={{
              flex: 1,
              padding: '12px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
              fontFamily: '"SF Pro Text", -apple-system, sans-serif'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
          >
            Request
          </button>
        )}
      </div>

      {/* QR Code Indicator */}
      {item.qr_code && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          width: '24px',
          height: '24px',
          background: 'rgba(15, 23, 42, 0.1)',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b'
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3,11H5V13H3V11M11,5H13V9H11V5M9,11H13V15H9V11M15,11H17V13H15V11M19,11H21V13H19V11M5,7H9V11H5V7M3,5H5V7H3V5M3,13H5V15H3V13M7,5H9V7H7V5M3,19H5V21H3V19M7,19H9V21H7V19M11,19H13V21H11V19M15,19H17V21H15V19M19,19H21V21H19V19M15,5H17V7H15V5M19,5H21V7H19V5M15,7H17V9H15V7M19,7H21V9H19V7M15,13H17V15H15V13M19,13H21V15H19V13M15,15H17V17H15V15M19,15H21V17H19V15M15,17H17V19H15V17M19,17H21V19H19V17Z"/>
          </svg>
        </div>
      )}
      
      {showDocuments && (
        <DocumentViewer
          equipmentId={item.id}
          onClose={() => setShowDocuments(false)}
        />
      )}
    </div>
  );
};

export default EquipmentCard;