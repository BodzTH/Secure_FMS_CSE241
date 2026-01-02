const express = require('express');
const router = express.Router();
const { uploadFile, downloadFile, deleteFile } = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Upload endpoint
// Uses 'file' as the form-data key
router.post('/upload', protect, upload.single('file'), uploadFile);

// Download endpoint
router.get('/download/:id', protect, downloadFile);

// Delete endpoint
router.delete('/:id', protect, deleteFile);

module.exports = router;
