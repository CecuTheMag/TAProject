import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 48, color = '#0f172a' }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      minHeight: '200px'
    }}>
      <motion.div
        style={{
          width: size,
          height: size,
          border: `4px solid rgba(15, 23, 42, 0.1)`,
          borderTop: `4px solid ${color}`,
          borderRadius: '50%'
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
};

export const LoadingBar = ({ progress = 0 }) => {
  return (
    <div style={{
      width: '100%',
      height: '4px',
      backgroundColor: 'rgba(15, 23, 42, 0.1)',
      borderRadius: '2px',
      overflow: 'hidden'
    }}>
      <motion.div
        style={{
          height: '100%',
          background: 'linear-gradient(90deg, #0f172a 0%, #3b82f6 100%)',
          borderRadius: '2px'
        }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
};

export const LoadingDots = () => {
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#0f172a',
            borderRadius: '50%'
          }}
          animate={{
            y: [-4, 4, -4],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;