const express = require('express');
const router = express.Router();
const { createUser, updateUser, deleteUser, listUsers } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Check Auth first, then Role
router.use(protect);
router.use(adminOnly);

router.post('/create-user', createUser);
router.patch('/update-user/:id', updateUser);
router.delete('/delete-user/:id', deleteUser);
router.get('/users', listUsers);

module.exports = router;
