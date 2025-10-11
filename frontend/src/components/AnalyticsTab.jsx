import { useState, useEffect } from 'react';
import { dashboard } from '../api';

const AnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div>
      {/* Header */}
      <div style={{
        background: 'white',
        padding: '32px',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#0f172a',
          margin: '0 0 8px 0',
          fontFamily: '"SF Pro Display", -apple-system, sans-serif'
        }}>
          Analytics Dashboard
        </h1>
        <p style={{
          color: '#64748b',
          fontSize: '16px',
          fontWeight: '500',
          margin: 0
        }}>
          Insights and trends for your inventory system
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: '32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Equipment Overview */}
          <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
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
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
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
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
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

        {/* Chart Placeholder */}
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#0f172a',
            margin: '0 0 16px 0'
          }}>
            Usage Trends
          </h3>
          <div style={{
            height: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '2px dashed #cbd5e1'
          }}>
            <div style={{ textAlign: 'center' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="#94a3b8">
                <path d="M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z"/>
              </svg>
              <p style={{ color: '#64748b', margin: '16px 0 0 0' }}>
                Chart visualization coming soon
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;