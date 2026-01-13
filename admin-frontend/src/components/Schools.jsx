import React, { useState, useEffect } from 'react';
import { systemAdmin } from '../api';

const Schools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', email: '', domain: '' });

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      const response = await systemAdmin.getSchools();
      setSchools(response.data);
    } catch (error) {
      console.error('Failed to load schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await systemAdmin.createSchool(formData);
      setFormData({ name: '', code: '', email: '', domain: '' });
      setShowForm(false);
      loadSchools();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create school');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this school?')) return;
    try {
      await systemAdmin.deleteSchool(id);
      loadSchools();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete school');
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Schools Management</h1>
        <button onClick={() => setShowForm(!showForm)} style={styles.addButton}>
          {showForm ? 'Cancel' : '+ Add School'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            placeholder="School Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            style={styles.input}
            required
          />
          <input
            placeholder="School Code"
            value={formData.code}
            onChange={(e) => setFormData({...formData, code: e.target.value})}
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
            placeholder="Domain"
            value={formData.domain}
            onChange={(e) => setFormData({...formData, domain: e.target.value})}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.submitButton}>Create School</button>
        </form>
      )}

      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <div style={styles.th}>Name</div>
          <div style={styles.th}>Code</div>
          <div style={styles.th}>Email</div>
          <div style={styles.th}>Domain</div>
          <div style={styles.th}>Actions</div>
        </div>
        {schools.map(school => (
          <div key={school.id} style={styles.tableRow}>
            <div style={styles.td}>{school.name}</div>
            <div style={styles.td}>{school.code}</div>
            <div style={styles.td}>{school.email}</div>
            <div style={styles.td}>{school.domain}</div>
            <div style={styles.td}>
              <button onClick={() => handleDelete(school.id)} style={styles.deleteButton}>
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
  tableHeader: { display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 2fr 1fr', padding: '15px', background: '#f8f9fa', fontWeight: 'bold' },
  tableRow: { display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 2fr 1fr', padding: '15px', borderTop: '1px solid #eee' },
  th: { fontSize: '14px', color: '#666' },
  td: { fontSize: '14px', color: '#333' },
  deleteButton: { padding: '5px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  loading: { padding: '30px', textAlign: 'center', fontSize: '18px', color: '#666' }
};

export default Schools;
