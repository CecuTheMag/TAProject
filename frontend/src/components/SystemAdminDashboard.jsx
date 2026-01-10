import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Dashboard from './Dashboard';

const SystemAdminDashboard = () => {
  const { user, logout } = useAuth();
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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? `${window.location.origin}/api`
        : `http://${window.location.hostname}:5000`;
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, schoolsRes, adminsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/system-admin/stats`, { headers }),
        fetch(`${API_BASE_URL}/system-admin/schools`, { headers }),
        fetch(`${API_BASE_URL}/system-admin/school-admins`, { headers })
      ]);

      setStats((await statsRes.json()).stats);
      setSchools((await schoolsRes.json()).schools);
      setAdmins((await adminsRes.json()).admins);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSchool = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? `${window.location.origin}/api`
        : `http://${window.location.hostname}:5000`;
      const response = await fetch(`${API_BASE_URL}/system-admin/schools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newSchool)
      });

      if (response.ok) {
        setNewSchool({ name: '', code: '', address: '', phone: '', email: '', domain: '' });
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create school');
      }
    } catch (error) {
      console.error('Failed to create school:', error);
      alert('Failed to create school');
    }
  };

  const createAdmin = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? `${window.location.origin}/api`
        : `http://${window.location.hostname}:5000`;
      const response = await fetch(`${API_BASE_URL}/system-admin/school-admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newAdmin)
      });

      if (response.ok) {
        setNewAdmin({ username: '', email: '', password: '', school_id: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create admin:', error);
    }
  };

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
  };

  const handleBackToSystemAdmin = () => {
    setSelectedSchool(null);
  };

  // If a school is selected, show the full school admin interface
  if (selectedSchool) {
    // Create a modified user context for this school
    const schoolUser = {
      ...user,
      role: 'admin', // Give them admin role for the school
      school_id: selectedSchool.id,
      is_system_admin: false // Hide system admin features
    };

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontFamily: '"SF Pro Display", -apple-system, sans-serif'
      }}>
        {/* School Header with Back Button */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          padding: '20px 40px',
          borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999
        }}>
          <div>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
              {selectedSchool.name}
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              School Code: {selectedSchool.code} • {selectedSchool.user_count} Users
            </p>
          </div>
          <button
            onClick={handleBackToSystemAdmin}
            style={{
              padding: '10px 20px',
              background: 'white',
              color: '#1e40af',
              border: '2px solid #1e40af',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#1e40af';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#1e40af';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
            </svg>
            Back to System Admin
          </button>
        </div>
        
        {/* Dashboard with modified user context */}
        <div style={{ paddingTop: '90px' }}>
          <Dashboard key={selectedSchool.id} schoolUser={schoolUser} />
        </div>
      </div>
    );
  }

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
        user={user}
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
                  </tr>
                </thead>
                <tbody>
                  {schools.map(school => (
                    <tr key={school.id} style={{ cursor: 'pointer' }} onClick={() => handleSchoolSelect(school)}>
                      <td style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>{school.name}</td>
                      <td style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>{school.code}</td>
                      <td style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>{school.user_count}</td>
                      <td style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: '20px', 
                          background: school.status === 'active' ? '#dcfce7' : '#fef3c7',
                          color: school.status === 'active' ? '#166534' : '#92400e',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {school.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
    </div>
  );
};

export default SystemAdminDashboard;