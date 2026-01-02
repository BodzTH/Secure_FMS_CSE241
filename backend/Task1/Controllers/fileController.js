const File = require('../models/File');
const { hasPermission } = require('../middleware/permissionMiddleware');

// @desc    Upload file
// @route   POST /api/files/upload
// @access  Private (requires upload_file permission)
const uploadFile = async (req, res) => {
    try {
        const { fileName, fileHash } = req.body;

        // Validate input
        if (!fileName || !fileHash) {
            return res.status(400).json({ 
                error: 'fileName and fileHash are required' 
            });
        }

        // Create file record
        const file = await File.create({
            ownerId: req.user.id,
            fileName,
            fileHash
        });

        res.status(201).json({
            message: 'File uploaded successfully',
            file: {
                id: file._id,
                fileName: file.fileName,
                fileHash: file.fileHash,
                ownerId: file.ownerId,
                createdAt: file.createdAt
            }
        });
    } catch (error) {
        console.error('Upload file error:', error);
        
        // Handle duplicate file hash
        if (error.code === 11000) {
            return res.status(409).json({ 
                error: 'File with this hash already exists' 
            });
        }

        res.status(500).json({ 
            error: 'Server error during file upload',
            details: error.message 
        });
    }
};

// @desc    Get user's own files
// @route   GET /api/files/my-files
// @access  Private
const getMyFiles = async (req, res) => {
    try {
        const files = await File.find({ ownerId: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json({
            count: files.length,
            files
        });
    } catch (error) {
        console.error('Get my files error:', error);
        res.status(500).json({ 
            error: 'Server error',
            details: error.message 
        });
    }
};

// @desc    Delete own file
// @route   DELETE /api/files/:id
// @access  Private (requires delete_own_file permission)
const deleteOwnFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ 
                error: 'File not found' 
            });
        }

        // Check if user is the owner
        if (file.ownerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ 
                error: 'Access denied. You can only delete your own files' 
            });
        }

        await File.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: 'File deleted successfully'
        });
    } catch (error) {
        console.error('Delete own file error:', error);
        res.status(500).json({ 
            error: 'Server error',
            details: error.message 
        });
    }
};

// @desc    Get all files (Admin only)
// @route   GET /api/admin/files
// @access  Private (requires view_all_files permission)
const getAllFiles = async (req, res) => {
    try {
        const files = await File.find().populate('ownerId', 'firstName lastName email').sort({ createdAt: -1 });

        res.status(200).json({
            count: files.length,
            files
        });
    } catch (error) {
        console.error('Get all files error:', error);
        res.status(500).json({ 
            error: 'Server error',
            details: error.message 
        });
    }
};

// @desc    Delete any file (Admin only)
// @route   DELETE /api/admin/files/:id
// @access  Private (requires delete_any_file permission)
const deleteAnyFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ 
                error: 'File not found' 
            });
        }

        await File.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: 'File deleted successfully by admin',
            deletedFile: {
                id: file._id,
                fileName: file.fileName,
                ownerId: file.ownerId
            }
        });
    } catch (error) {
        console.error('Delete any file error:', error);
        res.status(500).json({ 
            error: 'Server error',
            details: error.message 
        });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private (requires view_users permission)
const getAllUsers = async (req, res) => {
    try {
        const User = require('../models/User');
        const UserRole = require('../models/UserRole');

        const users = await User.find().select('-password');

        // Get roles for each user
        const usersWithRoles = await Promise.all(
            users.map(async (user) => {
                const userRole = await UserRole.findOne({ userId: user._id }).populate('roleId');
                return {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: userRole ? userRole.roleId.name : 'No role assigned',
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                };
            })
        );

        res.status(200).json({
            count: usersWithRoles.length,
            users: usersWithRoles
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ 
            error: 'Server error',
            details: error.message 
        });
    }
};

module.exports = {
    uploadFile,
    getMyFiles,
    deleteOwnFile,
    getAllFiles,
    deleteAnyFile,
    getAllUsers
};
