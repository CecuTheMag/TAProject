import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { education } from '../api';

const EducationTab = () => {
  const [activeSection, setActiveSection] = useState('lesson-plans');
  const [lessonPlans, setLessonPlans] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showModal, setShowModal] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchEducationData();
  }, []);

  const fetchEducationData = async () => {
    try {
      const [lessonResponse, subjectsResponse, analyticsResponse] = await Promise.all([
        education.getLessonPlans().catch(() => ({ data: [] })),
        education.getSubjects().catch(() => ({ data: [] })),
        education.getLearningAnalytics().catch(() => ({ data: null }))
      ]);

      setLessonPlans(lessonResponse.data || []);
      setSubjects(subjectsResponse.data || []);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      console.error('Error fetching education data:', error);
    } finally {
      setLoading(false);
    }
  };

  const LessonPlansSection = () => (
    <div style={{ 
      padding: isMobile ? '12px' : '32px',
      margin: '0',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        marginBottom: isMobile ? '16px' : '24px',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '0'
      }}>
        <h2 style={{ 
          margin: 0, 
          color: '#0f172a', 
          fontSize: isMobile ? '20px' : '24px', 
          fontWeight: '700',
          fontFamily: '"SF Pro Display", -apple-system, sans-serif'
        }}>
          📚 Smart Lesson Planning
        </h2>
        <button
          style={{
            padding: isMobile ? '10px 16px' : '12px 24px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: '600',
            cursor: 'pointer',
            width: isMobile ? '100%' : 'auto',
            outline: 'none'
          }}
        >
          + Create Lesson Plan
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gap: isMobile ? '12px' : '16px',
        width: '100%',
        maxWidth: '100%'
      }}>
        {lessonPlans.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: isMobile ? '40px 20px' : '60px 24px',
            color: '#64748b',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{
              fontSize: isMobile ? '32px' : '48px',
              marginBottom: '16px'
            }}>📚</div>
            <h3 style={{ 
              margin: '0 0 8px 0', 
              fontSize: isMobile ? '18px' : '20px', 
              color: '#0f172a', 
              fontWeight: '600'
            }}>
              No lesson plans yet
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: isMobile ? '14px' : '16px',
              color: '#64748b'
            }}>
              Create your first lesson plan to get started with smart equipment integration.
            </p>
          </div>
        ) : (
          lessonPlans.map((lesson) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: isMobile ? '16px' : '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                width: '100%',
                maxWidth: isMobile ? 'calc(100vw - 24px)' : '100%',
                minWidth: 0,
                boxSizing: 'border-box'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'start', 
                marginBottom: '12px',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '12px' : '0'
              }}>
                <div style={{ width: isMobile ? '100%' : 'auto' }}>
                  <h3 style={{ 
                    margin: '0 0 8px 0', 
                    color: '#0f172a', 
                    fontSize: isMobile ? '16px' : '18px', 
                    fontWeight: '600',
                    fontFamily: '"SF Pro Display", -apple-system, sans-serif'
                  }}>
                    {lesson.title}
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ 
                      background: '#dbeafe', 
                      color: '#1d4ed8', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '12px', 
                      fontWeight: '500' 
                    }}>
                      {lesson.subject_name}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '12px' }}>
                      Grade {lesson.grade_level} • {lesson.duration_minutes} min
                    </span>
                  </div>
                </div>
                {!isMobile && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{
                      padding: '6px 12px',
                      background: '#f3f4f6',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      outline: 'none'
                    }}>
                      📋 Equipment
                    </button>
                    <button style={{
                      padding: '6px 12px',
                      background: '#f3f4f6',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      outline: 'none'
                    }}>
                      📊 Analytics
                    </button>
                  </div>
                )}
              </div>
              
              <p style={{ 
                margin: '0 0 16px 0', 
                color: '#4b5563', 
                lineHeight: '1.5',
                fontSize: isMobile ? '14px' : '16px'
              }}>
                {lesson.description}
              </p>

              {lesson.required_equipment && lesson.required_equipment.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <h4 style={{ 
                    margin: '0 0 8px 0', 
                    color: '#374151', 
                    fontSize: '14px', 
                    fontWeight: '600' 
                  }}>
                    Required Equipment:
                  </h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {lesson.required_equipment.map((equipment, index) => (
                      <span key={index} style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {equipment}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {lesson.learning_objectives && lesson.learning_objectives.length > 0 && (
                <div>
                  <h4 style={{ 
                    margin: '0 0 8px 0', 
                    color: '#374151', 
                    fontSize: '14px', 
                    fontWeight: '600' 
                  }}>
                    Learning Objectives:
                  </h4>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: '20px', 
                    color: '#6b7280', 
                    fontSize: isMobile ? '13px' : '14px' 
                  }}>
                    {lesson.learning_objectives.map((objective, index) => (
                      <li key={index} style={{ marginBottom: '4px' }}>{objective}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {isMobile && (
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  marginTop: '16px',
                  width: '100%'
                }}>
                  <button style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    outline: 'none'
                  }}>
                    📋 Equipment
                  </button>
                  <button style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    outline: 'none'
                  }}>
                    📊 Analytics
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  const AnalyticsSection = () => (
    <div style={{ 
      padding: isMobile ? '12px' : '32px',
      margin: '0',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
      <h2 style={{ 
        margin: '0 0 24px 0', 
        color: '#0f172a', 
        fontSize: isMobile ? '20px' : '24px', 
        fontWeight: '700',
        fontFamily: '"SF Pro Display", -apple-system, sans-serif'
      }}>
        📈 Learning Impact Analytics
      </h2>

      {analytics ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: isMobile ? '12px' : '24px',
          width: '100%',
          maxWidth: '100%'
        }}>
          {/* Equipment Analytics */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: isMobile ? '16px' : '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            width: '100%',
            maxWidth: isMobile ? 'calc(100vw - 24px)' : '100%',
            minWidth: 0,
            boxSizing: 'border-box'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              color: '#0f172a', 
              fontSize: '18px', 
              fontWeight: '600',
              fontFamily: '"SF Pro Display", -apple-system, sans-serif'
            }}>
              🔧 Equipment Learning Impact
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {analytics.equipment_analytics?.slice(0, 5).map((item) => (
                <div key={item.name} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ 
                      fontWeight: '600', 
                      color: '#0f172a', 
                      fontSize: isMobile ? '13px' : '14px' 
                    }}>
                      {item.name}
                    </div>
                    <div style={{ 
                      color: '#6b7280', 
                      fontSize: '12px' 
                    }}>
                      {item.usage_count} uses
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      color: item.learning_impact_score >= 4 ? '#059669' : '#d97706',
                      fontWeight: '600',
                      fontSize: '16px'
                    }}>
                      {item.learning_impact_score?.toFixed(1) || 'N/A'}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>
                      Impact Score
                    </div>
                  </div>
                </div>
              )) || []}
            </div>
            {isMobile && (
              <button
                onClick={() => setShowModal('equipment')}
                style={{
                  marginTop: '12px',
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  width: '100%',
                  outline: 'none'
                }}
              >
                View All Equipment Analytics
              </button>
            )}
          </div>

          {/* Subject Analytics */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: isMobile ? '16px' : '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            width: '100%',
            maxWidth: isMobile ? 'calc(100vw - 24px)' : '100%',
            minWidth: 0,
            boxSizing: 'border-box'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              color: '#0f172a', 
              fontSize: '18px', 
              fontWeight: '600',
              fontFamily: '"SF Pro Display", -apple-system, sans-serif'
            }}>
              📚 Subject Performance
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {analytics.subject_analytics?.map((subject) => (
                <div key={subject.code} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ 
                      fontWeight: '600', 
                      color: '#0f172a', 
                      fontSize: isMobile ? '13px' : '14px' 
                    }}>
                      {subject.subject_name}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>
                      {subject.total_usage} sessions
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      color: subject.avg_outcome >= 4 ? '#059669' : '#d97706',
                      fontWeight: '600',
                      fontSize: '16px'
                    }}>
                      {subject.avg_outcome?.toFixed(1) || 'N/A'}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>
                      Avg Outcome
                    </div>
                  </div>
                </div>
              )) || []}
            </div>
            {isMobile && (
              <button
                onClick={() => setShowModal('subjects')}
                style={{
                  marginTop: '12px',
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  width: '100%',
                  outline: 'none'
                }}
              >
                View All Subject Analytics
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: isMobile ? '40px 20px' : '60px 24px',
          color: '#64748b',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{
            fontSize: isMobile ? '32px' : '48px',
            marginBottom: '16px'
          }}>📊</div>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: isMobile ? '18px' : '20px', 
            color: '#0f172a', 
            fontWeight: '600'
          }}>
            No analytics data yet
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: isMobile ? '14px' : '16px',
            color: '#64748b'
          }}>
            Start using equipment in lessons to see learning impact analytics.
          </p>
        </div>
      )}
    </div>
  );

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
        <p style={{ color: '#64748b', fontSize: '16px' }}>Loading educational data...</p>
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
        margin: '0',
        borderRadius: '0',
        textAlign: isMobile ? 'center' : 'left',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <h1 style={{
          fontSize: isMobile ? '24px' : '32px',
          fontWeight: '800',
          color: '#0f172a',
          margin: '0 0 8px 0',
          fontFamily: '"SF Pro Display", -apple-system, sans-serif'
        }}>
          🎓 Educational Platform
        </h1>
        <p style={{
          color: '#64748b',
          fontSize: isMobile ? '14px' : '16px',
          fontWeight: '500',
          margin: 0
        }}>
          Smart curriculum integration and learning analytics
        </p>
      </div>

      {/* Navigation */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
        padding: isMobile ? '12px 16px' : '16px 32px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: isMobile ? '8px' : '24px',
          overflowX: isMobile ? 'auto' : 'visible',
          paddingBottom: isMobile ? '4px' : '0'
        }}>
          {[
            { id: 'lesson-plans', label: isMobile ? '📚 Plans' : '📚 Lesson Plans' },
            { id: 'analytics', label: isMobile ? '📊 Analytics' : '📊 Learning Analytics' },
            { id: 'curriculum', label: isMobile ? '🎓 Curriculum' : '🎓 Curriculum Integration' }
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
                whiteSpace: 'nowrap',
                outline: 'none',
                minWidth: isMobile ? 'auto' : 'fit-content'
              }}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeSection === 'lesson-plans' && <LessonPlansSection />}
      {activeSection === 'analytics' && <AnalyticsSection />}
      {activeSection === 'curriculum' && (
        <div style={{ 
          padding: isMobile ? '40px 20px' : '60px 32px', 
          textAlign: 'center', 
          color: '#64748b'
        }}>
          <div style={{
            fontSize: isMobile ? '32px' : '48px',
            marginBottom: '16px'
          }}>🚧</div>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: isMobile ? '18px' : '20px', 
            color: '#0f172a', 
            fontWeight: '600'
          }}>
            Coming Soon
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: isMobile ? '14px' : '16px'
          }}>
            Curriculum Integration features are under development.
          </p>
        </div>
      )}

      {/* Mobile Modal */}
      {showModal && (
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
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px' 
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '20px', 
                fontWeight: '700', 
                color: '#0f172a' 
              }}>
                {showModal === 'equipment' && '🔧 Equipment Analytics'}
                {showModal === 'subjects' && '📚 Subject Analytics'}
              </h3>
              <button
                onClick={() => setShowModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '4px',
                  outline: 'none'
                }}
              >
                ×
              </button>
            </div>
            
            {showModal === 'equipment' && analytics?.equipment_analytics && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {analytics.equipment_analytics.map((item) => (
                  <div key={item.name} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>
                        {item.name}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '12px' }}>
                        {item.usage_count} uses
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        color: item.learning_impact_score >= 4 ? '#059669' : '#d97706',
                        fontWeight: '600',
                        fontSize: '16px'
                      }}>
                        {item.learning_impact_score?.toFixed(1) || 'N/A'}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '12px' }}>
                        Impact Score
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {showModal === 'subjects' && analytics?.subject_analytics && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {analytics.subject_analytics.map((subject) => (
                  <div key={subject.code} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>
                        {subject.subject_name}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '12px' }}>
                        {subject.total_usage} sessions
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        color: subject.avg_outcome >= 4 ? '#059669' : '#d97706',
                        fontWeight: '600',
                        fontSize: '16px'
                      }}>
                        {subject.avg_outcome?.toFixed(1) || 'N/A'}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '12px' }}>
                        Avg Outcome
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationTab;