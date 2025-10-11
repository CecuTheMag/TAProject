import { useState, useEffect } from 'react';

const StatsCard = ({ title, value, icon, color, trend, delay = 0 }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const counter = setInterval(() => {
        current += increment;
        if (current >= value) {
          setAnimatedValue(value);
          clearInterval(counter);
        } else {
          setAnimatedValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(counter);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '28px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f1f5f9',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '100px',
        background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
        borderRadius: '50%',
        transform: 'translate(30px, -30px)'
      }}></div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            {icon}
          </div>
          {trend && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: trend > 0 ? '#10b981' : '#ef4444',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              <span>{trend > 0 ? '↗' : '↘'}</span>
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>

        <div style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#0f172a',
          marginBottom: '8px',
          fontFamily: '"SF Pro Display", -apple-system, sans-serif'
        }}>
          {animatedValue.toLocaleString()}
        </div>

        <div style={{
          color: '#64748b',
          fontSize: '14px',
          fontWeight: '500',
          fontFamily: '"SF Pro Text", -apple-system, sans-serif'
        }}>
          {title}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;