const crypto = require('crypto');

// Configuration
const ALGORITHM = 'aes-256-cbc';
// Ensure this key is exactly 32 bytes.
// In production, load this from process.env.ENCRYPTION_KEY
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ? 
    Buffer.from(process.env.ENCRYPTION_KEY, 'hex') : 
    crypto.randomBytes(32); 

const IV_LENGTH = 16; // AES block size

/**
 * Encrypts a file buffer.
 * @param {Buffer} buffer - The raw file data from the upload.
 * @returns {Buffer} - The encrypted data with the IV prepended.
 */
const encryptBuffer = (buffer) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(buffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Return IV + Encrypted Data
    return Buffer.concat([iv, encrypted]);
};

/**
 * Decrypts an encrypted file buffer.
 * @param {Buffer} encryptedBuffer - The encrypted file data read from disk.
 * @returns {Buffer} - The original raw file data.
 */
const decryptBuffer = (encryptedBuffer) => {
    // Extract IV (first 16 bytes)
    const iv = encryptedBuffer.slice(0, IV_LENGTH);
    // Extract Encrypted Data (rest of buffer)
    const encryptedData = encryptedBuffer.slice(IV_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
};

module.exports = {
    encryptBuffer,
    decryptBuffer
};
