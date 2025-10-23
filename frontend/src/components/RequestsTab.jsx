import { useState, useEffect } from 'react';
import { requests } from '../api';
import { useAuth } from '../AuthContext';
import EarlyReturnModal from './EarlyReturnModal';

// Component for managing equipment requests - displays user's requests or all requests for admins
const RequestsTab = () => {
  // State management
  const [requestsList, setRequestsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // Filter by request status
  const [isMobile, setIsMobile] = useState(false);
  const [showEarlyReturn, setShowEarlyReturn] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = user?.role === 'admin' 
          ? await requests.getAllRequests()
          : await requests.getUserRequests();
        setRequestsList(response.data);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  // Filter requests based on selected status
  const filteredRequests = requestsList.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  // Admin function to approve equipment requests
  const handleApprove = async (requestId) => {
    try {
      await requests.approve(requestId);
      // Update local state to reflect approval
      setRequestsList(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'approved' } : req
      ));
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  // Admin function to reject equipment requests
  const handleReject = async (requestId) => {
    try {
      await requests.reject(requestId);
      // Update local state to reflect rejection
      setRequestsList(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'rejected' } : req
      ));
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  // Returns color code for request status badges
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';      // Orange
      case 'approved': return '#10b981';     // Green
      case 'rejected': return '#ef4444';     // Red
      case 'returned': return '#6b7280';     // Gray
      case 'early_returned': return '#3b82f6'; // Blue
      default: return '#6b7280';
    }
  };

  const handleEarlyReturn = (request) => {
    setSelectedRequest(request);
    setShowEarlyReturn(true);
  };

  const handleEarlyReturnClose = (success) => {
    setShowEarlyReturn(false);
    setSelectedRequest(null);
    if (success) {
      const fetchRequests = async () => {
        try {
          const response = user?.role === 'admin' 
            ? await requests.getAllRequests()
            : await requests.getUserRequests();
          setRequestsList(response.data);
        } catch (error) {
          console.error('Failed to fetch requests:', error);
        }
      };
      fetchRequests();
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
        <p style={{ color: '#64748b', fontSize: '16px' }}>Loading requests...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: isMobile ? '12px' : '40px',
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        margin: '0',
        borderRadius: '0'
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
              {user?.role === 'admin' ? 'All Requests' : 'My Requests'}
            </h1>
            <p style={{
              color: '#64748b',
              fontSize: isMobile ? '16px' : '16px',
              fontWeight: '500',
              margin: 0
            }}>
              {user?.role === 'admin' 
                ? 'Review and manage equipment requests'
                : 'Track your equipment requests'
              }
            </p>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: isMobile ? '4px' : '12px',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            alignItems: 'center',
            justifyContent: isMobile ? 'center' : 'flex-start',
            width: isMobile ? '100%' : 'auto'
          }}>
            {['all', 'pending', 'approved', 'rejected', 'returned', 'early_returned'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                style={{
                  padding: isMobile ? '6px 10px' : '8px 16px',
                  background: filter === status ? '#0f172a' : 'transparent',
                  color: filter === status ? 'white' : '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: isMobile ? '12px' : '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                  minWidth: 'fit-content'
                }}
              >
                {status === 'early_returned' ? 'Early Returned' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ 
        padding: isMobile ? '12px' : '40px',
        margin: '0'
      }}>
        {filteredRequests.length === 0 ? (
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
              No requests found
            </h3>
            <p style={{ 
              margin: '0 0 24px 0', 
              fontSize: '16px'
            }}>
              {filter === 'all' ? 'No requests available.' : `No ${filter} requests found.`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '12px' : '0',
                  marginBottom: '16px'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#0f172a',
                      margin: '0 0 8px 0'
                    }}>
                      {request.equipment_name}
                    </h3>
                    <p style={{
                      color: '#64748b',
                      fontSize: '14px',
                      margin: '0 0 8px 0'
                    }}>
                      Requested by: {request.username || request.user_name || 'Unknown User'}
                    </p>
                    <p style={{
                      color: '#64748b',
                      fontSize: '14px',
                      margin: '0 0 8px 0'
                    }}>
                      {request.start_date && request.end_date ? (
                        `${new Date(request.start_date).toLocaleDateString()} - ${new Date(request.end_date).toLocaleDateString()}`
                      ) : (
                        new Date(request.request_date || request.created_at).toLocaleDateString()
                      )}
                    </p>
                    {request.due_date && request.status === 'approved' && (
                      <p style={{
                        color: '#d97706',
                        fontSize: '14px',
                        margin: 0,
                        fontWeight: '600'
                      }}>
                        Due: {new Date(request.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: isMobile ? '8px' : '12px',
                    flexWrap: 'wrap',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: isMobile ? 'space-between' : 'flex-start'
                  }}>
                    <span style={{
                      padding: '4px 12px',
                      backgroundColor: getStatusColor(request.status),
                      color: 'white',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {request.status === 'early_returned' ? 'Early Returned' : request.status.replace('_', ' ')}
                    </span>
                    
                    {user?.role === 'admin' && request.status === 'pending' && (
                      <div style={{ 
                        display: 'flex', 
                        gap: isMobile ? '6px' : '8px',
                        flexWrap: 'wrap'
                      }}>
                        <button
                          onClick={() => handleApprove(request.id)}
                          style={{
                            padding: isMobile ? '6px 12px' : '8px 16px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: isMobile ? '11px' : '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          style={{
                            padding: isMobile ? '6px 12px' : '8px 16px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: isMobile ? '11px' : '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    
                    {user?.role === 'admin' && request.status === 'approved' && (
                      <button
                        onClick={() => handleEarlyReturn(request)}
                        style={{
                          padding: isMobile ? '6px 12px' : '8px 16px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: isMobile ? '11px' : '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Return Early
                      </button>
                    )}
                  </div>
                </div>
                
                {request.notes && (
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '12px',
                    borderRadius: '8px',
                    marginTop: '12px'
                  }}>
                    <p style={{
                      color: '#475569',
                      fontSize: '14px',
                      margin: 0,
                      fontStyle: 'italic'
                    }}>
                      "{request.notes}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <EarlyReturnModal
        isOpen={showEarlyReturn}
        onClose={handleEarlyReturnClose}
        equipment={selectedRequest ? { name: selectedRequest.equipment_name } : null}
        requestId={selectedRequest?.id}
      />
    </div>
  );
};

export default RequestsTab;