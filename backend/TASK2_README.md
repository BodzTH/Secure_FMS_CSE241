# Security & Database Module

This module implements secure password hashing, file encryption/decryption, and the database connection logic.

## 1. Setup

**Install Dependencies:**
Run this in the `backend` directory:
```bash
npm install mongoose bcrypt dotenv
```

**Environment Variables:**
Add these to your `.env` file:
```env
MONGO_URI=your_mongodb_connection_string
# Run `crypto.randomBytes(32).toString('hex')` in Node to generate this key
ENCRYPTION_KEY=your_64_char_hex_key
```

---

## 2. Usage Guide

### For Authentication (Login/Register)
**File:** `backend/models/User.js`

Passwords are **automatically salted and hashed** when you save a user. You do not need to hash them manually.

```javascript
const User = require('../models/User');

// 1. Create User (Password hashes automatically)
const newUser = await User.create({ 
    username: 'john', 
    email: 'john@example.com', 
    password: 'plainTextPassword123' 
});

// 2. Verify Password (for Login)
const isMatch = await newUser.matchPassword('plainTextPassword123'); // returns true/false
```

### For File Management (Upload/Download)
**File:** `backend/utils/fileCrypto.js`

Use these functions to encrypt files *before* saving them to disk, and decrypt them *after* reading from disk.

```javascript
const { encryptBuffer, decryptBuffer } = require('../utils/fileCrypto');

// 1. On Upload (Encrypt)
// Pass the raw file buffer from multer. Returns buffer with IV + Encrypted data.
const secureFileBuffer = encryptBuffer(req.file.buffer);
// -> Write 'secureFileBuffer' to disk

// 2. On Download (Decrypt)
// Read the encrypted file from disk first.
const originalFileBuffer = decryptBuffer(fs.readFileSync(path_to_encrypted_file));
// -> Send 'originalFileBuffer' to user
```

### Database Connection
**File:** `backend/config/db.js`

Import and run this in your main `server.js` or `app.js`.

```javascript
const connectDB = require('./config/db');
connectDB();
```
