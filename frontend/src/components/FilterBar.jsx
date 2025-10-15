const FilterChip = ({ label, isActive, onClick, color = '#0f172a' }) => {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 12px',
        borderRadius: '20px',
        border: `2px solid ${isActive ? color : '#e2e8f0'}`,
        background: isActive ? color : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        color: isActive ? 'white' : '#64748b',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontFamily: '"SF Pro Text", -apple-system, sans-serif',
        whiteSpace: 'nowrap'
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.target.style.borderColor = color;
          e.target.style.color = color;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.target.style.borderColor = '#e2e8f0';
          e.target.style.color = '#64748b';
        }
      }}
    >
      {label}
    </button>
  );
};

const FilterBar = ({ filters, activeFilters, onFilterChange, isMobile }) => {
  return (
    <div style={{
      display: 'flex',
      gap: isMobile ? '8px' : '12px',
      flexWrap: isMobile ? 'wrap' : 'nowrap',
      alignItems: 'center',
      justifyContent: isMobile ? 'center' : 'flex-start'
    }}>
      <span style={{
        color: '#64748b',
        fontSize: '14px',
        fontWeight: '600',
        fontFamily: '"SF Pro Text", -apple-system, sans-serif',
        whiteSpace: 'nowrap'
      }}>
        {isMobile ? 'Filters:' : 'Filter:'}
      </span>
      
      {filters.map((filter) => (
        <FilterChip
          key={filter.key}
          label={filter.label}
          isActive={activeFilters.includes(filter.key)}
          onClick={() => onFilterChange(filter.key)}
          color={filter.color}
        />
      ))}
    </div>
  );
};

export default FilterBar;