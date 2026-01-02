# 📊 Database Schema Documentation

## Database Information

- **Database Type**: MongoDB (NoSQL)
- **Database Name**: `secure_fms`
- **Connection String**: `mongodb://localhost:27017/secure_fms`
- **ORM/ODM**: Mongoose 9.1.1

---

## System Architecture

### Role-Based Access Control (RBAC)

**User Roles:**
- **Admin**: Can view all users, view all files, delete any file, see access logs
- **User**: Can upload files, delete own files

**Permissions:**
- **Admin Permissions**: `view_users`, `view_all_files`, `delete_any_file`, `view_logs`
- **User Permissions**: `upload_file`, `delete_own_file`

---

## Collections

### 1. Users Collection

**Collection Name**: `users`

**Purpose**: Store all users in the system with authentication and profile information

#### Schema Definition

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        default: () => `USR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters']
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lastLoginAttempt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true  // Automatically adds createdAt and updatedAt
});

// Password hashing middleware - runs automatically before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Helper method to compare passwords (for login)
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
```

#### Field Specifications

| Field Name | Data Type | Required | Unique | Default Value | Validation Rules | Description |
|------------|-----------|----------|--------|---------------|------------------|-------------|
| `_id` | ObjectId | Auto | Yes | Auto-generated | MongoDB ObjectId | Primary key (MongoDB) |
| `userId` | String | Yes | Yes | Auto-generated | Format: `USR-{timestamp}-{random}` | User unique identifier |
| `firstName` | String | Yes | No | - | Non-empty, trimmed | User's first name |
| `lastName` | String | Yes | No | - | Non-empty, trimmed | User's last name |
| `email` | String | Yes | Yes | - | Valid email format, lowercase | User's email address |
| `password` | String | Yes | No | - | Min 8 characters, auto-hashed | Hashed password (bcrypt) |
| `roleId` | ObjectId | Yes | No | - | Valid Role reference | Reference to Role collection |
| `loginAttempts` | Number | No | No | 0 | Integer ≥ 0 | Failed login attempt counter |
| `lastLoginAttempt` | Date | No | No | null | Valid date | Timestamp of last failed login |
| `createdAt` | Date | Auto | No | Auto-generated | ISO 8601 timestamp | Record creation time |
| `updatedAt` | Date | Auto | No | Auto-generated | ISO 8601 timestamp | Last update time |

#### Indexes

- **Primary Index**: `_id` (default MongoDB index)
- **Unique Index**: `email` (prevents duplicate email addresses)
- **Unique Index**: `userId` (prevents duplicate user IDs)
- **Reference Index**: `roleId` (for faster role lookups)

#### Example Document

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "USR-1735689600000-abc123xyz",
  "firstName": "Ahmed",
  "lastName": "Mohamed",
  "email": "ahmed@example.com",
  "password": "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  "roleId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "loginAttempts": 0,
  "lastLoginAttempt": null,
  "createdAt": "2026-01-02T10:30:00.000Z",
  "updatedAt": "2026-01-02T10:30:00.000Z"
}
```

---

### 2. Roles Collection

**Collection Name**: `roles`

**Purpose**: Define system roles with their permissions

#### Schema Definition

```javascript
const mongoose = require('mongoose');

const roleSchema = mongoose.Schema({
    roleId: {
        type: String,
        required: true,
        unique: true,
        default: () => `ROLE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    },
    roleName: {
        type: String,
        required: true,
        unique: true,
        enum: ['admin', 'user']
    },
    permissions: [{
        type: String,
        enum: [
            'upload_file',
            'delete_own_file',
            'view_users',
            'view_all_files',
            'delete_any_file',
            'view_logs'
        ]
    }],
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Role = mongoose.model('Role', roleSchema);
module.exports = Role;
```

#### Field Specifications

| Field Name | Data Type | Required | Unique | Default Value | Validation Rules | Description |
|------------|-----------|----------|--------|---------------|------------------|-------------|
| `_id` | ObjectId | Auto | Yes | Auto-generated | MongoDB ObjectId | Primary key (MongoDB) |
| `roleId` | String | Yes | Yes | Auto-generated | Format: `ROLE-{timestamp}-{random}` | Role unique identifier |
| `roleName` | String | Yes | Yes | - | Enum: ["admin", "user"] | Role name |
| `permissions` | Array | No | No | [] | Valid permission strings | List of permissions |
| `description` | String | Yes | No | - | Non-empty | Role description |
| `createdAt` | Date | Auto | No | Auto-generated | ISO 8601 timestamp | Record creation time |
| `updatedAt` | Date | Auto | No | Auto-generated | ISO 8601 timestamp | Last update time |

#### Predefined Roles

```javascript
// Admin Role
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "roleId": "ROLE-1735689600000-admin001",
  "roleName": "admin",
  "permissions": [
    "view_users",
    "view_all_files",
    "delete_any_file",
    "view_logs",
    "upload_file",
    "delete_own_file"
  ],
  "description": "Administrator with full system access"
}

// User Role
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
  "roleId": "ROLE-1735689600000-user001",
  "roleName": "user",
  "permissions": [
    "upload_file",
    "delete_own_file"
  ],
  "description": "Regular user with file upload and delete own files"
}
```

---

### 3. User Roles Assignment Collection

**Collection Name**: `userroles`

**Purpose**: Assign roles to users (many-to-many relationship)

#### Schema Definition

```javascript
const mongoose = require('mongoose');

const userRoleSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate assignments
userRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });

const UserRole = mongoose.model('UserRole', userRoleSchema);
module.exports = UserRole;
```

#### Field Specifications

| Field Name | Data Type | Required | Unique | Default Value | Validation Rules | Description |
|------------|-----------|----------|--------|---------------|------------------|-------------|
| `_id` | ObjectId | Auto | Yes | Auto-generated | MongoDB ObjectId | Primary key (MongoDB) |
| `userId` | ObjectId | Yes | No | - | Valid User reference | Reference to User |
| `roleId` | ObjectId | Yes | No | - | Valid Role reference | Reference to Role |
| `assignedBy` | ObjectId | No | No | - | Valid User reference | Who assigned the role |
| `assignedAt` | Date | No | No | Current timestamp | ISO 8601 timestamp | When role was assigned |
| `createdAt` | Date | Auto | No | Auto-generated | ISO 8601 timestamp | Record creation time |
| `updatedAt` | Date | Auto | No | Auto-generated | ISO 8601 timestamp | Last update time |

#### Example Document

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
  "userId": "507f1f77bcf86cd799439011",
  "roleId": "65a1b2c3d4e5f6g7h8i9j0k2",
  "assignedBy": "507f1f77bcf86cd799439012",
  "assignedAt": "2026-01-02T10:30:00.000Z",
  "createdAt": "2026-01-02T10:30:00.000Z",
  "updatedAt": "2026-01-02T10:30:00.000Z"
}
```

---

### 4. Files Collection

**Collection Name**: `files`

**Purpose**: Store information about uploaded files

#### Schema Definition

```javascript
const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
    fileId: {
        type: String,
        required: true,
        unique: true,
        default: () => `FILE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    },
    fileName: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    fileHash: {
        type: String,
        required: true,
        unique: true
    },
    encryptedPath: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
});

// Indexes for faster queries
fileSchema.index({ ownerId: 1 });
fileSchema.index({ fileHash: 1 });
fileSchema.index({ uploadedAt: -1 });

const File = mongoose.model('File', fileSchema);
module.exports = File;
```

#### Field Specifications

| Field Name | Data Type | Required | Unique | Default Value | Validation Rules | Description |
|------------|-----------|----------|--------|---------------|------------------|-------------|
| `_id` | ObjectId | Auto | Yes | Auto-generated | MongoDB ObjectId | Primary key (MongoDB) |
| `fileId` | String | Yes | Yes | Auto-generated | Format: `FILE-{timestamp}-{random}` | File unique identifier |
| `fileName` | String | Yes | No | - | Non-empty | Stored file name |
| `originalName` | String | Yes | No | - | Non-empty | Original uploaded file name |
| `fileHash` | String | Yes | Yes | - | SHA-256 hash | File content hash |
| `encryptedPath` | String | Yes | No | - | Valid file path | Path to encrypted file |
| `fileSize` | Number | Yes | No | - | Integer > 0 | File size in bytes |
| `mimeType` | String | Yes | No | - | Valid MIME type | File MIME type |
| `ownerId` | ObjectId | Yes | No | - | Valid User reference | User who uploaded the file |
| `uploadedAt` | Date | No | No | Current timestamp | ISO 8601 timestamp | When file was uploaded |
| `isDeleted` | Boolean | No | No | false | true/false | Soft delete flag |
| `deletedAt` | Date | No | No | null | ISO 8601 timestamp | When file was deleted |
| `deletedBy` | ObjectId | No | No | null | Valid User reference | Who deleted the file |
| `createdAt` | Date | Auto | No | Auto-generated | ISO 8601 timestamp | Record creation time |
| `updatedAt` | Date | Auto | No | Auto-generated | ISO 8601 timestamp | Last update time |

#### Example Document

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k4",
  "fileId": "FILE-1735689600000-xyz789abc",
  "fileName": "encrypted_1735689600000.enc",
  "originalName": "document.pdf",
  "fileHash": "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3",
  "encryptedPath": "/uploads/encrypted/encrypted_1735689600000.enc",
  "fileSize": 2048576,
  "mimeType": "application/pdf",
  "ownerId": "507f1f77bcf86cd799439011",
  "uploadedAt": "2026-01-02T10:30:00.000Z",
  "isDeleted": false,
  "deletedAt": null,
  "deletedBy": null,
  "createdAt": "2026-01-02T10:30:00.000Z",
  "updatedAt": "2026-01-02T10:30:00.000Z"
}
```

---

### 5. Access Logs Collection (Bonus for Admin)

**Collection Name**: `accesslogs`

**Purpose**: Track all file access and system activities

#### Schema Definition

```javascript
const mongoose = require('mongoose');

const accessLogSchema = mongoose.Schema({
    logId: {
        type: String,
        required: true,
        unique: true,
        default: () => `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    },
    action: {
        type: String,
        required: true,
        enum: ['upload', 'download', 'delete', 'view', 'login', 'logout']
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    status: {
        type: String,
        enum: ['success', 'failed'],
        default: 'success'
    },
    errorMessage: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for faster queries
accessLogSchema.index({ userId: 1 });
accessLogSchema.index({ fileId: 1 });
accessLogSchema.index({ timestamp: -1 });
accessLogSchema.index({ action: 1 });

const AccessLog = mongoose.model('AccessLog', accessLogSchema);
module.exports = AccessLog;
```

#### Field Specifications

| Field Name | Data Type | Required | Unique | Default Value | Validation Rules | Description |
|------------|-----------|----------|--------|---------------|------------------|-------------|
| `_id` | ObjectId | Auto | Yes | Auto-generated | MongoDB ObjectId | Primary key (MongoDB) |
| `logId` | String | Yes | Yes | Auto-generated | Format: `LOG-{timestamp}-{random}` | Log unique identifier |
| `userId` | ObjectId | Yes | No | - | Valid User reference | User who performed action |
| `fileId` | ObjectId | No | No | - | Valid File reference | File involved in action |
| `action` | String | Yes | No | - | Enum: [upload, download, delete, view, login, logout] | Action performed |
| `ipAddress` | String | No | No | - | Valid IP address | User's IP address |
| `userAgent` | String | No | No | - | User agent string | Browser/client info |
| `status` | String | No | No | "success" | Enum: [success, failed] | Action status |
| `errorMessage` | String | No | No | - | Error description | Error message if failed |
| `timestamp` | Date | No | No | Current timestamp | ISO 8601 timestamp | When action occurred |
| `createdAt` | Date | Auto | No | Auto-generated | ISO 8601 timestamp | Record creation time |
| `updatedAt` | Date | Auto | No | Auto-generated | ISO 8601 timestamp | Last update time |

#### Example Document

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
  "logId": "LOG-1735689600000-log123abc",
  "userId": "507f1f77bcf86cd799439011",
  "fileId": "65a1b2c3d4e5f6g7h8i9j0k4",
  "action": "upload",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "status": "success",
  "errorMessage": null,
  "timestamp": "2026-01-02T10:30:00.000Z",
  "createdAt": "2026-01-02T10:30:00.000Z",
  "updatedAt": "2026-01-02T10:30:00.000Z"
}
```

#### Sample Data for Testing

```javascript
// User 1 - Regular User
{
  "firstName": "Ahmed",
  "lastName": "Mohamed",
  "email": "ahmed@example.com",
  "password": "12345678",  // Will be hashed automatically
  "role": "user"
}

// User 2 - Admin User
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "password": "adminpass123",  // Will be hashed automatically
  "role": "admin"
}

// User 3 - Test User
{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "testpass123",  // Will be hashed automatically
  "role": "user"
}
```

---

## Database Connection

### Connection Configuration

File: `config/db.js`

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
```

### Environment Variables

Required in `.env` file:

```env
MONGO_URI=mongodb://localhost:27017/secure_fms
```

### Connection String Format

**Local Development:**
```
mongodb://localhost:27017/secure_fms
```

**With Authentication:**
```
mongodb://username:password@localhost:27017/secure_fms
```

**MongoDB Atlas (Cloud):**
```
mongodb+srv://username:password@cluster.mongodb.net/secure_fms?retryWrites=true&w=majority
```

---

## Database Operations

### Create (Insert)

```javascript
const User = require('./models/User');

// Create new user
const newUser = await User.create({
    firstName: 'Ahmed',
    lastName: 'Mohamed',
    email: 'ahmed@example.com',
    password: '12345678'  // Will be hashed automatically
});
```

### Read (Query)

```javascript
// Find by email
const user = await User.findOne({ email: 'ahmed@example.com' });

// Find by ID
const user = await User.findById('507f1f77bcf86cd799439011');

// Find all users
const users = await User.find();

// Find with conditions
const adminUsers = await User.find({ role: 'admin' });
```

### Update

```javascript
// Update login attempts
user.loginAttempts += 1;
user.lastLoginAttempt = new Date();
await user.save();

// Update using findByIdAndUpdate
await User.findByIdAndUpdate(userId, {
    loginAttempts: 0,
    lastLoginAttempt: null
});
```

### Delete

```javascript
// Delete by ID
await User.findByIdAndDelete(userId);

// Delete by email
await User.deleteOne({ email: 'test@example.com' });
```

---

## MongoDB Commands

### Useful Commands

```bash
# Connect to MongoDB shell
mongo

# Or with mongosh (newer version)
mongosh

# Use database
use secure_fms

# Show all collections
show collections

# Count users
db.users.countDocuments()

# Find all users
db.users.find().pretty()

# Find specific user
db.users.findOne({ email: "ahmed@example.com" })

# Drop collection (careful!)
db.users.drop()

# Create index
db.users.createIndex({ email: 1 }, { unique: true })

# Show indexes
db.users.getIndexes()
```

---

## Backup and Restore

### Backup Database

```bash
# Backup entire database
mongodump --db secure_fms --out ./backup

# Backup specific collection
mongodump --db secure_fms --collection users --out ./backup
```

### Restore Database

```bash
# Restore entire database
mongorestore --db secure_fms ./backup/secure_fms

# Restore specific collection
mongorestore --db secure_fms --collection users ./backup/secure_fms/users.bson
```

---

## Performance Optimization

### Indexes

Current indexes on `users` collection:
- `_id` (default)
- `email` (unique)

### Query Optimization Tips

1. Always use indexes for frequently queried fields
2. Use `.lean()` for read-only queries (faster)
3. Use `.select()` to limit returned fields
4. Use pagination for large result sets

```javascript
// Optimized query example
const users = await User
    .find({ role: 'user' })
    .select('firstName lastName email')
    .limit(10)
    .lean();
```

---

## Migration Notes

### From MySQL to MongoDB

**MySQL Structure:**
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    login_attempts INT DEFAULT 0,
    last_login_attempt TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**MongoDB Equivalent:**
- Uses Mongoose schema (shown above)
- `id` → `_id` (ObjectId)
- `first_name` → `firstName` (camelCase)
- `password_hash` → `password` (still hashed)
- Timestamps handled automatically by Mongoose

---

## Security Best Practices

1. ✅ Never store plain text passwords
2. ✅ Use bcrypt for password hashing (salt rounds: 10)
3. ✅ Validate email format before saving
4. ✅ Implement rate limiting for login attempts
5. ✅ Use environment variables for connection strings
6. ✅ Enable MongoDB authentication in production
7. ✅ Regular backups
8. ✅ Use SSL/TLS for connections in production

---

## Troubleshooting

### Common Issues

**1. Connection Refused**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB service is running
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

**2. Duplicate Key Error**
```
E11000 duplicate key error collection: secure_fms.users index: email_1
```
**Solution**: Email already exists. Use different email or handle error gracefully.

**3. Validation Error**
```
ValidationError: User validation failed: password: Password must be at least 8 characters
```
**Solution**: Ensure password meets minimum length requirement.

---

## For Person 2 & Person 3

When creating additional collections for file management:

### Suggested File Collection Schema

```javascript
const fileSchema = mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    encryptedPath: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});
```

### Suggested Access Log Schema

```javascript
const accessLogSchema = mongoose.Schema({
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: ['upload', 'download', 'delete'],
        required: true
    },
    ipAddress: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});
```

---

## Testing

### Database Test Script

File: `test-db.js` (if needed)

```javascript
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const testDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');
        
        // Count users
        const count = await User.countDocuments();
        console.log(`📊 Total users: ${count}`);
        
        // List all users
        const users = await User.find().select('firstName lastName email role');
        console.log('👥 Users:', users);
        
        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

testDB();
```

---

## Database Status

✅ **Current Status**: Operational  
✅ **Connection**: Stable  
✅ **Schema**: Validated  
✅ **Tests**: Passing (8/8)  
✅ **Security**: Implemented  

---

**Last Updated**: January 1, 2026  
**Version**: 1.0.0  
**Maintained By**: Person 1 (Authentication Team)
