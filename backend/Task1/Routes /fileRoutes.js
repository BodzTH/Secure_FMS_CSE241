const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { hasPermission } = require('../middleware/permissionMiddleware');
const {
    uploadFile,
    getMyFiles,
    deleteOwnFile
} = require('../controllers/fileController');

// User file routes
router.post('/upload', protect, hasPermission('upload_file'), uploadFile);
router.get('/my-files', protect, getMyFiles);
router.delete('/:id', protect, hasPermission('delete_own_file'), deleteOwnFile);

module.exports = router;
