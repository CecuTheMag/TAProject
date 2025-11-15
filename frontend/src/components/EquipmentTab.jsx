import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { equipment } from '../api';
import { useAuth } from '../AuthContext';
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';
import EquipmentCard from './EquipmentCard';
import EquipmentDetailsModal from './EquipmentDetailsModal';
import RequestEquipmentModal from './RequestEquipmentModal';
import AddEquipmentModal from './AddEquipmentModal';
import EarlyReturnModal from './EarlyReturnModal';
import Pagination from './Pagination';
import { useTranslation } from '../translations';

const EquipmentTab = () => {
  const { t } = useTranslation();
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
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

  const totalPages = Math.ceil(filteredEquipment.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEquipment = filteredEquipment.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilters]);

  const filters = [
    { key: 'available', label: t('available'), color: '#10b981' },
    { key: 'checked_out', label: t('checkedOut'), color: '#f59e0b' },
    { key: 'under_repair', label: t('underRepair'), color: '#ef4444' },
    { key: 'retired', label: t('retired'), color: '#6b7280' }
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
        <p style={{ color: '#64748b', fontSize: '16px' }}>{t('loadingEquipment')}</p>
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
              {t('equipmentManagement')}
            </h1>
            <p style={{
              color: '#64748b',
              fontSize: isMobile ? '16px' : '16px',
              fontWeight: '500',
              margin: 0
            }}>
              {t('manageTrackEquipment')}
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
              {viewMode === 'grid' ? t('listView') : t('gridView')}
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
                + {t('addEquipment')}
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
            placeholder={t('searchEquipmentByName')}
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
        padding: isMobile ? '12px' : '40px 60px',
        margin: '0',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'visible'
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
              {t('noEquipmentFound')}
            </h3>
            <p style={{ 
              margin: '0 0 24px 0', 
              fontSize: '16px'
            }}>
              {t('tryAdjustingSearch')}
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
            overflow: 'visible'
          }}>
            <AnimatePresence>
              {paginatedEquipment.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                >
                  <EquipmentCard
                    item={item}
                    onViewDetails={handleViewDetails}
                    onRequest={handleRequest}
                    user={user}
                    isMobile={isMobile}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {/* Pagination */}
        {!isMobile && filteredEquipment.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredEquipment.length}
          />
        )}
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