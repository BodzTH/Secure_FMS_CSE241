const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { encryptBuffer } = require('../utils/fileCrypto');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Use memory storage to encrypt before saving to disk
const storage = multer.memoryStorage();

// File filter (optional: restrict types if needed, currently allowing all)
const fileFilter = (req, file, cb) => {
    cb(null, true);
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware to encrypt and save file after multer processes it
const encryptAndSave = (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        // Generate unique filename
        const uniqueName = `${uuidv4()}${path.extname(req.file.originalname)}`;
        const filePath = path.join(uploadDir, uniqueName);

        // Encrypt the file buffer
        const encryptedBuffer = encryptBuffer(req.file.buffer);

        // Write encrypted file to disk
        fs.writeFileSync(filePath, encryptedBuffer);

        // Update req.file with the saved file info
        req.file.filename = uniqueName;
        req.file.path = filePath;
        req.file.size = req.file.buffer.length; // Original size before encryption

        console.log(`✅ File encrypted and saved: ${uniqueName}`);
        next();
    } catch (error) {
        console.error('❌ Encryption error:', error);
        res.status(500).json({ message: 'Error encrypting file' });
    }
};

module.exports = { upload, encryptAndSave };
