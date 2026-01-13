import React, { useState, useEffect } from 'react';
import { systemAdmin } from '../api';

const Overview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await systemAdmin.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>System Overview</h1>
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Total Schools</div>
          <div style={styles.cardValue}>{stats?.total_schools || 0}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Total Admins</div>
          <div style={styles.cardValue}>{stats?.total_admins || 0}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Active Schools</div>
          <div style={styles.cardValue}>{stats?.active_schools || 0}</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '30px'
  },
  title: {
    fontSize: '28px',
    marginBottom: '30px',
    color: '#333'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  },
  card: {
    background: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  cardTitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '10px'
  },
  cardValue: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#667eea'
  },
  loading: {
    padding: '30px',
    textAlign: 'center',
    fontSize: '18px',
    color: '#666'
  }
};

export default Overview;
