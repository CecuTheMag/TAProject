import { useState } from 'react';
import { reports } from '../api';

const ReportsTab = () => {
  const [selectedReport, setSelectedReport] = useState('inventory');
  const [dateRange, setDateRange] = useState('last30days');
  const [generating, setGenerating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useState(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const reportTypes = [
    {
      id: 'inventory',
      title: 'Inventory Report',
      description: 'Complete overview of all equipment and their current status',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
        </svg>
      )
    },
    {
      id: 'usage',
      title: 'Usage Report',
      description: 'Equipment usage patterns and frequency analysis',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z"/>
        </svg>
      )
    },
    {
      id: 'requests',
      title: 'Request History',
      description: 'Historical data of all equipment requests and approvals',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
      )
    },
    {
      id: 'maintenance',
      title: 'Maintenance Report',
      description: 'Equipment maintenance schedules and repair history',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
        </svg>
      )
    }
  ];

  const dateRanges = [
    { id: 'last7days', label: 'Last 7 days' },
    { id: 'last30days', label: 'Last 30 days' },
    { id: 'last90days', label: 'Last 90 days' },
    { id: 'lastyear', label: 'Last year' },
    { id: 'custom', label: 'Custom range' }
  ];

  const handleGenerateReport = async (format) => {
    setGenerating(true);
    
    try {
      const response = await reports.export(selectedReport, format);
      
      // Create download link with proper content type
      const contentType = format === 'pdf' ? 'application/pdf' : 'text/csv';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedReport}_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        background: isMobile ? 'white' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: isMobile ? 'none' : 'blur(20px)',
        padding: isMobile ? '20px' : '40px',
        borderBottom: isMobile ? '1px solid #e2e8f0' : '1px solid rgba(226, 232, 240, 0.5)',
        boxShadow: isMobile ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : '0 8px 32px rgba(0, 0, 0, 0.08)',
        margin: isMobile ? '0 12px' : '0',
        borderRadius: isMobile ? '12px 12px 0 0' : '0'
      }}>
        <h1 style={{
          fontSize: isMobile ? '24px' : '32px',
          fontWeight: '800',
          color: '#0f172a',
          margin: '0 0 8px 0',
          fontFamily: '"SF Pro Display", -apple-system, sans-serif',
          textAlign: isMobile ? 'center' : 'left'
        }}>
          Reports & Analytics
        </h1>
        <p style={{
          color: '#64748b',
          fontSize: isMobile ? '14px' : '16px',
          fontWeight: '500',
          margin: 0,
          textAlign: isMobile ? 'center' : 'left'
        }}>
          Generate comprehensive reports for your inventory system
        </p>
      </div>

      {/* Content */}
      <div style={{ 
        padding: isMobile ? '16px 12px' : '40px',
        overflowX: isMobile ? 'hidden' : 'visible'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '24px' : '40px',
          maxWidth: isMobile ? 'none' : '1400px',
          margin: isMobile ? '0' : '0 auto',
          alignItems: isMobile ? 'center' : 'flex-start'
        }}>
          {/* Report Types */}
          <div style={{ flex: isMobile ? 'none' : 1 }}>
            <h2 style={{
              fontSize: isMobile ? '18px' : '24px',
              fontWeight: isMobile ? '600' : '700',
              color: '#0f172a',
              margin: isMobile ? '0 0 16px 0' : '0 0 24px 0',
              textAlign: isMobile ? 'center' : 'left',
              fontFamily: '"SF Pro Display", -apple-system, sans-serif'
            }}>
              Select Report Type
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: isMobile ? '16px' : '20px',
              width: isMobile ? '100%' : 'auto'
            }}>
              {reportTypes.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  style={{
                    background: isMobile ? 'white' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: isMobile ? 'none' : 'blur(20px)',
                    border: selectedReport === report.id 
                      ? (isMobile ? '2px solid #0f172a' : '2px solid #0f172a') 
                      : (isMobile ? '1px solid #e2e8f0' : '1px solid rgba(226, 232, 240, 0.3)'),
                    borderRadius: isMobile ? '12px' : '16px',
                    padding: isMobile ? '16px' : '24px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: selectedReport === report.id 
                      ? (isMobile ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 12px 40px rgba(15, 23, 42, 0.15)') 
                      : (isMobile ? '0 1px 3px rgba(0, 0, 0, 0.1)' : '0 8px 32px rgba(0, 0, 0, 0.08)'),
                    width: isMobile ? '100%' : 'auto',
                    boxSizing: 'border-box',
                    transform: !isMobile && selectedReport === report.id ? 'translateY(-4px)' : 'translateY(0)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: isMobile ? '16px' : '20px'
                  }}>
                    <div style={{
                      color: selectedReport === report.id ? '#0f172a' : '#64748b',
                      flexShrink: 0,
                      padding: isMobile ? '0' : '8px',
                      borderRadius: isMobile ? '0' : '12px',
                      background: !isMobile && selectedReport === report.id ? 'rgba(15, 23, 42, 0.1)' : 'transparent',
                      transition: 'all 0.3s ease'
                    }}>
                      {report.icon}
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: isMobile ? '15px' : '18px',
                        fontWeight: isMobile ? '600' : '700',
                        color: '#0f172a',
                        margin: isMobile ? '0 0 6px 0' : '0 0 8px 0',
                        fontFamily: '"SF Pro Display", -apple-system, sans-serif'
                      }}>
                        {report.title}
                      </h3>
                      <p style={{
                        color: '#64748b',
                        fontSize: isMobile ? '13px' : '15px',
                        margin: 0,
                        lineHeight: isMobile ? '1.4' : '1.5',
                        fontWeight: isMobile ? 'normal' : '500'
                      }}>
                        {report.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report Configuration */}
          <div style={{
            background: isMobile ? 'white' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            border: isMobile ? '1px solid #e2e8f0' : '1px solid rgba(226, 232, 240, 0.3)',
            borderRadius: isMobile ? '12px' : '20px',
            padding: isMobile ? '20px' : '32px',
            boxShadow: isMobile ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : '0 12px 40px rgba(0, 0, 0, 0.1)',
            height: 'fit-content',
            width: isMobile ? 'calc(100% - 24px)' : '420px',
            maxWidth: isMobile ? 'calc(100vw - 48px)' : 'none',
            flexShrink: 0,
            boxSizing: 'border-box',
            position: isMobile ? 'static' : 'sticky',
            top: isMobile ? 'auto' : '40px',
            margin: isMobile ? '0 auto' : '0'
          }}>
            <h3 style={{
              fontSize: isMobile ? '16px' : '22px',
              fontWeight: isMobile ? '600' : '700',
              color: '#0f172a',
              margin: isMobile ? '0 0 20px 0' : '0 0 28px 0',
              textAlign: isMobile ? 'center' : 'left',
              fontFamily: '"SF Pro Display", -apple-system, sans-serif'
            }}>
              Report Configuration
            </h3>

            {/* Date Range */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,3H18V1H16V3H8V1H6V3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19Z"/>
                </svg>
                Date Range Filter
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{
                  width: '100%',
                  padding: isMobile ? '14px 16px' : '16px 20px',
                  border: isMobile ? '2px solid #e5e7eb' : '2px solid #e2e8f0',
                  borderRadius: isMobile ? '10px' : '12px',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '500',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: '"SF Pro Text", -apple-system, sans-serif'
                }}
              >
                {dateRanges.map((range) => (
                  <option key={range.id} value={range.id}>
                    {range.label}
                  </option>
                ))}
              </select>
              
              {/* Date Range Info */}
              <div style={{
                marginTop: '8px',
                padding: '8px 12px',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#0369a1',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
                </svg>
                Reports will include data from the selected time period
              </div>
            </div>

            {/* Export Options */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '12px'
              }}>
                Export Report
              </label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => handleGenerateReport('csv')}
                  disabled={generating}
                  style={{
                    width: '100%',
                    padding: isMobile ? '16px 24px' : '18px 28px',
                    backgroundColor: generating ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: isMobile ? '12px' : '14px',
                    fontSize: isMobile ? '16px' : '17px',
                    fontWeight: '600',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    transition: 'all 0.3s ease',
                    fontFamily: '"SF Pro Text", -apple-system, sans-serif',
                    boxShadow: !generating && !isMobile ? '0 4px 16px rgba(16, 185, 129, 0.3)' : 'none'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                  {generating ? 'Generating Report...' : 'Export as CSV'}
                </button>
                
                <button
                  onClick={() => handleGenerateReport('pdf')}
                  disabled={generating}
                  style={{
                    width: '100%',
                    padding: isMobile ? '16px 24px' : '18px 28px',
                    backgroundColor: generating ? '#9ca3af' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: isMobile ? '12px' : '14px',
                    fontSize: isMobile ? '16px' : '17px',
                    fontWeight: '600',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    transition: 'all 0.3s ease',
                    fontFamily: '"SF Pro Text", -apple-system, sans-serif',
                    boxShadow: !generating && !isMobile ? '0 4px 16px rgba(239, 68, 68, 0.3)' : 'none'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                  {generating ? 'Generating Report...' : 'Export as PDF'}
                </button>
              </div>
            </div>

            {/* Report Preview */}
            <div style={{
              backgroundColor: isMobile ? '#f8fafc' : 'rgba(248, 250, 252, 0.8)',
              border: isMobile ? '1px solid #e2e8f0' : '1px solid rgba(226, 232, 240, 0.5)',
              borderRadius: isMobile ? '8px' : '12px',
              padding: isMobile ? '16px' : '20px'
            }}>
              <h4 style={{
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: '600',
                color: '#374151',
                margin: isMobile ? '0 0 8px 0' : '0 0 12px 0',
                fontFamily: '"SF Pro Text", -apple-system, sans-serif'
              }}>
                Report Preview
              </h4>
              <p style={{
                fontSize: isMobile ? '12px' : '14px',
                color: '#6b7280',
                margin: 0,
                lineHeight: isMobile ? '1.4' : '1.5',
                fontWeight: '500'
              }}>
                {reportTypes.find(r => r.id === selectedReport)?.description}
                <br />
                Date range: {dateRanges.find(r => r.id === dateRange)?.label}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;