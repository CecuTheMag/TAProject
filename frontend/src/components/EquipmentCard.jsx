// EquipmentCard Component - Individual equipment item display
// Provides interactive card interface with status indicators, actions, and document access
// Supports responsive design and role-based action visibility

import { useState } from 'react';
import { motion } from 'framer-motion';
import DocumentViewer from './DocumentViewer';

/**
 * Equipment Card Component
 * Displays individual equipment items with:
 * - Visual status and condition indicators
 * - Interactive action buttons (view, request, documents)
 * - Responsive layout for mobile and desktop
 * - Smooth animations and hover effects
 */
const EquipmentCard = ({ item, onViewDetails, onRequest, onEarlyReturn, user, isMobile }) => {
  const [showDocuments, setShowDocuments] = useState(false);
  
  /**
   * Get current display status for the equipment
   * Could be extended for custom status logic
   */
  const getDisplayStatus = (item) => {
    return item.status;
  };
  
  /**
   * Status color mapping for visual indicators
   * Provides consistent color scheme across the application
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10b981';    // Green - ready for use
      case 'checked_out': return '#f59e0b';  // Amber - currently borrowed
      case 'under_repair': return '#ef4444'; // Red - needs maintenance
      case 'retired': return '#6b7280';      // Gray - no longer in service
      default: return '#6b7280';             // Default gray
    }
  };

  /**
   * Condition color mapping for equipment state
   * Helps users quickly assess equipment quality
   */
  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return '#10b981';    // Green - perfect condition
      case 'good': return '#3b82f6';         // Blue - good working order
      case 'fair': return '#f59e0b';         // Amber - some wear
      case 'poor': return '#ef4444';         // Red - needs attention
      default: return '#6b7280';             // Default gray
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: isMobile ? '16px' : '20px',
        padding: isMobile ? '20px' : '28px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
      {/* Status Indicator */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '4px',
        height: '100%',
        background: getStatusColor(getDisplayStatus(item))
      }}></div>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: isMobile ? '16px' : '20px',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '0'
      }}>
        <h3 style={{
          fontSize: isMobile ? '18px' : '20px',
          fontWeight: '700',
          color: '#0f172a',
          margin: 0,
          lineHeight: '1.3',
          fontFamily: '"SF Pro Display", -apple-system, sans-serif'
        }}>
          {item.name}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: isMobile ? 'flex-start' : 'flex-end' }}>
          <span style={{
            backgroundColor: getStatusColor(getDisplayStatus(item)) + '20',
            color: getStatusColor(getDisplayStatus(item)),
            padding: isMobile ? '8px 16px' : '6px 12px',
            borderRadius: '20px',
            fontSize: isMobile ? '14px' : '12px',
            fontWeight: '600',
            textTransform: 'capitalize',
            whiteSpace: 'nowrap'
          }}>
            {getDisplayStatus(item).replace('_', ' ')}
          </span>

        </div>
      </div>

      {/* Details Grid */}
      <div style={{ display: 'grid', gap: isMobile ? '12px' : '16px', marginBottom: isMobile ? '20px' : '24px' }}>
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
        paddingTop: isMobile ? '16px' : '20px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        gap: isMobile ? '8px' : '12px',
        flexDirection: isMobile ? 'column' : 'row'
      }}>
        <div style={{
          display: 'flex',
          gap: isMobile ? '8px' : '12px',
          flex: 1
        }}>
          <button
            onClick={() => onViewDetails(item)}
            style={{
              flex: 1,
              padding: isMobile ? '14px 16px' : '12px 16px',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: isMobile ? '16px' : '14px',
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
              padding: isMobile ? '14px 16px' : '12px 16px',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: isMobile ? '16px' : '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
              fontFamily: '"SF Pro Text", -apple-system, sans-serif',
              minWidth: isMobile ? '100px' : 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          </button>
        </div>
        
        {getDisplayStatus(item) === 'available' && (
          <button
            onClick={() => onRequest(item)}
            style={{
              width: '100%',
              padding: isMobile ? '14px 16px' : '12px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: isMobile ? '16px' : '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
              fontFamily: '"SF Pro Text", -apple-system, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5,17H19V19H5V17M12,5A4,4 0 0,1 16,9C16,10.88 14.88,12.53 13.25,13.31L15,22H9L10.75,13.31C9.13,12.53 8,10.88 8,9A4,4 0 0,1 12,5Z"/>
            </svg>
            Request Equipment
          </button>
        )}
        

      </div>


      
      {showDocuments && (
        <DocumentViewer
          equipmentId={item.id}
          onClose={() => setShowDocuments(false)}
        />
      )}
    </motion.div>
  );
};

export default EquipmentCard;