import { motion, AnimatePresence } from 'framer-motion';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
  const getColors = () => {
    switch (type) {
      case 'danger':
        return { bg: '#ef4444', hover: '#dc2626' };
      case 'warning':
        return { bg: '#f59e0b', hover: '#d97706' };
      case 'success':
        return { bg: '#10b981', hover: '#059669' };
      default:
        return { bg: '#3b82f6', hover: '#2563eb' };
    }
  };

  const colors = getColors();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
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
        }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#0f172a',
            margin: '0 0 12px 0'
          }}>
            {title}
          </h3>
          
          <p style={{
            color: '#64748b',
            fontSize: '16px',
            lineHeight: '1.5',
            margin: '0 0 24px 0'
          }}>
            {message}
          </p>
          
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={onCancel}
              style={{
                padding: '12px 24px',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              style={{
                padding: '12px 24px',
                backgroundColor: colors.bg,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = colors.hover}
              onMouseLeave={(e) => e.target.style.backgroundColor = colors.bg}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmDialog;