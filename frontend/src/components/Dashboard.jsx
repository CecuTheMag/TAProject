import { useState, useEffect } from 'react';
import { equipment, dashboard } from '../api';
import { useAuth } from '../AuthContext';
import Sidebar from './Sidebar';
import StatsCard from './StatsCard';
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';
import EquipmentCard from './EquipmentCard';
import EquipmentTab from './EquipmentTab';
import RequestsTab from './RequestsTab';
import AnalyticsTab from './AnalyticsTab';
import ReportsTab from './ReportsTab';
import AlertsTab from './AlertsTab';
import UsersTab from './UsersTab';
import QRScanner from './QRScanner';
import EquipmentDetailsModal from './EquipmentDetailsModal';
import RequestEquipmentModal from './RequestEquipmentModal';
import AddEquipmentModal from './AddEquipmentModal';

const Dashboard = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [equipmentResponse, statsResponse] = await Promise.all([
          equipment.getAll(),
          dashboard.getStats().catch(() => ({ data: null }))
        ]);
        setEquipmentList(equipmentResponse.data);
        setDashboardStats(statsResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Fallback to equipment list only
        try {
          const equipmentResponse = await equipment.getAll();
          setEquipmentList(equipmentResponse.data);
        } catch (equipmentError) {
          console.error('Failed to fetch equipment:', equipmentError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredEquipment = equipmentList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilters = activeFilters.length === 0 || activeFilters.includes(item.status);
    return matchesSearch && matchesFilters;
  });

  const stats = dashboardStats ? {
    total: parseInt(dashboardStats.equipment.total_equipment),
    available: parseInt(dashboardStats.equipment.available),
    checkedOut: parseInt(dashboardStats.equipment.checked_out),
    underRepair: parseInt(dashboardStats.equipment.under_repair)
  } : {
    total: 0,
    available: 0,
    checkedOut: 0,
    underRepair: 0
  };

  const filters = [
    { key: 'available', label: 'Available', color: '#10b981' },
    { key: 'checked_out', label: 'Checked Out', color: '#f59e0b' },
    { key: 'under_repair', label: 'Under Repair', color: '#ef4444' },
    { key: 'retired', label: 'Retired', color: '#6b7280' }
  ];

  const handleFilterChange = (filterKey) => {
    setActiveFilters(prev => 
      prev.includes(filterKey) 
        ? prev.filter(f => f !== filterKey)
        : [...prev, filterKey]
    );
  };

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
    // Refresh data after successful action
    const fetchData = async () => {
      try {
        const [equipmentResponse, statsResponse] = await Promise.all([
          equipment.getAll(),
          dashboard.getStats().catch(() => ({ data: null }))
        ]);
        setEquipmentList(equipmentResponse.data);
        setDashboardStats(statsResponse.data);
      } catch (error) {
        console.error('Failed to refresh data:', error);
      }
    };
    fetchData();
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '24px',
        fontFamily: '"SF Pro Display", -apple-system, sans-serif'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          border: '6px solid #e2e8f0',
          borderTop: '6px solid #0f172a',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#0f172a', fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0' }}>Loading SIMS</h2>
          <p style={{ color: '#64748b', fontSize: '16px', fontWeight: '500', margin: 0 }}>Preparing your dashboard...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: '"SF Pro Display", -apple-system, sans-serif',
      display: 'flex'
    }}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        user={user}
      />
      
      <div style={{
        flex: 1,
        marginLeft: '300px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)'
      }}>
        {activeTab === 'dashboard' ? (
          <>
            {/* Header */}
            <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          padding: '40px',
          borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
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
                Dashboard
              </h1>
              <p style={{
                color: '#64748b',
                fontSize: '16px',
                fontWeight: '500',
                margin: 0
              }}>
                Overview of your school inventory system
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
                {viewMode === 'grid' ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                      <path d="M3,5H21V7H3V5M3,13V11H21V13H3M3,19V17H21V19H3Z"/>
                    </svg>
                    List
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                      <path d="M3,11H11V3H3M3,21H11V13H3M13,21H21V13H13M13,3V11H21V3"/>
                    </svg>
                    Grid
                  </>
                )}
              </button>
              
              <button 
                onClick={() => setShowQRScanner(true)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  fontFamily: '"SF Pro Text", -apple-system, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,11H5V13H3V11M11,5H13V9H11V5M9,11H13V15H9V11M15,11H17V13H15V11M19,11H21V13H19V11M5,7H9V11H5V7M3,5H5V7H3V5M3,13H5V15H3V13M7,5H9V7H7V5M3,19H5V21H3V19M7,19H9V21H7V19M11,19H13V21H11V19M15,19H17V21H15V19M19,19H21V21H19V19M15,5H17V7H15V5M19,5H21V7H19V5M15,7H17V9H15V7M19,7H21V9H19V7M15,13H17V15H15V13M19,13H21V15H19V13M15,15H17V17H15V15M19,15H21V17H19V15M15,17H17V19H15V17M19,17H21V19H19V17Z"/>
                </svg>
                Scan QR
              </button>
              
              {['teacher', 'admin'].includes(user?.role) && (
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

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px'
          }}>
            <StatsCard 
              title="Total Equipment" 
              value={stats.total} 
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
                </svg>
              }
              color="#0f172a" 
              trend={5}
              delay={0}
            />
            <StatsCard 
              title="Available" 
              value={stats.available} 
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                </svg>
              }
              color="#10b981" 
              trend={12}
              delay={200}
            />
            <StatsCard 
              title="Checked Out" 
              value={stats.checkedOut} 
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5,17H19V19H5V17M12,5A4,4 0 0,1 16,9C16,10.88 14.88,12.53 13.25,13.31L15,22H9L10.75,13.31C9.13,12.53 8,10.88 8,9A4,4 0 0,1 12,5Z"/>
                </svg>
              }
              color="#f59e0b" 
              trend={-3}
              delay={400}
            />
            <StatsCard 
              title="Under Repair" 
              value={stats.underRepair} 
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
                </svg>
              }
              color="#ef4444" 
              trend={-8}
              delay={600}
            />
          </div>
        </div>

        {/* Controls */}
        <div style={{
          padding: '32px 40px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
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
        <div style={{ padding: '40px' }}>
          {filteredEquipment.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 24px',
              color: '#64748b'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                backgroundColor: '#f1f5f9',
                borderRadius: '50%',
                margin: '0 auto 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px'
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                </svg>
              </div>
              <h3 style={{ 
                margin: '0 0 16px 0', 
                fontSize: '28px', 
                color: '#0f172a', 
                fontWeight: '700',
                fontFamily: '"SF Pro Display", -apple-system, sans-serif'
              }}>
                No equipment found
              </h3>
              <p style={{ 
                margin: '0 0 24px 0', 
                fontSize: '16px',
                maxWidth: '400px',
                marginLeft: 'auto',
                marginRight: 'auto',
                lineHeight: '1.6'
              }}>
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: '"SF Pro Text", -apple-system, sans-serif'
                }}
              >
                Clear search
              </button>
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
            </div>
          </>
        ) : activeTab === 'equipment' ? (
          <EquipmentTab />
        ) : activeTab === 'requests' ? (
          <RequestsTab />
        ) : activeTab === 'analytics' ? (
          <AnalyticsTab />
        ) : activeTab === 'reports' ? (
          <ReportsTab />
        ) : activeTab === 'alerts' ? (
          <AlertsTab />
        ) : activeTab === 'users' ? (
          <UsersTab />
        ) : null}
        
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
        
        {showQRScanner && (
          <QRScanner
            onClose={() => setShowQRScanner(false)}
            onEquipmentFound={(equipment) => {
              setSelectedEquipment(equipment);
              setShowDetailsModal(true);
              setShowQRScanner(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;