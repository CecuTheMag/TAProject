import { useState } from 'react';

const SearchBar = ({ searchTerm, setSearchTerm, placeholder = "Search equipment..." }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={{
      position: 'relative',
      width: '100%'
    }}>
      <div style={{
        position: 'absolute',
        left: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: isFocused ? '#0f172a' : '#64748b',
        transition: 'color 0.2s ease',
        zIndex: 1
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
        </svg>
      </div>
      
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          width: '100%',
          padding: '12px 16px 12px 44px',
          border: `2px solid ${isFocused ? '#0f172a' : '#e2e8f0'}`,
          borderRadius: '12px',
          fontSize: '16px',
          fontFamily: '"SF Pro Text", -apple-system, sans-serif',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          outline: 'none',
          boxSizing: 'border-box',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          color: '#0f172a',
          boxShadow: isFocused 
            ? '0 0 0 4px rgba(15, 23, 42, 0.1), 0 1px 3px 0 rgba(0, 0, 0, 0.1)' 
            : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}
      />
      
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(100, 116, 139, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(100, 116, 139, 0.2)';
            e.target.style.color = '#0f172a';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(100, 116, 139, 0.1)';
            e.target.style.color = '#64748b';
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchBar;