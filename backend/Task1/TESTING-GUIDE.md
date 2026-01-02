# RBAC Authentication & File Management API - Testing Guide

## 🚀 Quick Start

### Step 1: Seed Roles (Run Once)
```bash
node scripts/seedRoles.js
```

This creates two roles:
- **admin**: Full permissions (upload_file, delete_own_file, delete_any_file, view_users, view_all_files, view_logs)
- **user**: Limited permissions (upload_file, delete_own_file)

### Step 2: Start Server
```bash
node app.js
```

Server runs on: http://localhost:3000

---

## 📝 API Testing

### 1️⃣ Register User

**Endpoint:** `POST http://localhost:3000/api/auth/register`

**Body:**
```json
{
  "firstName": "Ahmed",
  "lastName": "Ali",
  "email": "ahmed@test.com",
  "password": "password123"
}
```

**Expected Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f1234567890abcdef12345",
    "firstName": "Ahmed",
    "lastName": "Ali",
    "email": "ahmed@test.com",
    "role": "user"
  }
}
```

**Copy the token** - you'll need it for authenticated requests.

---

### 2️⃣ Login

**Endpoint:** `POST http://localhost:3000/api/auth/login`

**Body:**
```json
{
  "email": "ahmed@test.com",
  "password": "password123"
}
```

**Expected Response:** `200 OK`
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f1234567890abcdef12345",
    "firstName": "Ahmed",
    "lastName": "Ali",
    "email": "ahmed@test.com",
    "role": "user",
    "permissions": ["upload_file", "delete_own_file"]
  }
}
```

---

### 3️⃣ Upload File (User or Admin)

**Endpoint:** `POST http://localhost:3000/api/files/upload`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "fileName": "document.pdf",
  "fileHash": "a1b2c3d4e5f6789012345678901234567890abcd"
}
```

**Expected Response:** `201 Created`
```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": "65f9876543210fedcba98765",
    "fileName": "document.pdf",
    "fileHash": "a1b2c3d4e5f6789012345678901234567890abcd",
    "ownerId": "65f1234567890abcdef12345",
    "createdAt": "2025-01-02T10:30:00.000Z"
  }
}
```

**Permission Required:** `upload_file`

---

### 4️⃣ Get My Files

**Endpoint:** `GET http://localhost:3000/api/files/my-files`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:** `200 OK`
```json
{
  "count": 2,
  "files": [
    {
      "_id": "65f9876543210fedcba98765",
      "fileName": "document.pdf",
      "fileHash": "a1b2c3d4e5f6789012345678901234567890abcd",
      "ownerId": "65f1234567890abcdef12345",
      "createdAt": "2025-01-02T10:30:00.000Z"
    }
  ]
}
```

---

### 5️⃣ Delete Own File (User or Admin)

**Endpoint:** `DELETE http://localhost:3000/api/files/:id`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Example:** `DELETE http://localhost:3000/api/files/65f9876543210fedcba98765`

**Expected Response:** `200 OK`
```json
{
  "message": "File deleted successfully"
}
```

**Permission Required:** `delete_own_file`

**Note:** Users can ONLY delete their own files. Admins can use admin endpoint to delete any file.

---

## 🔐 Admin Endpoints (Admin Only)

### 6️⃣ View All Users

**Endpoint:** `GET http://localhost:3000/api/admin/users`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Expected Response:** `200 OK`
```json
{
  "count": 3,
  "users": [
    {
      "id": "65f1234567890abcdef12345",
      "firstName": "Ahmed",
      "lastName": "Ali",
      "email": "ahmed@test.com",
      "role": "user",
      "createdAt": "2025-01-02T10:00:00.000Z"
    }
  ]
}
```

**Permission Required:** `view_users`

---

### 7️⃣ View All Files (Admin)

**Endpoint:** `GET http://localhost:3000/api/admin/files`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Expected Response:** `200 OK`
```json
{
  "count": 5,
  "files": [
    {
      "_id": "65f9876543210fedcba98765",
      "fileName": "document.pdf",
      "fileHash": "a1b2c3d4e5f6789012345678901234567890abcd",
      "ownerId": {
        "_id": "65f1234567890abcdef12345",
        "firstName": "Ahmed",
        "lastName": "Ali",
        "email": "ahmed@test.com"
      },
      "createdAt": "2025-01-02T10:30:00.000Z"
    }
  ]
}
```

**Permission Required:** `view_all_files`

---

### 8️⃣ Delete Any File (Admin)

**Endpoint:** `DELETE http://localhost:3000/api/admin/files/:id`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Example:** `DELETE http://localhost:3000/api/admin/files/65f9876543210fedcba98765`

**Expected Response:** `200 OK`
```json
{
  "message": "File deleted successfully by admin",
  "deletedFile": {
    "id": "65f9876543210fedcba98765",
    "fileName": "document.pdf",
    "ownerId": "65f1234567890abcdef12345"
  }
}
```

**Permission Required:** `delete_any_file`

---

## 🧪 Testing with PowerShell

### Register User
```powershell
$body = @{
    firstName = "Ahmed"
    lastName = "Ali"
    email = "ahmed@test.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### Login and Save Token
```powershell
$body = @{
    email = "ahmed@test.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$token = $response.token
Write-Host "Token: $token"
```

### Upload File
```powershell
$body = @{
    fileName = "document.pdf"
    fileHash = "a1b2c3d4e5f6789012345678901234567890abcd"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/files/upload" `
    -Method POST `
    -Body $body `
    -Headers $headers
```

### Get My Files
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/files/my-files" `
    -Method GET `
    -Headers $headers
```

---

## 🧪 Testing with curl

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"Ahmed\",\"lastName\":\"Ali\",\"email\":\"ahmed@test.com\",\"password\":\"password123\"}"
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"ahmed@test.com\",\"password\":\"password123\"}"
```

### Upload File (Replace TOKEN)
```bash
curl -X POST http://localhost:3000/api/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"fileName\":\"document.pdf\",\"fileHash\":\"a1b2c3d4e5f6789012345678901234567890abcd\"}"
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "error": "All fields are required",
  "required": ["firstName", "lastName", "email", "password"]
}
```

### 401 Unauthorized
```json
{
  "error": "Not authorized, no token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied",
  "message": "You do not have permission: view_all_files",
  "yourPermissions": ["upload_file", "delete_own_file"]
}
```

### 409 Conflict
```json
{
  "error": "Email already registered"
}
```

---

## 🎯 Permission Matrix

| Action | User | Admin |
|--------|------|-------|
| Register/Login | ✅ | ✅ |
| Upload File | ✅ | ✅ |
| View Own Files | ✅ | ✅ |
| Delete Own File | ✅ | ✅ |
| View All Users | ❌ | ✅ |
| View All Files | ❌ | ✅ |
| Delete Any File | ❌ | ✅ |
| View Logs | ❌ | ✅ |

---

## 🔧 How to Create Admin User

**Option 1: Manually assign admin role (MongoDB)**
```javascript
// Connect to MongoDB and run:
const UserRole = require('./models/UserRole');
const Role = require('./models/Role');
const User = require('./models/User');

// Find user and admin role
const user = await User.findOne({ email: 'admin@test.com' });
const adminRole = await Role.findOne({ name: 'admin' });

// Delete old user role assignment
await UserRole.deleteOne({ userId: user._id });

// Assign admin role
await UserRole.create({
  userId: user._id,
  roleId: adminRole._id
});
```

**Option 2: Create admin seeding script**
```bash
# scripts/createAdmin.js
```

---

## ✅ Test Checklist

- [ ] Seed roles: `node scripts/seedRoles.js`
- [ ] Register user successfully
- [ ] Login and receive JWT token
- [ ] Upload file with valid token
- [ ] View own files
- [ ] Delete own file
- [ ] Try accessing admin endpoint as user (should fail with 403)
- [ ] Create admin user
- [ ] Login as admin
- [ ] View all users as admin
- [ ] View all files as admin
- [ ] Delete any file as admin

---

## 📌 Important Notes

1. **First Time Setup:** ALWAYS run `node scripts/seedRoles.js` before registering users
2. **Authorization Header:** Format is `Bearer <token>` (note the space)
3. **Token Expiration:** Tokens expire after 24 hours
4. **Password Requirement:** Minimum 8 characters
5. **File Hash:** Must be unique (duplicate hashes return 409 error)
6. **Default Role:** All registered users get "user" role by default

---

## 🔐 Security Features

✅ Password hashing (bcrypt with 10 salt rounds)
✅ JWT authentication with 24-hour expiration
✅ Role-based access control (RBAC)
✅ Permission-based authorization
✅ Protected routes
✅ Input validation
✅ MongoDB injection protection
✅ Unique constraints (email, fileHash)

---

## 📚 Tech Stack

- **Backend:** Node.js + Express 5.2.1
- **Database:** MongoDB + Mongoose 9.1.1
- **Authentication:** JWT (jsonwebtoken 9.0.3)
- **Password Security:** bcrypt 6.0.0
- **Environment:** dotenv 17.2.3

---

Happy Testing! 🚀
