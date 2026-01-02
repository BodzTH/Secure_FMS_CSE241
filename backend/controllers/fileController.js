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
    deleteFile
};
