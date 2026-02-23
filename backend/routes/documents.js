import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin, requireManagerOrAdmin } from '../middleware/roleAuth.js';
import { setSchoolContext, queryInSchema } from '../middleware/schoolContext.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads/documents directory');
}

// Apply authentication and schema context to all routes
router.use(authenticateToken);
router.use(setSchoolContext);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed'));
    }
  }
});

// Get equipment documents
router.get('/equipment/:equipmentId', async (req, res) => {
  try {
    const { equipmentId } = req.params;
    console.log(`Fetching documents for equipment ${equipmentId}, schema: ${req.schoolSchema}`);
    
    const result = await queryInSchema(
      req.schoolSchema,
      'SELECT documents FROM equipment WHERE id = $1',
      [equipmentId]
    );
    
    if (result.rows.length === 0) {
      console.log(`Equipment ${equipmentId} not found in schema ${req.schoolSchema}`);
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    // Handle both old format (array of strings) and new format (JSONB array)
    let documents = result.rows[0].documents || [];
    
    // If it's stored as a JSONB array, use it directly
    if (Array.isArray(documents)) {
      // Convert any string elements to objects (for backward compatibility)
      documents = documents.map(doc => {
        if (typeof doc === 'string') {
          try {
            return JSON.parse(doc);
          } catch (e) {
            return null;
          }
        }
        return doc;
      }).filter(doc => doc !== null);
    } else {
      documents = [];
    }
    
    console.log(`Found ${documents.length} documents for equipment ${equipmentId}`);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents', details: error.message });
  }
});

// Upload document for equipment
router.post('/upload/:equipmentId', requireManagerOrAdmin, upload.single('document'), async (req, res) => {
  try {
    const { equipmentId } = req.params;
    console.log(`Uploading document for equipment ${equipmentId}, schema: ${req.schoolSchema}`);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { originalname, filename, mimetype, size } = req.file;
    console.log(`File uploaded: ${filename} (${mimetype}, ${size} bytes)`);
    
    // Get current documents
    const equipmentResult = await queryInSchema(
      req.schoolSchema,
      'SELECT documents FROM equipment WHERE id = $1',
      [equipmentId]
    );
    
    if (equipmentResult.rows.length === 0) {
      // Clean up uploaded file if equipment not found
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    // Get current documents - ensure it's an array of objects
    let currentDocs = equipmentResult.rows[0].documents || [];
    
    // Handle legacy format where documents might be stored as strings
    if (Array.isArray(currentDocs)) {
      currentDocs = currentDocs.map(doc => {
        if (typeof doc === 'string') {
          try {
            return JSON.parse(doc);
          } catch (e) {
            return null;
          }
        }
        return doc;
      }).filter(doc => doc !== null);
    } else {
      currentDocs = [];
    }
    
    const newDoc = {
      filename,
      originalname,
      mimetype,
      size,
      uploadedAt: new Date().toISOString()
    };
    
    // Store as proper JSONB array (not array of strings)
    const updatedDocs = [...currentDocs, newDoc];
    
    // Update equipment with new document - pass array directly, pg will handle JSONB conversion
    const result = await queryInSchema(
      req.schoolSchema,
      'UPDATE equipment SET documents = $1 WHERE id = $2 RETURNING *',
      [updatedDocs, equipmentId]
    );
    
    console.log(`Document saved to equipment ${equipmentId}`);
    res.json({
      message: 'Document uploaded successfully',
      document: newDoc,
      equipment: result.rows[0]
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    // Clean up uploaded file on error
    if (req.file && req.file.filename) {
      const filePath = path.join(uploadsDir, req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.status(500).json({ error: 'Failed to upload document', details: error.message });
  }
});

// Serve document files
router.get('/file/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', 'documents', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

// Delete document
router.delete('/:equipmentId/:filename', requireManagerOrAdmin, async (req, res) => {
  try {
    const { equipmentId, filename } = req.params;
    
    // Get current documents
    const equipmentResult = await queryInSchema(
      req.schoolSchema,
      'SELECT documents FROM equipment WHERE id = $1',
      [equipmentId]
    );
    
    if (equipmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    // Get current documents and handle both formats
    let currentDocs = equipmentResult.rows[0].documents || [];
    
    if (Array.isArray(currentDocs)) {
      currentDocs = currentDocs.map(doc => {
        if (typeof doc === 'string') {
          try {
            return JSON.parse(doc);
          } catch (e) {
            return { filename: doc };
          }
        }
        return doc;
      });
    } else {
      currentDocs = [];
    }
    
    const updatedDocs = currentDocs.filter(doc => doc.filename !== filename);
    
    // Update equipment - pass array directly, pg will handle JSONB conversion
    await queryInSchema(
      req.schoolSchema,
      'UPDATE equipment SET documents = $1 WHERE id = $2',
      [updatedDocs, equipmentId]
    );
    
    // Delete file from filesystem
    const filePath = path.join(process.cwd(), 'uploads', 'documents', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;
