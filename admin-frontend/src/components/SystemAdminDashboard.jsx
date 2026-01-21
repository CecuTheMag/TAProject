import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import { systemAdmin } from '../api';
import Sidebar from './Sidebar';
import Footer from './Footer';
import DatabaseImportModal from './DatabaseImportModal';

const SystemAdminDashboard = () => {
  const { user: authUser, logout } = useAuth();
  const user = authUser ? { ...authUser, role: 'system_admin' } : null;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
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
    password: '',
    school_id: ''
  });

  const [showImportModal, setShowImportModal] = useState(false);

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
      const [statsRes, schoolsRes, adminsRes] = await Promise.all([
        systemAdmin.getStats(),
        systemAdmin.getSchools(),
        systemAdmin.getAdmins()
      ]);

      setStats(statsRes.data.stats || {});
      setSchools(schoolsRes.data.schools || []);
      setAdmins(adminsRes.data.admins || []);
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
      setNewAdmin({ username: '', email: '', password: '', school_id: '' });
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
        display: isMobile ? 'flex' : 'block',
        flexDirection: isMobile ? 'column' : 'initial'
      }}>
        {activeTab === 'dashboard' && (
          <div style={{ padding: '40px' }}>
            <h1 style={{ marginBottom: '30px', color: '#1e40af', fontSize: '32px', fontWeight: '800' }}>System Administration</h1>
            
            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#64748b' }}>Active Schools</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e40af' }}>{stats.active_schools}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#64748b' }}>School Admins</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e40af' }}>{stats.school_admins}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#64748b' }}>Total Users</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e40af' }}>{stats.total_users}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#64748b' }}>Total Equipment</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e40af' }}>{stats.total_equipment}</p>
              </div>
            </div>

            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}>
              <h2 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>System Overview</h2>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>Welcome to the AssetFlow System Administration panel. Use the sidebar to manage schools, administrators, and monitor system-wide activity.</p>
            </div>
          </div>
        )}

        {activeTab === 'schools' && (
          <div style={{ padding: '40px' }}>
            <h1 style={{ marginBottom: '30px', color: '#1e40af', fontSize: '32px', fontWeight: '800' }}>School Management</h1>
            
            {selectedSchool ? (
              <div>
                <button 
                  onClick={() => setSelectedSchool(null)}
                  style={{ 
                    padding: '10px 20px', 
                    background: '#64748b', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    marginBottom: '20px',
                    fontWeight: '600'
                  }}
                >
                  ← Back to Schools
                </button>
                <iframe
                  src={`http://localhost:3000/admin-view?school_id=${selectedSchool.id}`}
                  style={{
                    width: '100%',
                    height: 'calc(100vh - 200px)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    background: 'white'
                  }}
                  title={`${selectedSchool.name} Admin Dashboard`}
                />
              </div>
            ) : (
              <>
                {/* Create School Form */}
                <div style={{ background: 'white', padding: '30px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}>
                  <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>Create New School</h3>
                  <form onSubmit={createSchool} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    <input
                      type="text"
                      placeholder="School Name"
                      value={newSchool.name}
                      onChange={(e) => setNewSchool({...newSchool, name: e.target.value})}
                      required
                      style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                    />
                    <input
                      type="text"
                      placeholder="School Code (e.g. TECH01)"
                      value={newSchool.code}
                      onChange={(e) => setNewSchool({...newSchool, code: e.target.value.toUpperCase()})}
                      required
                      style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                    />
                    <input
                      type="text"
                      placeholder="Address"
                      value={newSchool.address}
                      onChange={(e) => setNewSchool({...newSchool, address: e.target.value})}
                      style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={newSchool.phone}
                      onChange={(e) => setNewSchool({...newSchool, phone: e.target.value})}
                      style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newSchool.email}
                      onChange={(e) => setNewSchool({...newSchool, email: e.target.value})}
                      style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                    />
                    <input
                      type="text"
                      placeholder="Domain"
                      value={newSchool.domain}
                      onChange={(e) => setNewSchool({...newSchool, domain: e.target.value})}
                      style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                    />
                    <button type="submit" style={{ padding: '12px 24px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', gridColumn: 'span 2' }}>
                      Create School
                    </button>
                  </form>
                </div>

                {/* Schools List */}
                <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                  <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, color: '#0f172a' }}>Schools</h3>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: '12px 20px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>Name</th>
                        <th style={{ padding: '12px 20px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>Code</th>
                        <th style={{ padding: '12px 20px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>Users</th>
                        <th style={{ padding: '12px 20px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>Status</th>
                        <th style={{ padding: '12px 20px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schools.map(school => (
                        <tr key={school.id}>
                          <td style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>{school.name}</td>
                          <td style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>{school.code}</td>
                          <td style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>{school.user_count || 0}</td>
                          <td style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>
                            <span style={{ 
                              padding: '4px 12px', 
                              borderRadius: '20px', 
                              background: '#dcfce7',
                              color: '#166534',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              active
                            </span>
                          </td>
                          <td style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>
                            <button
                              onClick={() => setSelectedSchool(school)}
                              style={{
                                padding: '6px 16px',
                                background: '#1e40af',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600'
                              }}
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ padding: '40px' }}>
            <h1 style={{ marginBottom: '30px', color: '#1e40af', fontSize: '32px', fontWeight: '800' }}>System Settings</h1>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>General Settings</h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontWeight: '600' }}>System Name</label>
                    <input type="text" defaultValue="AssetFlow" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontWeight: '600' }}>Admin Email</label>
                    <input type="email" defaultValue="admin@assetflow.bg" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>Security Settings</h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    <span>Require 2FA for admins</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    <span>Enable audit logging</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" />
                    <span>Force password reset every 90 days</span>
                  </label>
                </div>
              </div>

              <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>Backup & Maintenance</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button style={{ padding: '12px 24px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Backup Database</button>
                  <button style={{ padding: '12px 24px', background: '#64748b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Clear Cache</button>
                  <button style={{ padding: '12px 24px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Maintenance Mode</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div style={{ padding: '40px' }}>
            <h1 style={{ marginBottom: '30px', color: '#1e40af', fontSize: '32px', fontWeight: '800' }}>Database Management</h1>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>Database Statistics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>Total Records</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>12,458</div>
                  </div>
                  <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>Database Size</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>245 MB</div>
                  </div>
                  <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>Last Backup</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>2h ago</div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>Tables Overview</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ padding: '12px 20px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>Table</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>Rows</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['users', 'schools', 'equipment', 'requests', 'subjects'].map((table, idx) => (
                      <tr key={table}>
                        <td style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>{table}</td>
                        <td style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>{Math.floor(Math.random() * 5000)}</td>
                        <td style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>{Math.floor(Math.random() * 50)} MB</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>Database Operations</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => setShowImportModal(true)}
                    style={{ padding: '12px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Import .accdb File
                  </button>
                  <button style={{ padding: '12px 24px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Export Database</button>
                  <button style={{ padding: '12px 24px', background: '#64748b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Optimize Tables</button>
                  <button style={{ padding: '12px 24px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Reset Database</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'admins' && (
          <div style={{ padding: '40px' }}>
            <h1 style={{ marginBottom: '30px', color: '#1e40af', fontSize: '32px', fontWeight: '800' }}>Admin Management</h1>
            
            {/* Create Admin Form */}
            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>Create School Admin</h3>
              <form onSubmit={createAdmin} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <input
                  type="text"
                  placeholder="Username"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                  required
                  style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  required
                  style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                  required
                  style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                />
                <select
                  value={newAdmin.school_id}
                  onChange={(e) => setNewAdmin({...newAdmin, school_id: e.target.value})}
                  required
                  style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                >
                  <option value="">Select School</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
                <button type="submit" style={{ padding: '12px 24px', background: '#1e40af', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                  Create Admin
                </button>
              </form>
            </div>

            {/* Admins List */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: 0, color: '#0f172a' }}>School Administrators</h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '12px 20px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>Username</th>
                    <th style={{ padding: '12px 20px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>Email</th>
                    <th style={{ padding: '12px 20px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>School</th>
                    <th style={{ padding: '12px 20px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(admin => (
                    <tr key={admin.id}>
                      <td style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>{admin.username}</td>
                      <td style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>{admin.email}</td>
                      <td style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>{admin.school_name}</td>
                      <td style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>
                        {new Date(admin.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
    </div>
  );
};

export default SystemAdminDashboard;