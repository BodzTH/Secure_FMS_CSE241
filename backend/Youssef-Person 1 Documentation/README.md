# 🔐 Security Information System - Person 1 Documentation

## 📋 Overview
This project is a Security Information System consisting of 3 main parts:
- **Person 1**: User Management & Authentication ✅ (Completed)
- **Person 2**: File Upload & Encryption
- **Person 3**: File Download & Access Control

---

## ✅ Completed Tasks (Person 1)

### 1. User Management & Authentication System

#### Implemented Features:
- ✅ Designed `users` table in database
- ✅ User registration `POST /api/auth/register`
- ✅ User login `POST /api/auth/login`
- ✅ Password encryption using **bcrypt**
- ✅ **JWT tokens** generation for session management
- ✅ **Middleware** for token verification
- ✅ Login attempt limit (5 attempts / 15 minutes)
- ✅ Input validation

---

## 🗂️ Project Structure

```
security-information-system/
├── config/
│   └── db.js                      # Database connection configuration
├── controllers/
│   └── authController.js          # Registration and login logic
├── routes/
│   └── authRoutes.js              # Authentication API routes
├── middleware/
│   └── authMiddleware.js          # JWT Token verification
├── app.js                         # Main server file
├── .env                           # Environment variables
├── package.json                   # Project dependencies
├── test-db.js                     # Database test script
└── README.md                      # This file
```

---

## 🚀 Installation & Setup

### Prerequisites:
- Node.js v14+
- MySQL Server
- VS Code (optional)

### 1️⃣ Install Dependencies:
```bash
npm install express mysql2 bcrypt jsonwebtoken dotenv
```

### 2️⃣ Setup Database:

**In MySQL Workbench or MySQL CLI, execute:**

```sql
CREATE DATABASE security_project;
USE security_project;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    login_attempts INT DEFAULT 0,
    last_login_attempt TIMESTAMP NULL
);
```

### 3️⃣ Configure Environment Variables:

**The `.env` file should contain:**
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=security_project
JWT_SECRET=your_jwt_secret_key_here
```

⚠️ **Important:** Change `DB_PASSWORD` and `JWT_SECRET` according to your setup!

### 4️⃣ Run the Server:
```bash
node app.js
```

**Expected output:**
```
MySQL Connected
Database 'security_project' ready
Table 'users' ready
Server running on port 3000
```

---

## 📡 API Endpoints

### 1. Register New User

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "123456"
}
```

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "userId": 1
}
```

**Error Response (409):**
```json
{
  "error": "Username or email already exists"
}
```

---

### 2. User Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john",
    "email": "john@example.com"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

**Error Response (429 - Too Many Attempts):**
```json
{
  "error": "Too many login attempts. Try again later."
}
```

---

## 🔒 Using Authentication Middleware

### For Person 2 & Person 3:

To protect any route, use the middleware:

```javascript
const authMiddleware = require('./middleware/authMiddleware');

// Example: Protecting file upload route
router.post('/upload', authMiddleware, (req, res) => {
    // After token verification, user info is available in req.user
    const userId = req.user.userId;
    const userEmail = req.user.email;
    const username = req.user.username;
    
    // File upload code here...
    res.json({ message: 'File uploaded successfully' });
});
```

### How to Send Token in Requests:

**In Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example in Thunder Client/Postman:**
- Header Name: `Authorization`
- Header Value: `Bearer YOUR_TOKEN_HERE`

---

## 🧪 Testing

### 1️⃣ Test Database Connection:
```bash
node test-db.js
```

**Expected output:**
```
✅ Connected to MySQL
📊 Current database: security_project
👥 Total users: 3
📋 Latest users:
   ID: 1, Username: john, Email: john@example.com
```

### 2️⃣ Test APIs using Thunder Client:

1. Open Thunder Client in VS Code
2. Create new request:
   - **Register:** `POST http://localhost:3000/api/auth/register`
   - **Login:** `POST http://localhost:3000/api/auth/login`
3. Select Body → JSON and paste the data

---

## 🔐 Security Implementation

### 1. Password Encryption (bcrypt):
- **Salt rounds:** 10
- Passwords are **never stored** in plain text
- Uses `bcrypt.compare()` for verification

### 2. JWT Tokens:
- **Expiration:** 24 hours
- Contains: `userId`, `email`, `username`
- Verified on every protected request

### 3. Brute Force Protection:
- Maximum **5 failed** login attempts
- **Lockout period:** 15 minutes
- Attempts tracked in database

### 4. Input Validation:
- Validates all required fields
- Password length check (minimum 6 characters)
- SQL Injection prevention using Parameterized Queries

---

## 📊 Database Schema

### `users` Table:

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT | Primary key (Auto Increment) |
| `username` | VARCHAR(50) | Username (Unique) |
| `email` | VARCHAR(100) | Email address (Unique) |
| `password_hash` | VARCHAR(255) | Encrypted password |
| `created_at` | TIMESTAMP | Registration date |
| `login_attempts` | INT | Failed login attempts count |
| `last_login_attempt` | TIMESTAMP | Last login attempt time |

---

## 🔄 For Person 2 (File Upload & Storage)

### Your Tasks:

1. **Use the middleware** for user verification:
   ```javascript
   const authMiddleware = require('./middleware/authMiddleware');
   router.post('/upload', authMiddleware, uploadController);
   ```

2. **Access user information:**
   ```javascript
   const userId = req.user.userId; // Use as owner_id for files
   ```

3. **Encrypt files** using AES-256

4. **Create files table:**
   ```sql
   CREATE TABLE files (
       file_id INT AUTO_INCREMENT PRIMARY KEY,
       owner_id INT NOT NULL,
       filename VARCHAR(255) NOT NULL,
       encrypted_path VARCHAR(500) NOT NULL,
       file_hash VARCHAR(64) NOT NULL,
       uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (owner_id) REFERENCES users(id)
   );
   ```

---

## 🔄 For Person 3 (File Download & Access Control)

### Your Tasks:

1. **Use the same middleware** for verification
2. **Check file ownership:**
   ```javascript
   if (file.owner_id !== req.user.userId) {
       return res.status(403).json({ error: 'Access denied' });
   }
   ```
3. **Verify file integrity** (Hash comparison)
4. **Decrypt and send the file**

---

## 🐛 Troubleshooting

### 1. "Unknown database" error:
```bash
# Make sure to create the database first
CREATE DATABASE security_project;
```

### 2. "ER_ACCESS_DENIED" error:
```bash
# Check username and password in .env
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD
```

### 3. "Cannot find module" error:
```bash
npm install
```

### 4. Server not responding:
```bash
# Make sure server is running
node app.js

# Check if Port 3000 is not in use
netstat -ano | findstr :3000
```

---

## 📝 Important Notes

1. ⚠️ **Do not commit `.env` file** to Git
2. ⚠️ Change `JWT_SECRET` in production
3. ✅ Middleware is ready for use by other team members
4. ✅ All passwords are encrypted in database
5. ✅ Brute Force protection is enabled

---

## 📞 Support

If you encounter any issues:
1. Verify server is running: `node app.js`
2. Run test script: `node test-db.js`
3. Check MySQL Workbench for data

---

## ✅ Delivery Checklist

- [x] Database setup and ready
- [x] `users` table created with all fields
- [x] Registration API working
- [x] Login API working
- [x] Password encryption active
- [x] JWT tokens generated successfully
- [x] Middleware ready for use
- [x] Login attempt limit enabled
- [x] Complete documentation

---

## 🎓 Technical Information for Presentation

### Technologies Used:
- **Node.js + Express**: Backend framework
- **MySQL**: Database
- **bcrypt**: Password encryption (one-way hashing)
- **JWT**: Stateless session management
- **dotenv**: Environment variables management

### Security Principles Applied:
1. **Password Hashing**: Never store plain passwords
2. **JWT Authentication**: Secure tokens with expiration
3. **Rate Limiting**: Brute Force attack protection
4. **Input Validation**: SQL Injection prevention
5. **Parameterized Queries**: Database security

---

**🎉 Person 1 Tasks - Successfully Completed!**

Created by: Development Team  
Date: December 31, 2025
