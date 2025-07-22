const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads/notes';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|ppt|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents allowed.'));
    }
  }
});

// Upload/Create new note
router.post('/upload', authenticateToken, authorizeRoles('admin', 'teacher'), upload.single('file'), async (req, res) => {
  const { title, description } = req.body;
  
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    let filePath = null;
    if (req.file) {
      filePath = req.file.path;
    }

    const result = await pool.query(
      'INSERT INTO notes (title, description, file_path, uploaded_by) VALUES ($1, $2, $3, $4) RETURNING id',
      [title, description, filePath, req.user.id]
    );

    res.status(201).json({
      message: 'Note uploaded successfully',
      note_id: result.rows[0].id,
      file_uploaded: !!req.file
    });
  } catch (err) {
    // Clean up uploaded file if database insert fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: err.message });
  }
});

// Get all notes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT n.id, n.title, n.description, n.file_path, n.uploaded_at,
             u.name as uploaded_by_name, u.role as uploader_role
      FROM notes n
      JOIN users u ON n.uploaded_by = u.id
      ORDER BY n.uploaded_at DESC
    `);

    const notes = result.rows.map(note => ({
      ...note,
      has_file: !!note.file_path,
      file_name: note.file_path ? path.basename(note.file_path) : null
    }));

    res.json({ notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific note by ID
router.get('/:id', authenticateToken, async (req, res) => {
  const noteId = req.params.id;
  
  try {
    const result = await pool.query(`
      SELECT n.*, u.name as uploaded_by_name, u.role as uploader_role
      FROM notes n
      JOIN users u ON n.uploaded_by = u.id
      WHERE n.id = $1
    `, [noteId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const note = result.rows[0];
    res.json({
      note: {
        ...note,
        has_file: !!note.file_path,
        file_name: note.file_path ? path.basename(note.file_path) : null
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download note file
router.get('/:id/download', authenticateToken, async (req, res) => {
  const noteId = req.params.id;
  
  try {
    const result = await pool.query('SELECT file_path, title FROM notes WHERE id = $1', [noteId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const note = result.rows[0];
    if (!note.file_path) {
      return res.status(404).json({ message: 'No file attached to this note' });
    }

    if (!fs.existsSync(note.file_path)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    const fileName = path.basename(note.file_path);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.sendFile(path.resolve(note.file_path));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update note (only by uploader or admin)
router.put('/:id', authenticateToken, async (req, res) => {
  const noteId = req.params.id;
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    // Check if user can update this note
    const noteCheck = await pool.query('SELECT uploaded_by FROM notes WHERE id = $1', [noteId]);
    
    if (noteCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const isOwner = noteCheck.rows[0].uploaded_by === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You can only update your own notes' });
    }

    await pool.query(
      'UPDATE notes SET title = $1, description = $2 WHERE id = $3',
      [title, description, noteId]
    );

    res.json({ message: 'Note updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete note (only by uploader or admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  const noteId = req.params.id;

  try {
    // Get note details first
    const noteResult = await pool.query('SELECT file_path, uploaded_by FROM notes WHERE id = $1', [noteId]);
    
    if (noteResult.rows.length === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const note = noteResult.rows[0];
    const isOwner = note.uploaded_by === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'You can only delete your own notes' });
    }

    // Delete from database
    await pool.query('DELETE FROM notes WHERE id = $1', [noteId]);

    // Delete file if exists
    if (note.file_path && fs.existsSync(note.file_path)) {
      fs.unlinkSync(note.file_path);
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;