import { useState, useEffect } from 'react';
import { documents } from '../api';
import { useAuth } from '../AuthContext';

const DocumentViewer = ({ equipmentId, onClose }) => {
  const [documentList, setDocumentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchDocuments();
  }, [equipmentId]);

  const fetchDocuments = async () => {
    try {
      const response = await documents.getByEquipment(equipmentId);
      setDocumentList(response.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await documents.upload(equipmentId, file);
      await fetchDocuments();
      event.target.value = '';
    } catch (error) {
      console.error('Failed to upload document:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handlePreview = async (filename, mimetype) => {
    try {
      const response = await documents.getFile(filename);
      const blob = new Blob([response.data], { type: mimetype });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Failed to preview document:', error);
    }
  };

  const handleDelete = async (filename) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await documents.delete(equipmentId, filename);
      await fetchDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document');
    }
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
        </svg>
      );
    } else if (mimetype === 'application/pdf') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
      );
    } else {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z"/>
        </svg>
      );
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
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#0f172a',
            margin: 0
          }}>
            Equipment Documents
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            ×
          </button>
        </div>

        {/* Upload Section */}
        {user?.role === 'admin' && (
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <label style={{
              display: 'block',
              padding: '16px',
              border: '2px dashed #cbd5e1',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: uploading ? '#f8fafc' : 'transparent'
            }}>
              <input
                type="file"
                onChange={handleUpload}
                disabled={uploading}
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
              />
              {uploading ? (
                <span style={{ color: '#64748b' }}>Uploading...</span>
              ) : (
                <span style={{ color: '#64748b' }}>
                  Click to upload document (PDF, DOC, images)
                </span>
              )}
            </label>
          </div>
        )}

        {/* Documents List */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '3px solid #e2e8f0',
                borderTop: '3px solid #0f172a',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ color: '#64748b' }}>Loading documents...</p>
            </div>
          ) : documentList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <p style={{ color: '#64748b' }}>No documents uploaded yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {documentList.map((doc, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    gap: '16px'
                  }}
                >
                  <div style={{ color: '#64748b' }}>
                    {getFileIcon(doc.mimetype)}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#0f172a',
                      margin: '0 0 4px 0'
                    }}>
                      {doc.originalname}
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      color: '#64748b',
                      margin: 0
                    }}>
                      {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handlePreview(doc.filename, doc.mimetype)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#0f172a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Preview
                    </button>
                    
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleDelete(doc.filename)}
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
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {previewUrl && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001
          }}>
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '16px',
              maxWidth: '90%',
              maxHeight: '90%',
              overflow: 'auto'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h3 style={{ margin: 0 }}>Document Preview</h3>
                <button
                  onClick={() => setPreviewUrl(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </div>
              <iframe
                src={previewUrl}
                style={{
                  width: '100%',
                  height: '600px',
                  border: 'none'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;