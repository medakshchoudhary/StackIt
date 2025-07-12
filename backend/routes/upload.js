const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/authMiddleware');
const path = require('path');

// @desc    Upload image
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Return the file URL based on storage type
    let imageUrl;
    if (req.file.path) {
      // Cloudinary URL
      imageUrl = req.file.path;
    } else {
      // Local storage URL
      imageUrl = `/uploads/${req.file.filename}`;
    }

    res.json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed'
    });
  }
});

module.exports = router;
