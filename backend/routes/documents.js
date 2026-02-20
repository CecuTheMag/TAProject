import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin, requireManagerOrAdmin } from '../middleware/roleAuth.js';
import { setSchoolContext, queryInSchema } from '../middleware/schoolContext.js';

const router = express.Router();

// Apply authentication and schema context to all routes
router.use(authenticateToken);
router.use(setSchoolContext);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
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
    
    const result = await queryInSchema(
      req.schoolSchema,
      'SELECT documents FROM equipment WHERE id = $1',
      [equipmentId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    const documents = (result.rows[0].documents || []).map(doc => {
      try {
        return JSON.parse(doc);
      } catch (e) {
        return doc;
      }
    });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Upload document for equipment
router.post('/upload/:equipmentId', requireManagerOrAdmin, upload.single('document'), async (req, res) => {
  try {
    const { equipmentId } = req.params;
    const { originalname, filename, mimetype, size } = req.file;
    
    // Get current documents
    const equipmentResult = await queryInSchema(
      req.schoolSchema,
      'SELECT documents FROM equipment WHERE id = $1',
      [equipmentId]
    );
    
    if (equipmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    
    const currentDocs = equipmentResult.rows[0].documents || [];
    const newDoc = {
      filename,
      originalname,
      mimetype,
      size,
      uploadedAt: new Date().toISOString()
    };
    
    const updatedDocs = [...currentDocs, JSON.stringify(newDoc)];
    
    // Update equipment with new document
    const result = await queryInSchema(
      req.schoolSchema,
      'UPDATE equipment SET documents = $1 WHERE id = $2 RETURNING *',
      [updatedDocs, equipmentId]
    );
    
    res.json({
      message: 'Document uploaded successfully',
      document: newDoc,
      equipment: result.rows[0]
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
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
    
    const currentDocs = equipmentResult.rows[0].documents || [];
    const updatedDocs = currentDocs.filter(doc => {
      try {
        const parsed = JSON.parse(doc);
        return parsed.filename !== filename;
      } catch (e) {
        return doc !== filename;
      }
    });
    
    // Update equipment
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