import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { equipment, education } from '../api';
import { toast } from './Toast';
import ConfirmDialog from './ConfirmDialog';
import SubjectModal from './SubjectModal';

const ManagementTab = () => {
  const [activeSection, setActiveSection] = useState('equipment');
  const [equipmentFleets, setEquipmentFleets] = useState([]);
  const [lessonPlans, setLessonPlans] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteType, setDeleteType] = useState('');
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

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
      const [fleetsResponse, lessonsResponse, subjectsResponse] = await Promise.all([
        equipment.getGroups().catch(() => ({ data: [] })),
        education.getLessonPlans().catch(() => ({ data: [] })),
        education.getSubjects().catch(() => ({ data: [] }))
      ]);

      setEquipmentFleets(fleetsResponse.data || []);
      setLessonPlans(lessonsResponse.data || []);
      setSubjects(subjectsResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch management data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFleet = async (baseSerial) => {
    try {
      const fleet = equipmentFleets.find(f => f.base_serial === baseSerial);
      if (!fleet) return;

      for (const item of fleet.items) {
        await equipment.delete(item.id);
      }
      
      toast.success(`Fleet ${baseSerial} deleted successfully`);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete fleet');
    }
  };

  const handleDeleteItem = async (id, type) => {
    try {
      if (type === 'equipment') {
        await equipment.delete(id);
        toast.success('Equipment deleted successfully');
      } else if (type === 'lesson') {
        await education.deleteLessonPlan(id);
        toast.success('Lesson plan deleted successfully');
      } else if (type === 'subject') {
        await education.deleteSubject(id);
        toast.success('Subject deleted successfully');
      }
      fetchData();
    } catch (error) {
      const errorMsg = error.response?.data?.error || `Failed to delete ${type}`;
      toast.error(errorMsg);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10b981';
      case 'checked_out': return '#f59e0b';
      case 'under_repair': return '#ef4444';
      case 'retired': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'fair': return '#f59e0b';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const EquipmentSection = () => (
    <div style={{ padding: isMobile ? '12px' : '32px' }}>
      <h2 style={{ 
        margin: '0 0 24px 0', 
        color: '#0f172a', 
        fontSize: isMobile ? '20px' : '24px', 
        fontWeight: '700' 
      }}>
        Equipment Fleet Management
      </h2>

      {equipmentFleets.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 24px',
          color: '#64748b',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px'
        }}>
          <h3>No equipment fleets found</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {equipmentFleets.map((fleet) => (
            <motion.div
              key={fleet.base_serial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '16px',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '12px' : '0'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>
                    {fleet.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ 
                      background: '#dbeafe', 
                      color: '#1d4ed8', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '12px' 
                    }}>
                      {fleet.type}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>
                      {fleet.total_count} items • {fleet.available_count} available
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedItems([fleet.base_serial]);
                    setDeleteType('fleet');
                    setShowDeleteDialog(true);
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Delete Fleet
                </button>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '8px' 
              }}>
                {fleet.items.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>
                        {item.serial_number}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <span style={{
                          padding: '2px 6px',
                          backgroundColor: getStatusColor(item.status),
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '10px'
                        }}>
                          {item.status}
                        </span>
                        <span style={{
                          padding: '2px 6px',
                          backgroundColor: getConditionColor(item.condition),
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '10px'
                        }}>
                          {item.condition}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedItems([item.id]);
                        setDeleteType('equipment');
                        setShowDeleteDialog(true);
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const LessonPlansSection = () => (
    <div style={{ padding: isMobile ? '12px' : '32px' }}>
      <h2 style={{ 
        margin: '0 0 24px 0', 
        color: '#0f172a', 
        fontSize: isMobile ? '20px' : '24px', 
        fontWeight: '700' 
      }}>
        Lesson Plan Management
      </h2>

      {lessonPlans.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 24px',
          color: '#64748b',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px'
        }}>
          <h3>No lesson plans found</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {lessonPlans.map((lesson) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'start',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '12px' : '0'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>
                    {lesson.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ 
                      background: '#dbeafe', 
                      color: '#1d4ed8', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '12px' 
                    }}>
                      {lesson.subject_name}
                    </span>
                    {lesson.grade_level && (
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>
                        Grade {lesson.grade_level}
                      </span>
                    )}
                    {lesson.duration_minutes && (
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>
                        {lesson.duration_minutes} min
                      </span>
                    )}
                  </div>
                  {lesson.description && (
                    <p style={{ 
                      margin: '8px 0 0 0', 
                      color: '#4b5563', 
                      fontSize: '14px',
                      lineHeight: '1.4'
                    }}>
                      {lesson.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedItems([lesson.id]);
                    setDeleteType('lesson');
                    setShowDeleteDialog(true);
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const CurriculumSection = () => (
    <div style={{ padding: isMobile ? '12px' : '32px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '0'
      }}>
        <h2 style={{ 
          margin: 0, 
          color: '#0f172a', 
          fontSize: isMobile ? '20px' : '24px', 
          fontWeight: '700' 
        }}>
          Curriculum Management
        </h2>
        <button
          onClick={() => {
            setEditingSubject(null);
            setShowSubjectModal(true);
          }}
          style={{
            padding: '12px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            width: isMobile ? '100%' : 'auto'
          }}
        >
          + Add Subject
        </button>
      </div>

      {subjects.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 24px',
          color: '#64748b',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px'
        }}>
          <h3>No subjects found</h3>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '16px' 
        }}>
          {subjects.map((subject) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'start',
                marginBottom: '12px'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>
                    {subject.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ 
                      background: '#e0f2fe', 
                      color: '#0369a1', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '12px' 
                    }}>
                      {subject.code}
                    </span>
                    {subject.grade_level && (
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>
                        Grades {subject.grade_level}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setEditingSubject(subject);
                      setShowSubjectModal(true);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedItems([subject.id]);
                      setDeleteType('subject');
                      setShowDeleteDialog(true);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              {subject.description && (
                <p style={{ 
                  margin: 0, 
                  color: '#4b5563', 
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  {subject.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const handleConfirmDelete = async () => {
    try {
      if (deleteType === 'fleet') {
        await handleDeleteFleet(selectedItems[0]);
      } else {
        await handleDeleteItem(selectedItems[0], deleteType);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
    setShowDeleteDialog(false);
    setSelectedItems([]);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #0f172a',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#64748b', fontSize: '16px' }}>Loading management data...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: isMobile ? '16px' : '32px',
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        textAlign: isMobile ? 'center' : 'left'
      }}>
        <h1 style={{
          fontSize: isMobile ? '24px' : '32px',
          fontWeight: '800',
          color: '#0f172a',
          margin: '0 0 8px 0'
        }}>
          System Management
        </h1>
        <p style={{
          color: '#64748b',
          fontSize: isMobile ? '14px' : '16px',
          fontWeight: '500',
          margin: 0
        }}>
          Manage equipment fleets, lesson plans, and curriculum
        </p>
      </div>

      {/* Navigation */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
        padding: isMobile ? '12px 16px' : '16px 32px'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: isMobile ? '8px' : '24px',
          overflowX: isMobile ? 'auto' : 'visible',
          paddingBottom: isMobile ? '4px' : '0'
        }}>
          {[
            { id: 'equipment', label: isMobile ? 'Equipment' : 'Equipment Fleets' },
            { id: 'lessons', label: isMobile ? 'Lessons' : 'Lesson Plans' },
            { id: 'curriculum', label: 'Curriculum' }
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                padding: isMobile ? '6px 12px' : '8px 16px',
                background: activeSection === section.id ? '#dbeafe' : 'transparent',
                color: activeSection === section.id ? '#1d4ed8' : '#6b7280',
                border: 'none',
                borderRadius: '8px',
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeSection === 'equipment' && <EquipmentSection />}
      {activeSection === 'lessons' && <LessonPlansSection />}
      {activeSection === 'curriculum' && <CurriculumSection />}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          title={`Delete ${deleteType === 'fleet' ? 'Fleet' : deleteType}`}
          message={`Are you sure you want to delete this ${deleteType}? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteDialog(false);
            setSelectedItems([]);
          }}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}

      {/* Subject Modal */}
      {showSubjectModal && (
        <SubjectModal
          subject={editingSubject}
          onClose={() => {
            setShowSubjectModal(false);
            setEditingSubject(null);
          }}
          onSuccess={() => {
            fetchData();
            setShowSubjectModal(false);
            setEditingSubject(null);
          }}
        />
      )}
    </div>
  );
};

export default ManagementTab;