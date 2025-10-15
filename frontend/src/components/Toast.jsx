import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

let toastId = 0;
const toastCallbacks = new Set();

export const toast = {
  success: (message) => showToast(message, 'success'),
  error: (message) => showToast(message, 'error'),
  warning: (message) => showToast(message, 'warning'),
  info: (message) => showToast(message, 'info')
};

const showToast = (message, type) => {
  const id = ++toastId;
  const toast = { id, message, type };
  toastCallbacks.forEach(callback => callback(toast));
  
  setTimeout(() => {
    toastCallbacks.forEach(callback => callback({ id, remove: true }));
  }, 4000);
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const callback = (toast) => {
      if (toast.remove) {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      } else {
        setToasts(prev => [...prev, toast]);
      }
    };
    
    toastCallbacks.add(callback);
    return () => toastCallbacks.delete(callback);
  }, []);

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return { bg: '#dcfce7', border: '#bbf7d0', text: '#166534' };
      case 'error':
        return { bg: '#fee2e2', border: '#fecaca', text: '#991b1b' };
      case 'warning':
        return { bg: '#fef3c7', border: '#fde68a', text: '#92400e' };
      default:
        return { bg: '#dbeafe', border: '#bfdbfe', text: '#1e40af' };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <AnimatePresence>
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              style={{
                backgroundColor: styles.bg,
                border: `1px solid ${styles.border}`,
                color: styles.text,
                padding: '16px 20px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                maxWidth: '400px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            >
              {toast.message}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;