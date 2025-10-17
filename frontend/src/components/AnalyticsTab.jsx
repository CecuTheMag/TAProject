import { useState, useEffect } from 'react';
import { dashboard } from '../api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await dashboard.getStats();
        setAnalyticsData(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

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
        <p style={{ color: '#64748b', fontSize: '16px' }}>Loading analytics...</p>
      </div>
    );
  }

  const equipmentStats = analyticsData?.equipment || {};
  const requestStats = analyticsData?.requests || {};

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: isMobile ? '16px' : '32px',
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        margin: '0',
        borderRadius: '0',
        textAlign: isMobile ? 'center' : 'left',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <h1 style={{
          fontSize: isMobile ? '24px' : '32px',
          fontWeight: '800',
          color: '#0f172a',
          margin: '0 0 8px 0',
          fontFamily: '"SF Pro Display", -apple-system, sans-serif'
        }}>
          Analytics Dashboard
        </h1>
        <p style={{
          color: '#64748b',
          fontSize: isMobile ? '14px' : '16px',
          fontWeight: '500',
          margin: 0
        }}>
          Insights and trends for your inventory system
        </p>
      </div>

      {/* Content */}
      <div style={{ 
        padding: isMobile ? '12px' : '32px',
        margin: '0',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: isMobile ? '8px' : '24px',
          marginBottom: isMobile ? '16px' : '32px',
          width: '100%',
          maxWidth: '100%'
        }}>
          {/* Equipment Overview */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: isMobile ? '12px' : '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            width: '100%',
            maxWidth: isMobile ? 'calc(100vw - 24px)' : '100%',
            minWidth: 0,
            boxSizing: 'border-box'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#0f172a',
              margin: '0 0 16px 0'
            }}>
              Equipment Overview
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Total Equipment:</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>
                  {equipmentStats.total_equipment || 0}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Available:</span>
                <span style={{ fontWeight: '600', color: '#10b981' }}>
                  {equipmentStats.available || 0}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Checked Out:</span>
                <span style={{ fontWeight: '600', color: '#f59e0b' }}>
                  {equipmentStats.checked_out || 0}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Under Repair:</span>
                <span style={{ fontWeight: '600', color: '#ef4444' }}>
                  {equipmentStats.under_repair || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Request Statistics */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: isMobile ? '12px' : '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            width: '100%',
            maxWidth: isMobile ? 'calc(100vw - 24px)' : '100%',
            minWidth: 0,
            boxSizing: 'border-box'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#0f172a',
              margin: '0 0 16px 0'
            }}>
              Request Statistics
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Total Requests:</span>
                <span style={{ fontWeight: '600', color: '#0f172a' }}>
                  {requestStats.total_requests || 0}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Pending:</span>
                <span style={{ fontWeight: '600', color: '#f59e0b' }}>
                  {requestStats.pending_requests || 0}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Approved:</span>
                <span style={{ fontWeight: '600', color: '#10b981' }}>
                  {requestStats.approved_requests || 0}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Rejected:</span>
                <span style={{ fontWeight: '600', color: '#ef4444' }}>
                  {requestStats.rejected_requests || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Utilization Rate */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: isMobile ? '12px' : '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            width: '100%',
            maxWidth: isMobile ? 'calc(100vw - 24px)' : '100%',
            minWidth: 0,
            boxSizing: 'border-box'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#0f172a',
              margin: '0 0 16px 0'
            }}>
              Utilization Rate
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '120px'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: `conic-gradient(#10b981 0deg ${(equipmentStats.checked_out / equipmentStats.total_equipment * 360) || 0}deg, #e2e8f0 ${(equipmentStats.checked_out / equipmentStats.total_equipment * 360) || 0}deg 360deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#0f172a'
                }}>
                  {Math.round((equipmentStats.checked_out / equipmentStats.total_equipment * 100) || 0)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: isMobile ? '8px' : '24px',
          width: '100%',
          maxWidth: '100%'
        }}>
          {/* Equipment Status Chart */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: isMobile ? '12px' : '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            width: '100%',
            maxWidth: isMobile ? 'calc(100vw - 24px)' : '100%',
            minWidth: 0,
            boxSizing: 'border-box'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#0f172a',
              margin: '0 0 16px 0'
            }}>
              Equipment Status Distribution
            </h3>
            <div style={{ 
              height: isMobile ? '200px' : '300px', 
              display: 'flex', 
              justifyContent: 'center',
              width: '100%',
              maxWidth: '100%'
            }}>
              <Doughnut
                data={{
                  labels: ['Available', 'Checked Out', 'Under Repair', 'Retired'],
                  datasets: [{
                    data: [
                      equipmentStats.available || 0,
                      equipmentStats.checked_out || 0,
                      equipmentStats.under_repair || 0,
                      equipmentStats.retired || 0
                    ],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6b7280'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Request Status Chart */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: isMobile ? '12px' : '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            width: '100%',
            maxWidth: isMobile ? 'calc(100vw - 24px)' : '100%',
            minWidth: 0,
            boxSizing: 'border-box'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#0f172a',
              margin: '0 0 16px 0'
            }}>
              Request Status Overview
            </h3>
            <div style={{ 
              height: isMobile ? '200px' : '300px',
              width: '100%',
              maxWidth: '100%'
            }}>
              <Bar
                data={{
                  labels: ['Pending', 'Approved', 'Rejected', 'Returned'],
                  datasets: [{
                    label: 'Number of Requests',
                    data: [
                      requestStats.pending_requests || 0,
                      requestStats.approved_requests || 0,
                      requestStats.rejected_requests || 0,
                      requestStats.returned_requests || 0
                    ],
                    backgroundColor: ['#f59e0b', '#10b981', '#ef4444', '#6b7280'],
                    borderRadius: 8,
                    borderSkipped: false
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;