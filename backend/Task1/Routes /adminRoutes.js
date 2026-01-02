const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { hasPermission } = require('../middleware/permissionMiddleware');
const {
    getAllFiles,
    deleteAnyFile,
    getAllUsers
} = require('../controllers/fileController');

// Admin routes
router.get('/users', protect, hasPermission('view_users'), getAllUsers);
router.get('/files', protect, hasPermission('view_all_files'), getAllFiles);
router.delete('/files/:id', protect, hasPermission('delete_any_file'), deleteAnyFile);

module.exports = router;
