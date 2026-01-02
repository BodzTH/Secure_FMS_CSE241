const File = require('../models/File');

// @desc    Upload a file
// @route   POST /api/files/upload
// @access  Private
const uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const { originalname, filename, mimetype, size } = req.file;

        const file = await File.create({
            original_name: originalname,
            stored_name: filename,
            owner_id: req.user._id, // Assumes 'protect' middleware adds user to req
            mimeType: mimetype,
            size: size,
            // file_hash left undefined as per request
        });

        res.status(201).json(file);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during file upload' });
    }
};

// @desc    List all files for user
// @route   GET /api/files
// @access  Private
const listFiles = async (req, res) => {
    try {
        let query = { owner_id: req.user._id };

        // If admin, maybe allow seeing all files? Or just their own?
        // For now, let's keep it scoped to owner unless specifically requested otherwise
        // If we want admin to see all, we can check role.
        if (req.user.role && (req.user.role.role_name === 'admin' || req.user.role.role_name === 'superadmin')) {
             // Optional: Admin view all files logic could go here
             // For now, let's just return their own files to keep dashboard clean, 
             // or remove this check if admins should only see their own files in this view.
        }

        const files = await File.find(query).sort({ createdAt: -1 });

        // Transform to match frontend expectation if needed, or just return
        const fileList = files.map(file => ({
            id: file._id,
            name: file.original_name,
            size: file.size,
            uploadDate: file.createdAt,
            // History could be populated if it's a separate model or embedded
            // Assuming history is not yet fully implemented in model, we mock/leave empty or use createdAt
            history: [{ action: 'Uploaded', date: file.createdAt }] 
        }));

        res.json(fileList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving files' });
    }
};

const path = require('path');
const fs = require('fs');

// @desc    Download a file
// @route   GET /api/files/download/:id
// @access  Private
const downloadFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Check permissions
        // We need to re-fetch or assume role is populated on req.user from 'protect' middleware.
        // The 'findAccessibleByUser' method works on a query, but here we already found the specific file.
        // So we manually check:
        // 1. Is user admin/superadmin?
        // 2. Is user the owner?
        
        const isOwner = file.owner_id.toString() === req.user._id.toString();
        const isAdmin = req.user.role && (req.user.role.role_name === 'admin' || req.user.role.role_name === 'superadmin');

        if (!isOwner && !isAdmin) {
             return res.status(403).json({ message: 'Access denied' });
        }

        const filePath = path.join(__dirname, '../uploads', file.stored_name);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.download(filePath, file.original_name);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during file download' });
    }
};

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
const deleteFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Check permissions
        const isOwner = file.owner_id.toString() === req.user._id.toString();
        const isAdmin = req.user.role && (req.user.role.role_name === 'admin' || req.user.role.role_name === 'superadmin');

        if (!isOwner && !isAdmin) {
             return res.status(403).json({ message: 'Access denied' });
        }

        // Delete from disk
        const filePath = path.join(__dirname, '../uploads', file.stored_name);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete from DB
        await file.deleteOne();

        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during file deletion' });
    }
};

module.exports = {
    uploadFile,
    downloadFile,
    deleteFile,
    listFiles
};
