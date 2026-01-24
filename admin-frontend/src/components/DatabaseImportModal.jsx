import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const DatabaseImportModal = ({ onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [schools, setSchools] = useState([]);
  const [mapping, setMapping] = useState({
    name: '',
    phone: '',
    email: '',
    role: ''
  });
  const [selectedSchool, setSelectedSchool] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch(`http://localhost:5005/api/system-admin/schools`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Loaded schools:', data.schools);
          setSchools(data.schools);
        }
      } catch (error) {
        console.error('Failed to fetch schools:', error);
      }
    };
    fetchSchools();
  }, []);

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.accdb')) {
      alert('Please select an .accdb file');
      return;
    }

    setFile(selectedFile);
    setLoading(true);

    // Parse file to get columns
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`http://localhost:5005/api/system-admin/parse-accdb`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setColumns(data.columns);
        setStep(2);
      } else {
        alert('Failed to parse file');
      }
    } catch (error) {
      alert('Error parsing file');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!mapping.name || !mapping.email || !selectedSchool) {
      alert('Name, Email columns and School selection are required');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));
    formData.append('school_id', selectedSchool);

    try {
      const response = await fetch(`http://localhost:5005/api/system-admin/import-accdb`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        onImport(result);
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Import failed');
      }
    } catch (error) {
      alert('Import error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>
          Import Database (.accdb)
        </h2>

        {step === 1 && (
          <div>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>
              Select an Access database file (.accdb) to import user data.
            </p>
            
            <div style={{
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <input
                type="file"
                accept=".accdb"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="file-input"
              />
              <label
                htmlFor="file-input"
                style={{
                  cursor: 'pointer',
                  color: '#1e40af',
                  fontWeight: '600'
                }}
              >
                Click to select .accdb file
              </label>
              {file && (
                <p style={{ marginTop: '10px', color: '#10b981' }}>
                  Selected: {file.name}
                </p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>
              Select the school and map the columns from your database:
            </p>

            <div style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Target School *
                </label>
                <select
                  value={selectedSchool}
                  onChange={(e) => {
                    console.log('School selected:', e.target.value);
                    setSelectedSchool(e.target.value);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }}
                >
                  <option value="">Select school...</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>
                      {school.name} ({school.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Name Column *
                </label>
                <select
                  value={mapping.name}
                  onChange={(e) => setMapping({...mapping, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }}
                >
                  <option value="">Select column...</option>
                  {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Email Column *
                </label>
                <select
                  value={mapping.email}
                  onChange={(e) => setMapping({...mapping, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }}
                >
                  <option value="">Select column...</option>
                  {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Phone Column
                </label>
                <select
                  value={mapping.phone}
                  onChange={(e) => setMapping({...mapping, phone: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }}
                >
                  <option value="">Select column...</option>
                  {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Role/Subject Column
                </label>
                <select
                  value={mapping.role}
                  onChange={(e) => setMapping({...mapping, role: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }}
                >
                  <option value="">Select column...</option>
                  {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end',
          marginTop: '30px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          
          {step === 2 && (
            <button
              onClick={handleImport}
              disabled={loading || !mapping.name || !mapping.email || !selectedSchool}
              style={{
                padding: '10px 20px',
                background: loading ? '#9ca3af' : '#1e40af',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Importing...' : 'Import Data'}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DatabaseImportModal;