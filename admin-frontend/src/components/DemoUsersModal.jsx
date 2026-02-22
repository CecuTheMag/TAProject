import { useState } from 'react';
import { motion } from 'framer-motion';
import { systemAdmin } from '../api';

const DemoUsersModal = ({ onClose, onSuccess, schools }) => {
  const [selectedSchool, setSelectedSchool] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const demoUsers = [
    { username: 'student', email: 'student@school-sync.org', password: 'studentSSorg!', role: 'student' },
    { username: 'teacher', email: 'teacher@school-sync.org', password: 'teacherSSorg!', role: 'teacher' },
    { username: 'manager', email: 'manager@school-sync.org', password: 'managerSSorg!', role: 'manager' },
    { username: 'admin', email: 'admin@school-sync.org', password: 'adminSSorg!', role: 'admin' }
  ];

  const handleCreateDemoUsers = async () => {
    if (!selectedSchool) {
      setError('Please select a school');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const results = [];
      for (const user of demoUsers) {
        try {
          await systemAdmin.createDemoUser({
            ...user,
            school_id: selectedSchool
          });
          results.push(`${user.role}: ${user.email}`);
        } catch (err) {
          if (err.response?.data?.error?.includes('already exists')) {
            results.push(`${user.role}: ${user.email} (already exists)`);
          } else {
            results.push(`${user.role}: ${user.email} (failed - ${err.response?.data?.error || err.message})`);
          }
        }
      }
      
      setSuccess(`Demo users created successfully:\n${results.join('\n')}`);
      if (onSuccess) onSuccess();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create demo users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '30px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
      >
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
          Create DEMO Users
        </h2>
        
        <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
          This will create 4 demo users with the following credentials:
        </p>

        <div style={{ 
          background: '#f8fafc', 
          borderRadius: '8px', 
          padding: '16px', 
          marginBottom: '20px',
          fontFamily: 'monospace',
          fontSize: '13px'
        }}>
          {demoUsers.map((user, index) => (
            <div key={user.role} style={{ marginBottom: index < demoUsers.length - 1 ? '12px' : '0' }}>
              <div style={{ fontWeight: '600', color: '#1e40af', textTransform: 'uppercase' }}>{user.role}</div>
              <div style={{ color: '#374151' }}>Email: {user.email}</div>
              <div style={{ color: '#374151' }}>Password: {user.password}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
            Select School *
          </label>
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'white'
            }}
          >
            <option value="">Choose a school...</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name} ({school.code})
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div style={{ 
            background: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: '8px', 
            padding: '12px', 
            marginBottom: '20px',
            color: '#dc2626',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ 
            background: '#f0fdf4', 
            border: '1px solid #bbf7d0', 
            borderRadius: '8px', 
            padding: '12px', 
            marginBottom: '20px',
            color: '#166534',
            fontSize: '14px',
            whiteSpace: 'pre-line'
          }}>
            {success}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateDemoUsers}
            disabled={loading || !selectedSchool}
            style={{
              padding: '12px 24px',
              background: loading ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading || !selectedSchool ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating...' : 'Create Demo Users'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DemoUsersModal;
