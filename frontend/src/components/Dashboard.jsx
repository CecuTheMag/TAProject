import { useState, useEffect } from 'react';
import { equipment } from '../api';
import { useAuth } from '../AuthContext';

const Dashboard = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
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

  const filteredEquipment = equipmentList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10b981';
      case 'checked_out': return '#f59e0b';
      case 'under_repair': return '#ef4444';
      case 'retired': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'fair': return '#f59e0b';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
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
        gap: '20px',
        fontFamily: '"SF Pro Display", -apple-system, sans-serif'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #0f172a',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#64748b', fontSize: '18px', fontWeight: '500' }}>Loading equipment...</p>
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
      fontFamily: '"SF Pro Display", -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: window.innerWidth < 768 ? '32px 16px' : '48px 32px',
        color: 'white',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: window.innerWidth < 768 ? '32px' : '48px',
            fontWeight: '800',
            margin: '0 0 8px 0',
            letterSpacing: '0.1em',
            fontFamily: '"SF Pro Display", -apple-system, sans-serif'
          }}>
            SIMS
          </h1>
          <p style={{
            fontSize: window.innerWidth < 768 ? '14px' : '18px',
            opacity: '0.9',
            margin: '0 0 16px 0',
            fontWeight: '500'
          }}>
            Welcome back, {user?.username}! Manage your school inventory below.
          </p>
          <div style={{
            fontSize: '14px',
            opacity: '0.7',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {user?.role === 'admin' ? 'Administrator Dashboard' : 'User Dashboard'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        padding: window.innerWidth < 768 ? '24px 16px' : '40px 32px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          gap: '16px',
          marginBottom: '32px',
          alignItems: window.innerWidth < 768 ? 'stretch' : 'center'
        }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                fontFamily: '"SF Pro Text", -apple-system, sans-serif',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0f172a';
                e.target.style.boxShadow = '0 0 0 4px rgba(15, 23, 42, 0.1), 0 1px 3px 0 rgba(0, 0, 0, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
              }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '16px 20px',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '16px',
              outline: 'none',
              cursor: 'pointer',
              minWidth: window.innerWidth < 768 ? 'auto' : '180px',
              fontFamily: '"SF Pro Text", -apple-system, sans-serif',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="checked_out">Checked Out</option>
            <option value="under_repair">Under Repair</option>
            <option value="retired">Retired</option>
          </select>
        </div>

        {/* Equipment Grid */}
        {filteredEquipment.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 24px',
            color: '#64748b'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#f1f5f9',
              borderRadius: '50%',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '24px', color: '#374151', fontWeight: '600' }}>No equipment found</h3>
            <p style={{ margin: 0, fontSize: '16px' }}>Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: window.innerWidth < 768 ? '20px' : '28px'
          }}>
            {filteredEquipment.map((item) => (
              <div key={item.id} style={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: window.innerWidth < 768 ? '20px' : '28px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '20px'
                }}>
                  <h3 style={{
                    fontSize: window.innerWidth < 768 ? '18px' : '22px',
                    fontWeight: '700',
                    color: '#0f172a',
                    margin: 0,
                    lineHeight: '1.3',
                    fontFamily: '"SF Pro Display", -apple-system, sans-serif'
                  }}>
                    {item.name}
                  </h3>
                  <span style={{
                    backgroundColor: getStatusColor(item.status) + '20',
                    color: getStatusColor(item.status),
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', minWidth: '80px' }}>Type:</span>
                    <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: '600' }}>{item.type}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', minWidth: '80px' }}>Condition:</span>
                    <span style={{
                      color: getConditionColor(item.condition),
                      fontSize: '14px',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {item.condition}
                    </span>
                  </div>

                  {item.serial_number && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', minWidth: '80px' }}>Serial:</span>
                      <span style={{ color: '#0f172a', fontSize: '14px', fontFamily: 'monospace', backgroundColor: '#f8fafc', padding: '2px 6px', borderRadius: '4px' }}>{item.serial_number}</span>
                    </div>
                  )}

                  {item.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', minWidth: '80px' }}>Location:</span>
                      <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: '500' }}>{item.location}</span>
                    </div>
                  )}
                </div>

                <div style={{
                  marginTop: '24px',
                  paddingTop: '20px',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <button style={{
                    flex: 1,
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
                  onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'}
                  onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'}>
                    View Details
                  </button>
                  {item.status === 'available' && (
                    <button style={{
                      flex: 1,
                      padding: '12px 16px',
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
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}>
                      Request
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;