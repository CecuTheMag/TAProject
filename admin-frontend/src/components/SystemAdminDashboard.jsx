import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import { systemAdmin } from '../api';
import Sidebar from './Sidebar';
import Footer from './Footer';
import DatabaseImportModal from './DatabaseImportModal';
import DemoUsersModal from './DemoUsersModal';

const SystemAdminDashboard = () => {
  const { user: authUser, logout } = useAuth();
  const user = authUser ? { ...authUser, role: 'system_admin' } : null;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [systemInfo, setSystemInfo] = useState({});
  const [schools, setSchools] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);

  const [newSchool, setNewSchool] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    domain: ''
  });

  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    school_id: ''
  });

  const [showImportModal, setShowImportModal] = useState(false);
  const [showDemoUsersModal, setShowDemoUsersModal] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        fetchData();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      const [statsRes, schoolsRes, adminsRes, systemInfoRes] = await Promise.all([
        systemAdmin.getStats(),
        systemAdmin.getSchools(),
        systemAdmin.getAdmins(),
        systemAdmin.getSystemInfo()
      ]);

      setStats(statsRes.data.stats || {});
      setSchools(schoolsRes.data.schools || []);
      setAdmins(adminsRes.data.admins || []);
      setSystemInfo(systemInfoRes.data.systemInfo || {});
    } catch (error) {
      console.error('Failed to fetch data:', error);
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const createSchool = async (e) => {
    e.preventDefault();
    try {
      await systemAdmin.createSchool(newSchool);
      setNewSchool({ name: '', code: '', address: '', phone: '', email: '', domain: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create school');
    }
  };

  const createAdmin = async (e) => {
    e.preventDefault();
    try {
      await systemAdmin.createAdmin(newAdmin);
      setNewAdmin({ username: '', email: '', school_id: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create admin');
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: '24px',
          fontFamily: '"SF Pro Display", -apple-system, sans-serif'
        }}
      >
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>Loading System Admin...</div>
      </motion.div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: '"SF Pro Display", -apple-system, sans-serif',
      display: 'flex',
      width: '100%',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        user={{ ...user, role: 'system_admin' }}
      />
      
      <div style={{
        flex: 1,
        marginLeft: isMobile ? '0' : 'var(--sidebar-width, 300px)',
        marginTop: isMobile ? '70px' : '0',
        minHeight: isMobile ? 'calc(100vh - 70px)' : '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        width: isMobile ? '100%' : 'calc(100% - var(--sidebar-width, 300px))',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {activeTab === 'dashboard' && (
          <div style={{ padding: isMobile ? '20px' : '40px', flex: 1 }}>
            <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: isMobile ? '20px' : '30px', color: '#1e40af', fontSize: isMobile ? '24px' : '32px', fontWeight: '800', fontFamily: '"SF Pro Display", sans-serif' }}>System Administration</motion.h1>
            
            {/* Stats Cards - Mobile: 2 cols, Desktop: 4 cols */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '12px' : '20px', marginBottom: isMobile ? '20px' : '30px' }}>
              {[{ title: 'Active Schools', value: stats.active_schools || 0, delay: 0 }, { title: 'School Admins', value: stats.school_admins || 0, delay: 0.1 }, { title: 'Total Users', value: stats.total_users || 0, delay: 0.2 }, { title: 'System Admins', value: stats.system_admins || 0, delay: 0.3 }].map((stat) => (
                <motion.div key={stat.title} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: stat.delay }} style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(30, 64, 175, 0.05) 100%)', backdropFilter: 'blur(20px)', padding: isMobile ? '16px' : '24px', borderRadius: isMobile ? '14px' : '20px', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.15)', textAlign: 'center', minHeight: isMobile ? '90px' : 'auto' }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: isMobile ? '10px' : '13px', fontWeight: '500', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.title}</h3>
                  <p style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '800', margin: 0, color: '#1e40af', fontFamily: '"SF Pro Display", sans-serif' }}>{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Server Info Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))', gap: isMobile ? '12px' : '20px', marginBottom: isMobile ? '20px' : '30px' }}>
              {[{ title: 'Memory (RAM)', value: `${systemInfo.memory?.used || 'N/A'} / ${systemInfo.memory?.total || 'N/A'}`, sub: `Usage: ${systemInfo.memory?.usagePercent || 'N/A'}`, color: '#0ea5e9' }, { title: 'CPU Cores', value: `${systemInfo.cpu?.cores || 'N/A'}`, sub: (systemInfo.cpu?.model || 'Unknown').substring(0, 25) + '...', color: '#22c55e' }, { title: 'Storage', value: `${systemInfo.disk?.used || 'N/A'} / ${systemInfo.disk?.total || 'N/A'}`, sub: `Usage: ${systemInfo.disk?.usagePercent || 'N/A'}`, color: '#eab308' }, { title: 'Database', value: systemInfo.database?.size || 'N/A', sub: 'PostgreSQL 15', color: '#ec4899' }, { title: 'Uptime', value: systemInfo.system?.uptime || 'N/A', sub: `${systemInfo.system?.platform || 'N/A'} ${systemInfo.system?.arch || 'N/A'}`, color: '#a855f7' }, { title: 'Hostname', value: systemInfo.system?.hostname || 'N/A', sub: 'Server ID', color: '#10b981' }].map((info, i) => (
                <motion.div key={info.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', padding: isMobile ? '16px' : '24px', borderRadius: isMobile ? '14px' : '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', border: `1px solid ${info.color}30` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: isMobile ? '36px' : '44px', height: isMobile ? '36px' : '44px', borderRadius: '10px', background: `${info.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: info.color }}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3Z"/></svg></div>
                    <h3 style={{ margin: 0, fontSize: isMobile ? '13px' : '15px', fontWeight: '600', color: info.color }}>{info.title}</h3>
                  </div>
                  <p style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '700', margin: '8px 0', color: '#0f172a', fontFamily: '"SF Pro Display", sans-serif', overflow: 'hidden', textOverflow: 'ellipsis' }}>{info.value}</p>
                  <p style={{ fontSize: isMobile ? '12px' : '14px', margin: 0, color: '#64748b' }}>{info.sub}</p>
                </motion.div>
              ))}
            </div>

            {/* Welcome Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', padding: isMobile ? '20px' : '30px', borderRadius: isMobile ? '16px' : '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', border: '1px solid rgba(226, 232, 240, 0.6)' }}>
              <h2 style={{ margin: '0 0 12px 0', fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#0f172a' }}>System Overview</h2>
              <p style={{ margin: 0, color: '#64748b', lineHeight: '1.6', fontSize: isMobile ? '14px' : '16px' }}>Welcome to the SchoolSync System Administration panel. Use the sidebar to manage schools, administrators, and monitor system-wide activity.</p>
            </motion.div>
          </div>
        )}

        {activeTab === 'schools' && (
          <div style={{ padding: isMobile ? '20px' : '40px', flex: 1 }}>
            <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: isMobile ? '20px' : '30px', color: '#1e40af', fontSize: isMobile ? '24px' : '32px', fontWeight: '800', fontFamily: '"SF Pro Display", sans-serif' }}>School Management</motion.h1>
            
            {selectedSchool ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <button onClick={() => setSelectedSchool(null)} style={{ padding: '12px 20px', background: '#64748b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', marginBottom: '20px', minHeight: '44px' }}>Back to Schools</button>
                <iframe src={`https://school-sync.org/admin-view?school_id=${selectedSchool.id}`} style={{ width: '100%', height: 'calc(100vh - 200px)', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white' }} title={`${selectedSchool.name} Admin Dashboard`} />
              </motion.div>
            ) : (
              <>
                {/* Create School Form */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', padding: isMobile ? '20px' : '30px', borderRadius: isMobile ? '16px' : '20px', marginBottom: isMobile ? '20px' : '30px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                  <h3 style={{ margin: '0 0 20px 0', fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#0f172a' }}>Create New School</h3>
                  <form onSubmit={createSchool} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
                    <input type="text" placeholder="School Name" value={newSchool.name} onChange={(e) => setNewSchool({...newSchool, name: e.target.value})} required style={{ padding: isMobile ? '14px' : '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', minHeight: '48px' }} />
                    <input type="text" placeholder="School Code (e.g. TECH01)" value={newSchool.code} onChange={(e) => setNewSchool({...newSchool, code: e.target.value.toUpperCase()})} required style={{ padding: isMobile ? '14px' : '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', minHeight: '48px' }} />
                    <input type="text" placeholder="Address" value={newSchool.address} onChange={(e) => setNewSchool({...newSchool, address: e.target.value})} style={{ padding: isMobile ? '14px' : '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', minHeight: '48px' }} />
                    <input type="tel" placeholder="Phone" value={newSchool.phone} onChange={(e) => setNewSchool({...newSchool, phone: e.target.value})} style={{ padding: isMobile ? '14px' : '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', minHeight: '48px' }} />
                    <input type="email" placeholder="Email" value={newSchool.email} onChange={(e) => setNewSchool({...newSchool, email: e.target.value})} style={{ padding: isMobile ? '14px' : '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', minHeight: '48px' }} />
                    <input type="text" placeholder="Domain" value={newSchool.domain} onChange={(e) => setNewSchool({...newSchool, domain: e.target.value})} style={{ padding: isMobile ? '14px' : '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', minHeight: '48px' }} />
                    <button type="submit" style={{ gridColumn: isMobile ? 'span 1' : 'span 2', padding: isMobile ? '14px' : '12px 24px', background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', minHeight: '48px' }}>Create School</button>
                  </form>
                </motion.div>

                {/* Schools List */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', borderRadius: isMobile ? '16px' : '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                  {isMobile ? (
                    <div style={{ padding: '16px' }}>
                      {schools.map((school, i) => (
                        <motion.div key={school.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '14px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)', border: '1px solid rgba(226, 232, 240, 0.6)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div><h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{school.name}</h4><span style={{ display: 'inline-block', padding: '4px 10px', background: '#f1f5f9', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: '#64748b' }}>{school.code}</span></div>
                            <span style={{ padding: '4px 10px', background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: '600', borderRadius: '20px' }}>Active</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#64748b' }}><strong style={{ color: '#1e40af' }}>{school.user_count || 0}</strong> users</span>
                            <button onClick={() => setSelectedSchool(school)} style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', minHeight: '44px', minWidth: '100px' }}>Manage</button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}><h3 style={{ margin: 0, color: '#0f172a', fontSize: '16px', fontWeight: '700' }}>Schools</h3></div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead><tr style={{ background: '#f8fafc' }}><th style={{ padding: '14px 20px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600', fontSize: '13px', color: '#64748b' }}>Name</th><th style={{ padding: '14px 20px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600', fontSize: '13px', color: '#64748b' }}>Code</th><th style={{ padding: '14px 20px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600', fontSize: '13px', color: '#64748b' }}>Users</th><th style={{ padding: '14px 20px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600', fontSize: '13px', color: '#64748b' }}>Status</th><th style={{ padding: '14px 20px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600', fontSize: '13px', color: '#64748b' }}>Actions</th></tr></thead>
                          <tbody>
                            {schools.map((school) => (
                              <tr key={school.id} style={{ transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                <td style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', fontWeight: '600', color: '#0f172a' }}>{school.name}</td>
                                <td style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}><span style={{ padding: '4px 10px', background: '#f1f5f9', borderRadius: '6px', fontSize: '13px', fontWeight: '600' }}>{school.code}</span></td>
                                <td style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>{school.user_count || 0}</td>
                                <td style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}><span style={{ padding: '4px 12px', borderRadius: '20px', background: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: '600' }}>active</span></td>
                                <td style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}><button onClick={() => setSelectedSchool(school)} style={{ padding: '8px 16px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', minHeight: '40px' }}>Manage</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </motion.div>
              </>
            )}
          </div>
        )}

        {activeTab === 'database' && (
          <div style={{ padding: isMobile ? '20px' : '40px', flex: 1 }}>
            <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: isMobile ? '20px' : '30px', color: '#1e40af', fontSize: isMobile ? '24px' : '32px', fontWeight: '800', fontFamily: '"SF Pro Display", sans-serif' }}>Database Management</motion.h1>
            <div style={{ display: 'grid', gap: isMobile ? '16px' : '20px' }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', padding: isMobile ? '20px' : '30px', borderRadius: isMobile ? '16px' : '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#0f172a' }}>Database Statistics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: isMobile ? '12px' : '15px' }}>
                  {[{ label: 'Total Users', value: stats.total_users || 0 }, { label: 'Active Schools', value: stats.active_schools || 0 }, { label: 'School Admins', value: stats.school_admins || 0 }].map((stat) => (
                    <div key={stat.label} style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px' }}><div style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>{stat.label}</div><div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>{stat.value}</div></div>
                  ))}
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', padding: isMobile ? '20px' : '30px', borderRadius: isMobile ? '16px' : '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#0f172a' }}>Database Operations</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button onClick={() => setShowImportModal(true)} style={{ padding: isMobile ? '14px 20px' : '12px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: isMobile ? '14px' : '14px', fontWeight: '600', cursor: 'pointer', minHeight: '48px' }}>Import .accdb File</button>
                  <button onClick={() => setShowDemoUsersModal(true)} style={{ padding: isMobile ? '14px 20px' : '12px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: isMobile ? '14px' : '14px', fontWeight: '600', cursor: 'pointer', minHeight: '48px' }}>DEMO Users</button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
        {activeTab === 'admins' && (
          <div style={{ padding: isMobile ? '20px' : '40px', flex: 1 }}>
            <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: isMobile ? '20px' : '30px', color: '#1e40af', fontSize: isMobile ? '24px' : '32px', fontWeight: '800', fontFamily: '"SF Pro Display", sans-serif' }}>Admin Management</motion.h1>
            
            {/* Create Admin Form */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', padding: isMobile ? '20px' : '30px', borderRadius: isMobile ? '16px' : '20px', marginBottom: isMobile ? '20px' : '30px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#0f172a' }}>Create School Admin</h3>
              <form onSubmit={createAdmin} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <input type="text" placeholder="Username" value={newAdmin.username} onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})} required style={{ padding: isMobile ? '14px' : '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', minHeight: '48px' }} />
                <input type="email" placeholder="Email" value={newAdmin.email} onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})} required style={{ padding: isMobile ? '14px' : '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', minHeight: '48px' }} />
                <select value={newAdmin.school_id} onChange={(e) => setNewAdmin({...newAdmin, school_id: e.target.value})} required style={{ padding: isMobile ? '14px' : '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', minHeight: '48px', background: 'white' }}>
                  <option value="">Select School</option>
                  {schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}
                </select>
                <button type="submit" style={{ padding: isMobile ? '14px' : '12px 24px', background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', minHeight: '48px' }}>Create Admin</button>
              </form>
            </motion.div>

            {/* Admins List */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', borderRadius: isMobile ? '16px' : '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
              {isMobile ? (
                <div style={{ padding: '16px' }}>
                  {admins.map((admin, i) => (
                    <motion.div key={admin.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '14px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)', border: '1px solid rgba(226, 232, 240, 0.6)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div><h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{admin.username}</h4><p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{admin.email}</p></div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '13px', color: '#64748b' }}><strong style={{ color: '#1e40af' }}>{admin.school_name}</strong></span><span style={{ padding: '4px 10px', background: '#f1f5f9', borderRadius: '6px', fontSize: '12px', color: '#64748b' }}>{new Date(admin.created_at).toLocaleDateString()}</span></div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <>
                  <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}><h3 style={{ margin: 0, color: '#0f172a', fontSize: '16px', fontWeight: '700' }}>School Administrators</h3></div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead><tr style={{ background: '#f8fafc' }}><th style={{ padding: '14px 20px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600', fontSize: '13px', color: '#64748b' }}>Username</th><th style={{ padding: '14px 20px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600', fontSize: '13px', color: '#64748b' }}>Email</th><th style={{ padding: '14px 20px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600', fontSize: '13px', color: '#64748b' }}>School</th><th style={{ padding: '14px 20px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600', fontSize: '13px', color: '#64748b' }}>Created</th></tr></thead>
                      <tbody>
                        {admins.map((admin) => (
                          <tr key={admin.id} style={{ transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', fontWeight: '600', color: '#0f172a' }}>{admin.username}</td>
                            <td style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>{admin.email}</td>
                            <td style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>{admin.school_name}</td>
                            <td style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>{new Date(admin.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}

        <Footer isMobile={isMobile} />
      </div>
      
      {showImportModal && (
        <DatabaseImportModal
          onClose={() => setShowImportModal(false)}
          onImport={(result) => {
            alert(`Successfully imported ${result.imported} records`);
            fetchData();
          }}
        />
      )}
      
      {showDemoUsersModal && (
        <DemoUsersModal
          onClose={() => setShowDemoUsersModal(false)}
          onSuccess={() => {
            fetchData();
          }}
          schools={schools}
        />
      )}
    </div>
  );
};

export default SystemAdminDashboard;
