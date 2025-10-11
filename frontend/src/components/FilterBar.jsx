const FilterChip = ({ label, isActive, onClick, color = '#0f172a' }) => {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: '20px',
        border: `2px solid ${isActive ? color : '#e2e8f0'}`,
        background: isActive ? color : 'white',
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

const FilterBar = ({ filters, activeFilters, onFilterChange }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      alignItems: 'center'
    }}>
      <span style={{
        color: '#64748b',
        fontSize: '14px',
        fontWeight: '600',
        fontFamily: '"SF Pro Text", -apple-system, sans-serif'
      }}>
        Filter:
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
      
      {activeFilters.length > 0 && (
        <button
          onClick={() => onFilterChange('clear')}
          style={{
            padding: '8px 12px',
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontFamily: '"SF Pro Text", -apple-system, sans-serif'
          }}
          onMouseEnter={(e) => e.target.style.color = '#0f172a'}
          onMouseLeave={(e) => e.target.style.color = '#64748b'}
        >
          Clear all
        </button>
      )}
    </div>
  );
};

export default FilterBar;