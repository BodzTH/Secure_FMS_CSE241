require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ 
    message: "Security Information System API - RBAC Enabled",
    version: "2.0.0",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login"
      },
      files: {
        upload: "POST /api/files/upload (requires: upload_file)",
        myFiles: "GET /api/files/my-files",
        deleteOwn: "DELETE /api/files/:id (requires: delete_own_file)"
      },
      admin: {
        users: "GET /api/admin/users (requires: view_users)",
        allFiles: "GET /api/admin/files (requires: view_all_files)",
        deleteAny: "DELETE /api/admin/files/:id (requires: delete_any_file)"
      }
    },
    setup: {
      step1: "Run: node scripts/seedRoles.js",
      step2: "Register a user via POST /api/auth/register",
      step3: "Use the JWT token in Authorization header: Bearer <token>"
    }
  });
});

// Auth routes
app.use("/api/auth", authRoutes);

// File routes
app.use("/api/files", fileRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 API Documentation: http://localhost:${PORT}`);
  console.log(`⚠️  Remember to run: node scripts/seedRoles.js (first time only)`);
});
