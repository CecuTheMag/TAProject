import React, { useState, useEffect } from 'react';
import { systemAdmin } from '../api';

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', school_id: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [adminsRes, schoolsRes] = await Promise.all([
        systemAdmin.getAdmins(),
        systemAdmin.getSchools()
      ]);
      setAdmins(adminsRes.data);
      setSchools(schoolsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await systemAdmin.createAdmin(formData);
      setFormData({ email: '', password: '', name: '', school_id: '' });
      setShowForm(false);
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create admin');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this admin?')) return;
    try {
      await systemAdmin.deleteAdmin(id);
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete admin');
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>School Admins Management</h1>
        <button onClick={() => setShowForm(!showForm)} style={styles.addButton}>
          {showForm ? 'Cancel' : '+ Add Admin'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            style={styles.input}
            required
          />
          <input
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            style={styles.input}
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            style={styles.input}
            required
          />
          <select
            value={formData.school_id}
            onChange={(e) => setFormData({...formData, school_id: e.target.value})}
            style={styles.input}
            required
          >
            <option value="">Select School</option>
            {schools.map(school => (
              <option key={school.id} value={school.id}>{school.name}</option>
            ))}
          </select>
          <button type="submit" style={styles.submitButton}>Create Admin</button>
        </form>
      )}

      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <div style={styles.th}>Name</div>
          <div style={styles.th}>Email</div>
          <div style={styles.th}>School</div>
          <div style={styles.th}>Actions</div>
        </div>
        {admins.map(admin => (
          <div key={admin.id} style={styles.tableRow}>
            <div style={styles.td}>{admin.name}</div>
            <div style={styles.td}>{admin.email}</div>
            <div style={styles.td}>{admin.school_name}</div>
            <div style={styles.td}>
              <button onClick={() => handleDelete(admin.id)} style={styles.deleteButton}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '30px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  title: { fontSize: '28px', color: '#333' },
  addButton: { padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  form: { background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' },
  input: { flex: '1 1 200px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' },
  submitButton: { padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  table: { background: 'white', borderRadius: '10px', overflow: 'hidden' },
  tableHeader: { display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1fr', padding: '15px', background: '#f8f9fa', fontWeight: 'bold' },
  tableRow: { display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1fr', padding: '15px', borderTop: '1px solid #eee' },
  th: { fontSize: '14px', color: '#666' },
  td: { fontSize: '14px', color: '#333' },
  deleteButton: { padding: '5px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  loading: { padding: '30px', textAlign: 'center', fontSize: '18px', color: '#666' }
};

export default Admins;
