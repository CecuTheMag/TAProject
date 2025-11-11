import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { equipment, education } from '../api';
import { toast } from './Toast';

const RequestLessonEquipmentModal = ({ lessonPlan, onClose, onSuccess }) => {
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailableEquipment();
    setFormData(prev => ({
      ...prev,
      notes: `Equipment request for lesson: ${lessonPlan.title}`
    }));
  }, [lessonPlan]);

  const fetchAvailableEquipment = async () => {
    try {
      const response = await equipment.getAll({ status: 'available' });
      setAvailableEquipment(response.data);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedEquipment.length === 0) {
      toast.error('Please select at least one equipment item');
      return;
    }

    setLoading(true);
    try {
      await education.requestLessonEquipment(lessonPlan.id, {
        equipment_ids: selectedEquipment,
        ...formData
      });
      toast.success('Equipment requested successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to request equipment');
    } finally {
      setLoading(false);
    }
  };

  const toggleEquipment = (equipmentId) => {
    setSelectedEquipment(prev => 
      prev.includes(equipmentId)
        ? prev.filter(id => id !== equipmentId)
        : [...prev, equipmentId]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10b981';
      case 'checked_out': return '#f59e0b';
      case 'under_repair': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
              Request Equipment
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '16px' }}>
              For lesson: {lessonPlan.title}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Start Date *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                End Date *
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#374151' }}>
              Select Equipment ({selectedEquipment.length} selected)
            </label>
            <div style={{ 
              maxHeight: '300px', 
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px'
            }}>
              {availableEquipment.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                  No equipment available
                </p>
              ) : (
                availableEquipment.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleEquipment(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      margin: '4px 0',
                      backgroundColor: selectedEquipment.includes(item.id) ? '#dbeafe' : '#f9fafb',
                      border: selectedEquipment.includes(item.id) ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEquipment.includes(item.id)}
                      onChange={() => {}}
                      style={{ marginRight: '12px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>
                        {item.name}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '12px' }}>
                        {item.type} • {item.serial_number} • {item.location}
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      backgroundColor: getStatusColor(item.status),
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {item.status.replace('_', ' ')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedEquipment.length === 0}
              style={{
                padding: '12px 24px',
                backgroundColor: loading || selectedEquipment.length === 0 ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading || selectedEquipment.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Requesting...' : `Request ${selectedEquipment.length} Items`}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RequestLessonEquipmentModal;