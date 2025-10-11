import { useState } from 'react';

const ReportsTab = () => {
  const [selectedReport, setSelectedReport] = useState('inventory');
  const [dateRange, setDateRange] = useState('last30days');
  const [generating, setGenerating] = useState(false);

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
    
    // Simulate report generation
    setTimeout(() => {
      setGenerating(false);
      alert(`${format.toUpperCase()} report generated successfully!`);
    }, 2000);
  };

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
          Reports & Analytics
        </h1>
        <p style={{
          color: '#64748b',
          fontSize: '16px',
          fontWeight: '500',
          margin: 0
        }}>
          Generate comprehensive reports for your inventory system
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: '32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: '32px'
        }}>
          {/* Report Types */}
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#0f172a',
              margin: '0 0 24px 0'
            }}>
              Select Report Type
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {reportTypes.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  style={{
                    background: 'white',
                    border: selectedReport === report.id ? '2px solid #0f172a' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedReport === report.id ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px'
                  }}>
                    <div style={{
                      color: selectedReport === report.id ? '#0f172a' : '#64748b',
                      flexShrink: 0
                    }}>
                      {report.icon}
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#0f172a',
                        margin: '0 0 8px 0'
                      }}>
                        {report.title}
                      </h3>
                      <p style={{
                        color: '#64748b',
                        fontSize: '14px',
                        margin: 0,
                        lineHeight: '1.5'
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
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            height: 'fit-content'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#0f172a',
              margin: '0 0 24px 0'
            }}>
              Report Configuration
            </h3>

            {/* Date Range */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                {dateRanges.map((range) => (
                  <option key={range.id} value={range.id}>
                    {range.label}
                  </option>
                ))}
              </select>
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
                Export Format
              </label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => handleGenerateReport('pdf')}
                  disabled={generating}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: generating ? '#9ca3af' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                  {generating ? 'Generating...' : 'Export as PDF'}
                </button>
                
                <button
                  onClick={() => handleGenerateReport('csv')}
                  disabled={generating}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: generating ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                  {generating ? 'Generating...' : 'Export as CSV'}
                </button>
              </div>
            </div>

            {/* Report Preview */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 8px 0'
              }}>
                Report Preview
              </h4>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: 0,
                lineHeight: '1.4'
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