const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { runQuery, getQuery, allQuery } = require('../database/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Upload image
router.post('/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { filename, originalname, path: filePath } = req.file;
    const userId = req.user.userId;

    // Save image record to database
    const result = await runQuery(
      `INSERT INTO image_records 
       (filename, original_filename, file_path, user_id, analysis_status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [filename, originalname, filePath, userId]
    );

    res.status(201).json({
      message: 'Image uploaded successfully',
      imageId: result.id,
      filename: filename,
      originalName: originalname,
      status: 'pending'
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if database insertion failed
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Get user's images
router.get('/my-images', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const images = await allQuery(
      `SELECT 
        id, filename, original_filename, upload_timestamp, 
        analysis_status, detected_objects, risk_level, 
        risk_description, confidence_scores
       FROM image_records 
       WHERE user_id = ? 
       ORDER BY upload_timestamp DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    // Get total count for pagination
    const countResult = await getQuery(
      'SELECT COUNT(*) as total FROM image_records WHERE user_id = ?',
      [userId]
    );

    res.json({
      images: images || [],
      pagination: {
        page,
        limit,
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Get specific image details
router.get('/:imageId', authenticateToken, async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.user.userId;

    const image = await getQuery(
      `SELECT 
        id, filename, original_filename, upload_timestamp, 
        analysis_status, detected_objects, risk_level, 
        risk_description, confidence_scores
       FROM image_records 
       WHERE id = ? AND user_id = ?`,
      [imageId, userId]
    );

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json({ image });
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ error: 'Failed to fetch image details' });
  }
});

// Delete image
router.delete('/:imageId', authenticateToken, async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.user.userId;

    // Get image details first
    const image = await getQuery(
      'SELECT filename, file_path FROM image_records WHERE id = ? AND user_id = ?',
      [imageId, userId]
    );

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete from database
    await runQuery(
      'DELETE FROM image_records WHERE id = ? AND user_id = ?',
      [imageId, userId]
    );

    // Delete file from filesystem
    if (fs.existsSync(image.file_path)) {
      fs.unlink(image.file_path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ error: error.message });
  }
  
  next(error);
});

module.exports = router;
