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

        const files = await File.find(query).sort({ created_at: -1 }).populate('owner_id', 'username email');

        // Transform to match frontend expectation
        const fileList = files.map(file => ({
            _id: file._id,
            filename: file.original_name, // Frontend expects 'filename'
            size: file.size,
            uploadedBy: file.owner_id, // Populated user object
            uploadDate: file.created_at, // Schema uses 'created_at'
            history: [{ action: 'Uploaded', date: file.created_at }] 
        }));

        res.json(fileList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving files' });
    }
};

const path = require('path');
const fs = require('fs');
const { decryptBuffer } = require('../utils/fileCrypto');

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
        const isOwner = file.owner_id.toString() === req.user._id.toString();
        const isAdmin = req.user.role && (req.user.role.role_name === 'admin' || req.user.role.role_name === 'superadmin');

        if (!isOwner && !isAdmin) {
             return res.status(403).json({ message: 'Access denied' });
        }

        const filePath = path.join(__dirname, '../uploads', file.stored_name);
        console.log('Attempting to download file from:', filePath);

        if (!fs.existsSync(filePath)) {
            console.error('File not found at path:', filePath);
            return res.status(404).json({ message: 'File not found on server' });
        }

        // Read encrypted file and decrypt
        const encryptedBuffer = fs.readFileSync(filePath);
        const decryptedBuffer = decryptBuffer(encryptedBuffer);

        console.log(`✅ File decrypted successfully: ${file.original_name}`);

        // Set headers for download
        res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
        res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
        res.setHeader('Content-Length', decryptedBuffer.length);

        // Send decrypted file
        res.send(decryptedBuffer);
    } catch (error) {
        console.error('Download error:', error);
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
