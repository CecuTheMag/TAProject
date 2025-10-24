import { useState, useEffect } from 'react';
import { equipment } from '../api';
import { useAuth } from '../AuthContext';
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';
import EquipmentCard from './EquipmentCard';
import EquipmentDetailsModal from './EquipmentDetailsModal';
import RequestEquipmentModal from './RequestEquipmentModal';
import AddEquipmentModal from './AddEquipmentModal';
import EarlyReturnModal from './EarlyReturnModal';

const EquipmentTab = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEarlyReturn, setShowEarlyReturn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await equipment.getAll();
        const data = response.data || response || [];
        setEquipmentList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch equipment:', error);
        setEquipmentList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  const handleViewDetails = (item) => {
    setSelectedEquipment(item);
    setShowDetailsModal(true);
  };

  const handleRequest = (item, isEarlyReturn = false) => {
    setSelectedEquipment(item);
    if (isEarlyReturn) {
      setShowEarlyReturn(true);
    } else {
      setShowRequestModal(true);
    }
  };

  const handleEarlyReturnClose = (success) => {
    setShowEarlyReturn(false);
    setSelectedEquipment(null);
    if (success) {
      fetchEquipment();
    }
  };

  const handleAddEquipment = () => {
    setShowAddModal(true);
  };

  const fetchEquipment = async () => {
    try {
      setError(null);
      const response = await equipment.getAll();
      const data = response.data || response || [];
      const equipmentArray = Array.isArray(data) ? data : [];
      setEquipmentList(equipmentArray);
      console.log('Equipment loaded:', equipmentArray.length, 'items');
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
      setError('Failed to load equipment. Please try again.');
      setEquipmentList([]);
    }
  };

  const handleModalSuccess = () => {
    fetchEquipment();
  };

  const filteredEquipment = Array.isArray(equipmentList) ? equipmentList.filter(item => {
    if (!item || typeof item !== 'object') return false;
    const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.type || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilters = activeFilters.length === 0 || activeFilters.includes(item.status);
    return matchesSearch && matchesFilters;
  }) : [];

  const filters = [
    { key: 'available', label: 'Available', color: '#10b981' },
    { key: 'checked_out', label: 'Checked Out', color: '#f59e0b' },
    { key: 'under_repair', label: 'Under Repair', color: '#ef4444' },
    { key: 'retired', label: 'Retired', color: '#6b7280' }
  ];

  const handleFilterChange = (filterKey) => {
    if (filterKey === 'clear') {
      setActiveFilters([]);
    } else {
      setActiveFilters(prev => 
        prev.includes(filterKey) 
          ? prev.filter(f => f !== filterKey)
          : [...prev, filterKey]
      );
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #0f172a',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#64748b', fontSize: '16px' }}>Loading equipment...</p>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: isMobile ? '12px' : '40px',
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        margin: '0',
        borderRadius: '0',
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : '0',
          marginBottom: '24px'
        }}>
          <div style={{ width: isMobile ? '100%' : 'auto', textAlign: isMobile ? 'center' : 'left' }}>
            <h1 style={{
              fontSize: isMobile ? '28px' : '32px',
              fontWeight: '800',
              color: '#0f172a',
              margin: '0 0 8px 0',
              fontFamily: '"SF Pro Display", -apple-system, sans-serif'
            }}>
              Equipment Management
            </h1>
            <p style={{
              color: '#64748b',
              fontSize: isMobile ? '16px' : '16px',
              fontWeight: '500',
              margin: 0
            }}>
              Manage and track all school equipment inventory
            </p>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: isMobile ? '8px' : '12px', 
            alignItems: 'center',
            flexWrap: 'wrap',
            width: isMobile ? '100%' : 'auto',
            justifyContent: isMobile ? 'center' : 'flex-start'
          }}>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              style={{
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: isMobile ? '16px' : '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: '"SF Pro Text", -apple-system, sans-serif',
                minWidth: isMobile ? '120px' : 'auto'
              }}
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </button>
            
            {user?.role === 'admin' && (
              <button 
                onClick={handleAddEquipment}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: isMobile ? '16px' : '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  fontFamily: '"SF Pro Text", -apple-system, sans-serif',
                  minWidth: isMobile ? '100px' : 'auto'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
              >
                + Add Equipment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        padding: isMobile ? '12px' : '32px 40px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        margin: '0',
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '12px' : '24px',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between'
        }}>
          <SearchBar 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
            placeholder="Search equipment by name or type..."
          />
          
          <FilterBar 
            filters={filters}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            isMobile={isMobile}
          />
        </div>
      </div>

      {/* Content */}
      <div style={{ 
        padding: isMobile ? '12px' : '40px',
        margin: '0',
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}>
        {filteredEquipment.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 24px',
            color: '#64748b'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '28px', 
              color: '#0f172a', 
              fontWeight: '700'
            }}>
              No equipment found
            </h3>
            <p style={{ 
              margin: '0 0 24px 0', 
              fontSize: '16px'
            }}>
              Try adjusting your search terms or filters.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile 
              ? '1fr' 
              : viewMode === 'grid' 
                ? 'repeat(auto-fill, minmax(320px, 1fr))'
                : '1fr',
            gap: isMobile ? '12px' : '24px',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            overflowX: 'hidden'
          }}>
            {filteredEquipment.map((item) => (
              <EquipmentCard
                key={item.id}
                item={item}
                onViewDetails={handleViewDetails}
                onRequest={handleRequest}
                user={user}
                isMobile={isMobile}
              />
            ))}
          </div>
        )}
        
        {/* Modals */}
        {showDetailsModal && (
          <EquipmentDetailsModal
            equipment={selectedEquipment}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedEquipment(null);
            }}
          />
        )}
        
        {showRequestModal && (
          <RequestEquipmentModal
            equipment={selectedEquipment}
            onClose={() => {
              setShowRequestModal(false);
              setSelectedEquipment(null);
            }}
            onSuccess={handleModalSuccess}
          />
        )}
        
        {showAddModal && (
          <AddEquipmentModal
            onClose={() => setShowAddModal(false)}
            onSuccess={handleModalSuccess}
          />
        )}
        
        {showEarlyReturn && (
          <EarlyReturnModal
            isOpen={showEarlyReturn}
            onClose={handleEarlyReturnClose}
            equipment={selectedEquipment}
            requestId={selectedEquipment?.request_id}
          />
        )}
      </div>
    </div>
  );
};

export default EquipmentTab;