import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { users } from '../api';
import { useAuth } from '../AuthContext';
import ConfirmDialog from './ConfirmDialog';
import EditUserModal from './EditUserModal';
import { toast } from './Toast';
import { useFormValidation, validationRules } from '../hooks/useFormValidation';
import { useTranslation } from '../translations';

const UsersTab = () => {
  const { t } = useTranslation();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [userActivity, setUserActivity] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
  const [selectedView, setSelectedView] = useState('classes'); // 'classes', 'teachers', or 'admins'
  const { user } = useAuth();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await users.getAll();
      setUsersList(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group users by class (grade_level) and teachers separately
  const groupedData = () => {
    const classes = {};
    const teachers = [];
    const admins = [];
    
    console.log('All users:', usersList); // Debug log
    
    usersList.forEach(user => {
      console.log('Processing user:', user.username, 'role:', user.role, 'email:', user.email); // Debug log
      
      if (user.role === 'teacher') {
        teachers.push(user);
      } else if (user.role === 'admin') {
        admins.push(user);
      } else if (user.role === 'student') {
        // Extract class from email (e.g., "12d@student" -> "12D")
        let className = 'Unknown';
        const emailMatch = user.email.match(/\.([0-9]+[a-d])@/);
        if (emailMatch) {
          className = emailMatch[1].toUpperCase();
        } else if (user.grade_level) {
          className = user.grade_level;
        } else if (user.subject_specialization) {
          // Look for patterns like "7A", "6B", "10A" etc.
          const match = user.subject_specialization.match(/(\d+)\s*([A-Z])/i);
          if (match) {
            className = match[1] + match[2].toUpperCase();
          }
        }
        
        console.log('Student class extracted:', className); // Debug log
        
        if (!classes[className]) {
          classes[className] = [];
        }
        classes[className].push(user);
      }
    });
    
    console.log('Final classes:', classes); // Debug log
    console.log('Final teachers:', teachers); // Debug log
    console.log('Final admins:', admins); // Debug log
    
    return { classes, teachers, admins };
  };

  const { classes, teachers, admins } = groupedData();

  const handleRoleChange = async (userId, newRole) => {
    try {
      const currentUser = usersList.find(u => u.id === userId);
      await users.updateRole(userId, {
        role: newRole,
        subject_id: newRole === 'teacher' ? currentUser?.subject_id : null
      });
      await fetchUsers();
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = (userId, username) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete User',
      message: `Are you sure you want to delete ${username}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await users.delete(userId);
          await fetchUsers();
          toast.success('User deleted successfully');
        } catch (error) {
          console.error('Failed to delete user:', error);
          toast.error('Failed to delete user');
        }
        setConfirmDialog({ isOpen: false });
      },
      onCancel: () => setConfirmDialog({ isOpen: false })
    });
  };

  const handleEditUser = (userItem) => {
    setSelectedUser(userItem);
    setShowEditModal(true);
  };

  const handleViewActivity = async (userId) => {
    try {
      const response = await users.getActivity(userId);
      setUserActivity(response.data);
      setSelectedUser(usersList.find(u => u.id === userId));
      setShowActivityModal(true);
    } catch (error) {
      console.error('Failed to fetch user activity:', error);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'manager': return '#8b5cf6';
      case 'teacher': return '#f59e0b';
      case 'student': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Only administrators can manage users.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #0f172a',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
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
          {t('userManagement')}
        </h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            backgroundColor: '#f1f5f9',
            borderRadius: '8px',
            padding: '4px'
          }}>
            <button
              onClick={() => setSelectedView('classes')}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedView === 'classes' ? '#3b82f6' : 'transparent',
                color: selectedView === 'classes' ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Classes
            </button>
            <button
              onClick={() => setSelectedView('teachers')}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedView === 'teachers' ? '#3b82f6' : 'transparent',
                color: selectedView === 'teachers' ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Teachers
            </button>
            <button
              onClick={() => setSelectedView('admins')}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedView === 'admins' ? '#3b82f6' : 'transparent',
                color: selectedView === 'admins' ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Admins
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
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
            + {t('createNewUser')}
          </button>
        </div>
      </div>

      <div>
        {selectedView === 'classes' ? (
          <ClassesView 
            classes={classes}
            onEditUser={handleEditUser}
            onViewActivity={handleViewActivity}
            onDeleteUser={handleDeleteUser}
            onRoleChange={handleRoleChange}
            currentUser={user}
            isMobile={isMobile}
          />
        ) : selectedView === 'teachers' ? (
          <TeachersView 
            teachers={teachers}
            onEditUser={handleEditUser}
            onViewActivity={handleViewActivity}
            onDeleteUser={handleDeleteUser}
            onRoleChange={handleRoleChange}
            currentUser={user}
            isMobile={isMobile}
          />
        ) : (
          <AdminsView 
            admins={admins}
            onEditUser={handleEditUser}
            onViewActivity={handleViewActivity}
            onDeleteUser={handleDeleteUser}
            onRoleChange={handleRoleChange}
            currentUser={user}
            isMobile={isMobile}
          />
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchUsers();
          }}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            fetchUsers();
          }}
        />
      )}

      {/* Activity Modal */}
      {showActivityModal && (
        <UserActivityModal
          user={selectedUser}
          activity={userActivity}
          onClose={() => setShowActivityModal(false)}
        />
      )}
      
      {/* Confirm Dialog */}
      <ConfirmDialog {...confirmDialog} />
    </div>
  );
};

const ClassesView = ({ classes, onEditUser, onViewActivity, onDeleteUser, onRoleChange, currentUser, isMobile }) => {
  const [expandedClass, setExpandedClass] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {Object.keys(classes).sort().map(className => (
        <div key={className} style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(226, 232, 240, 0.3)'
        }}>
          <div 
            onClick={() => setExpandedClass(expandedClass === className ? null : className)}
            style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Class {className}</h3>
              <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
                {classes[className].length} students
              </p>
            </div>
            <div style={{ fontSize: '20px', transform: expandedClass === className ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              ▼
            </div>
          </div>
          
          <AnimatePresence>
            {expandedClass === className && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {classes[className].map(student => (
                      <StudentCard 
                        key={student.id}
                        student={student}
                        onEditUser={onEditUser}
                        onViewActivity={onViewActivity}
                        onDeleteUser={onDeleteUser}
                        currentUser={currentUser}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

const AdminsView = ({ admins, onEditUser, onViewActivity, onDeleteUser, onRoleChange, currentUser, isMobile }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
      {admins.map(admin => (
        <AdminCard 
          key={admin.id}
          admin={admin}
          onEditUser={onEditUser}
          onViewActivity={onViewActivity}
          onDeleteUser={onDeleteUser}
          onRoleChange={onRoleChange}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
};

const TeachersView = ({ teachers, onEditUser, onViewActivity, onDeleteUser, onRoleChange, currentUser, isMobile }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
      {teachers.map(teacher => (
        <TeacherCard 
          key={teacher.id}
          teacher={teacher}
          onEditUser={onEditUser}
          onViewActivity={onViewActivity}
          onDeleteUser={onDeleteUser}
          onRoleChange={onRoleChange}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
};

const StudentCard = ({ student, onEditUser, onViewActivity, onDeleteUser, currentUser }) => {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '600',
          aspectRatio: '1',
          flexShrink: 0
        }}>
          {student.username.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', color: '#111827' }}>{student.username}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>{student.email}</div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => onEditUser(student)}
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
          onClick={() => onViewActivity(student.id)}
          style={{
            padding: '6px 12px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Activity
        </button>
      </div>
    </div>
  );
};

const AdminCard = ({ admin, onEditUser, onViewActivity, onDeleteUser, onRoleChange, currentUser }) => {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(226, 232, 240, 0.3)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '700',
          fontSize: '20px',
          aspectRatio: '1',
          flexShrink: 0
        }}>
          {admin.username.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '700', color: '#111827', fontSize: '18px' }}>
            {admin.grade_level || admin.username.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>{admin.email}</div>
          <div style={{
            display: 'inline-block',
            padding: '4px 8px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            Administrator
          </div>
        </div>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '12px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>
            {admin.total_requests || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
            Total Requests
          </div>
        </div>
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          borderRadius: '12px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>
            {admin.pending_requests || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
            Pending
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button
          onClick={() => onEditUser(admin)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Edit
        </button>
        <button
          onClick={() => onViewActivity(admin.id)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Activity
        </button>
        {admin.id !== currentUser.id && (
          <button
            onClick={() => onDeleteUser(admin.id, admin.username)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

const TeacherCard = ({ teacher, onEditUser, onViewActivity, onDeleteUser, onRoleChange, currentUser }) => {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(226, 232, 240, 0.3)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: '700',
          fontSize: '20px',
          aspectRatio: '1',
          flexShrink: 0
        }}>
          {teacher.username.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '700', color: '#111827', fontSize: '18px' }}>
            {teacher.grade_level || (
              teacher.username.includes('.') 
                ? teacher.username.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
                : teacher.username.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, str => str.toUpperCase())
            )}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>{teacher.email}</div>
          <div style={{
            display: 'inline-block',
            padding: '4px 8px',
            backgroundColor: '#dbeafe',
            color: '#1d4ed8',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {teacher.subject_specialization || 'Teacher'}
          </div>
        </div>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '12px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>
            {teacher.total_requests || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
            Total Requests
          </div>
        </div>
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          borderRadius: '12px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>
            {teacher.pending_requests || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
            Pending
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button
          onClick={() => onEditUser(teacher)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Edit
        </button>
        <button
          onClick={() => onViewActivity(teacher.id)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Activity
        </button>
        {teacher.id !== currentUser.id && (
          <button
            onClick={() => onDeleteUser(teacher.id, teacher.username)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

const UserCard = ({ userItem, currentUser, onRoleChange, onEditUser, onViewActivity, onDeleteUser, getRoleBadgeColor }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(226, 232, 240, 0.3)'
      }}
    >
      {/* User Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '700',
            fontSize: '18px',
            aspectRatio: '1',
            flexShrink: 0
          }}>
            {userItem.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '16px' }}>
              {userItem.username}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              {userItem.email}
            </div>
          </div>
        </div>
        
        {/* Actions Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1px solid #e2e8f0',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#64748b'
            }}
          >
            ⋮
          </button>
          
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  top: '45px',
                  right: '0',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                  border: '1px solid #e2e8f0',
                  minWidth: '150px',
                  zIndex: 10,
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => {
                    onEditUser(userItem);
                    setShowDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#374151',
                    borderBottom: '1px solid #f3f4f6'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                    <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
                  </svg>
                  Edit User
                </button>
                <button
                  onClick={() => {
                    onViewActivity(userItem.id);
                    setShowDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#374151',
                    borderBottom: '1px solid #f3f4f6'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                    <path d="M16,11V3H8V9H2V21H22V11H16M10,5H14V19H10V5M4,11H8V19H4V11M18,13H20V19H18V13Z"/>
                  </svg>
                  View Activity
                </button>
                {userItem.id !== currentUser.id && (
                  <button
                    onClick={() => {
                      onDeleteUser(userItem.id, userItem.username);
                      setShowDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#ef4444'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                    </svg>
                    Delete User
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Role Badge */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <select
            value={userItem.role}
            onChange={(e) => onRoleChange(userItem.id, e.target.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: getRoleBadgeColor(userItem.role),
              color: 'white',
              fontWeight: '600',
              fontSize: '14px',
              textTransform: 'capitalize',
              cursor: 'pointer'
            }}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          {userItem.role === 'teacher' && userItem.subject_name && (
            <div style={{
              padding: '6px 12px',
              backgroundColor: '#dbeafe',
              color: '#1d4ed8',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {userItem.subject_name} ({userItem.subject_code})
            </div>
          )}
        </div>
      </div>
      
      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '12px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>
            {userItem.total_requests}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
            Total Requests
          </div>
        </div>
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          borderRadius: '12px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>
            {userItem.pending_requests}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
            Pending
          </div>
        </div>
      </div>
      
      {/* Join Date */}
      <div style={{
        fontSize: '14px',
        color: '#64748b',
        textAlign: 'center',
        padding: '8px',
        background: 'rgba(15, 23, 42, 0.05)',
        borderRadius: '8px'
      }}>
        Joined {new Date(userItem.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}
      </div>
    </motion.div>
  );
};

const CreateUserModal = ({ onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [subjects, setSubjects] = useState([]);
  
  const validation = useFormValidation(
    { 
      username: '', 
      email: '', 
      role: 'student',
      grade_level: '',
      subject_specialization: '',
      phone: '',
      subject_id: ''
    },
    {
      username: [validationRules.required, validationRules.minLength(3)],
      email: [validationRules.required, validationRules.email],
      role: [validationRules.required],
      grade_level: [validationRules.required]
    }
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Fetch subjects for teacher assignment
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/education/subjects', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'X-School-Code': JSON.parse(localStorage.getItem('user') || '{}').schoolCode || 'TEST001'
          }
        });
        if (response.ok) {
          const data = await response.json();
          setSubjects(data);
        }
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
      }
    };
    fetchSubjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validation.validateAll()) {
      toast.error('Please fix the errors below');
      return;
    }
    
    setLoading(true);
    
    try {
      const userData = {
        ...validation.values,
        subject_id: validation.values.subject_id || null
      };
      await users.create(userData);
      toast.success('User created successfully');
      onSuccess();
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      style={{
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
        padding: isMobile ? '20px' : '0'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          borderRadius: '20px',
          padding: '0',
          width: isMobile ? '100%' : '500px',
          maxWidth: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden'
        }}>
        <div style={{
          background: 'rgba(248, 250, 252, 0.95)',
          padding: isMobile ? '20px' : '24px 32px',
          color: '#0f172a',
          marginBottom: '24px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <h2 id="modal-title" style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: '700' }}>{t('createNewUser')}</h2>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: isMobile ? '0 20px 20px' : '0 32px 32px', maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label htmlFor="username" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#0f172a' }}>
                {t('username')} *
              </label>
              <input
                id="username"
                type="text"
                value={validation.values.username}
                onChange={(e) => validation.handleChange('username', e.target.value)}
                onBlur={() => validation.handleBlur('username')}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${validation.errors.username ? '#ef4444' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
              {validation.errors.username && validation.touched.username && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                  {validation.errors.username}
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#0f172a' }}>
                {t('email')} *
              </label>
              <input
                id="email"
                type="email"
                value={validation.values.email}
                onChange={(e) => validation.handleChange('email', e.target.value)}
                onBlur={() => validation.handleBlur('email')}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${validation.errors.email ? '#ef4444' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
              {validation.errors.email && validation.touched.email && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                  {validation.errors.email}
                </div>
              )}
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#0f172a' }}>
                {t('role')} *
              </label>
              <select
                value={validation.values.role}
                onChange={(e) => validation.handleChange('role', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="student">{t('student')}</option>
                <option value="teacher">{t('teacher')}</option>
                <option value="manager">{t('manager')}</option>
                <option value="admin">{t('admin')}</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#0f172a' }}>
                {validation.values.role === 'student' ? 'Class/Grade' : 'Full Name'} *
              </label>
              <input
                type="text"
                value={validation.values.grade_level}
                onChange={(e) => validation.handleChange('grade_level', e.target.value)}
                onBlur={() => validation.handleBlur('grade_level')}
                placeholder={validation.values.role === 'student' ? 'e.g., 5A, 6B, 7C' : 'Full name'}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${validation.errors.grade_level ? '#ef4444' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
              {validation.errors.grade_level && validation.touched.grade_level && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                  {validation.errors.grade_level}
                </div>
              )}
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#0f172a' }}>
                Subject Specialization
              </label>
              <input
                type="text"
                value={validation.values.subject_specialization}
                onChange={(e) => validation.handleChange('subject_specialization', e.target.value)}
                placeholder={validation.values.role === 'teacher' ? 'e.g., MATHEMATICS, ENGLISH' : 'Optional'}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#0f172a' }}>
                Phone
              </label>
              <input
                type="tel"
                value={validation.values.phone}
                onChange={(e) => validation.handleChange('phone', e.target.value)}
                placeholder="Optional"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
          
          {validation.values.role === 'teacher' && subjects.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#0f172a' }}>
                Assign Subject
              </label>
              <select
                value={validation.values.subject_id}
                onChange={(e) => validation.handleChange('subject_id', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Select a subject (optional)</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div style={{ padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', marginBottom: '24px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#0369a1' }}>
              💡 The user will receive verification codes to set up their password on first login.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: loading ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? t('creating') : t('createNewUser')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const UserActivityModal = ({ user, activity, onClose }) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
      case 'pending': return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
      case 'rejected': return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' };
      case 'returned': return { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' };
      default: return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '0',
          width: isMobile ? '100%' : '900px',
          maxWidth: '100%',
          maxHeight: isMobile ? '100%' : '85%',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          margin: isMobile ? '20px' : '0'
        }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e5e7eb',
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700' }}>
                {user?.username}{t('userActivity')}
              </h2>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
                {activity.length} {t('totalRequests')}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '8px',
                width: '40px',
                height: '40px',
                fontSize: '20px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div style={{ padding: isMobile ? '16px 20px' : '24px 32px', maxHeight: isMobile ? '70vh' : '500px', overflowY: 'auto' }}>
          {activity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#9ca3af">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17Z"/>
                </svg>
              </div>
              <h3 style={{ color: '#6b7280', fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
                {t('noActivityFound')}
              </h3>
              <p style={{ color: '#9ca3af', margin: 0 }}>
                {t('noActivityMessage')}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activity.map((item) => {
                const statusStyle = getStatusColor(item.status);
                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '20px',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ 
                          margin: '0 0 8px 0', 
                          fontSize: '18px', 
                          fontWeight: '600', 
                          color: '#111827' 
                        }}>
                          {item.equipment_name}
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>📅 {t('requested')}: {new Date(item.request_date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                          {item.start_date && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>⏰ {t('period')}: {new Date(item.start_date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })} - {new Date(item.end_date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text,
                        border: `1px solid ${statusStyle.border}`,
                        textTransform: 'capitalize',
                        minWidth: '80px',
                        textAlign: 'center'
                      }}>
                        {item.status}
                      </div>
                    </div>
                    
                    {item.return_condition && (
                      <div style={{
                        marginTop: '12px',
                        padding: '8px 12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '6px',
                        fontSize: '13px'
                      }}>
                        <span style={{ fontWeight: '600', color: '#374151' }}>{t('returnCondition')}:</span>
                        <span style={{ color: '#6b7280', marginLeft: '8px', textTransform: 'capitalize' }}>
                          {item.return_condition}
                        </span>
                      </div>
                    )}
                    
                    {item.notes && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: '#f0f9ff',
                        border: '1px solid #e0f2fe',
                        borderRadius: '8px'
                      }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#0369a1', marginBottom: '4px' }}>
                          📝 {t('notes')}
                        </div>
                        <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
                          {item.notes}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UsersTab;