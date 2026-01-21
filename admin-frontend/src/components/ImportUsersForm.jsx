import { useState } from 'react';
import { systemAdmin } from '../api';
import * as XLSX from 'xlsx';

const ImportUsersForm = ({ schools, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [mapping, setMapping] = useState({ nameCol: '', emailCol: '', phoneCol: '', roleCol: '' });
  const [schoolId, setSchoolId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      if (jsonData.length > 0) {
        setColumns(jsonData[0].map((col, idx) => ({ name: col || `Column ${idx}`, index: idx })));
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file || !schoolId || !mapping.nameCol || !mapping.emailCol) {
      alert('Please select file, school, and map required columns (Name and Email)');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('nameCol', mapping.nameCol);
      formData.append('emailCol', mapping.emailCol);
      formData.append('phoneCol', mapping.phoneCol || '');
      formData.append('roleCol', mapping.roleCol || '');
      formData.append('schoolId', schoolId);

      const response = await systemAdmin.importUsers(formData);
      setResult(response.data);
      if (onSuccess) onSuccess();
      alert(`Successfully imported ${response.data.imported} users!`);
    } catch (error) {
      alert(error.response?.data?.error || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleImport} style={{ display: 'grid', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b' }}>
            Select School
          </label>
          <select
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            required
            style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
          >
            <option value="">Choose a school...</option>
            {schools.map(school => (
              <option key={school.id} value={school.id}>{school.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b' }}>
            Upload File (.xlsx, .xls, .accdb)
          </label>
          <input
            type="file"
            accept=".xlsx,.xls,.accdb"
            onChange={handleFileChange}
            style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
          />
        </div>

        {columns.length > 0 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b' }}>
                  Name Column *
                </label>
                <select
                  value={mapping.nameCol}
                  onChange={(e) => setMapping({ ...mapping, nameCol: e.target.value })}
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                >
                  <option value="">Select column...</option>
                  {columns.map(col => (
                    <option key={col.index} value={col.index}>{col.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b' }}>
                  Email Column *
                </label>
                <select
                  value={mapping.emailCol}
                  onChange={(e) => setMapping({ ...mapping, emailCol: e.target.value })}
                  required
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                >
                  <option value="">Select column...</option>
                  {columns.map(col => (
                    <option key={col.index} value={col.index}>{col.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b' }}>
                  Phone Column (Optional)
                </label>
                <select
                  value={mapping.phoneCol}
                  onChange={(e) => setMapping({ ...mapping, phoneCol: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                >
                  <option value="">Select column...</option>
                  {columns.map(col => (
                    <option key={col.index} value={col.index}>{col.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b' }}>
                  Role/Subject Column (Optional)
                </label>
                <select
                  value={mapping.roleCol}
                  onChange={(e) => setMapping({ ...mapping, roleCol: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                >
                  <option value="">Select column...</option>
                  {columns.map(col => (
                    <option key={col.index} value={col.index}>{col.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ padding: '15px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: '600', color: '#0369a1' }}>Import Instructions:</p>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#0c4a6e', fontSize: '14px' }}>
                <li>Name and Email columns are required</li>
                <li>Role/Subject should contain: MATHEMATICS, ENGLISH, ADMINISTRATOR, or class name for students</li>
                <li>Default password for all users will be: password123</li>
                <li>Users will be assigned roles based on their subject/class</li>
              </ul>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading || !file || !schoolId}
          style={{
            padding: '12px 24px',
            background: loading ? '#94a3b8' : '#1e40af',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '16px'
          }}
        >
          {loading ? 'Importing...' : 'Import Users'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '20px', padding: '20px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#166534' }}>Import Results</h4>
          <p style={{ margin: '5px 0', color: '#15803d' }}>✓ Successfully imported: {result.imported} users</p>
          {result.errors.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <p style={{ margin: '5px 0', color: '#dc2626', fontWeight: '600' }}>⚠ Errors: {result.errors.length}</p>
              <div style={{ maxHeight: '200px', overflow: 'auto', fontSize: '12px', color: '#991b1b' }}>
                {result.errors.map((err, idx) => (
                  <div key={idx}>Row {err.row}: {err.name} - {err.error}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportUsersForm;
