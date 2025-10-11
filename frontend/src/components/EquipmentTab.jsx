import { useState, useEffect } from 'react';
import { equipment } from '../api';
import { useAuth } from '../AuthContext';
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';
import EquipmentCard from './EquipmentCard';
import EquipmentDetailsModal from './EquipmentDetailsModal';
import RequestEquipmentModal from './RequestEquipmentModal';
import AddEquipmentModal from './AddEquipmentModal';

const EquipmentTab = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await equipment.getAll();
        setEquipmentList(response.data);
      } catch (error) {
        console.error('Failed to fetch equipment:', error);
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

  const handleRequest = (item) => {
    setSelectedEquipment(item);
    setShowRequestModal(true);
  };

  const handleAddEquipment = () => {
    setShowAddModal(true);
  };

  const handleModalSuccess = () => {
    fetchEquipment();
  };

  const filteredEquipment = equipmentList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilters = activeFilters.length === 0 || activeFilters.includes(item.status);
    return matchesSearch && matchesFilters;
  });

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
    <div>
      {/* Header */}
      <div style={{
        background: 'white',
        padding: '32px',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#0f172a',
              margin: '0 0 8px 0',
              fontFamily: '"SF Pro Display", -apple-system, sans-serif'
            }}>
              Equipment Management
            </h1>
            <p style={{
              color: '#64748b',
              fontSize: '16px',
              fontWeight: '500',
              margin: 0
            }}>
              Manage and track all school equipment inventory
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              style={{
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
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  fontFamily: '"SF Pro Text", -apple-system, sans-serif'
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
        padding: '32px',
        background: 'white',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          gap: '24px',
          alignItems: window.innerWidth < 768 ? 'stretch' : 'center',
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
          />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '32px' }}>
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
            gridTemplateColumns: viewMode === 'grid' 
              ? 'repeat(auto-fill, minmax(380px, 1fr))' 
              : '1fr',
            gap: '24px'
          }}>
            {filteredEquipment.map((item) => (
              <EquipmentCard
                key={item.id}
                item={item}
                onViewDetails={handleViewDetails}
                onRequest={handleRequest}
                user={user}
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
      </div>
    </div>
  );
};

export default EquipmentTab;