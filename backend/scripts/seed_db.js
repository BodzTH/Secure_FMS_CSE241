const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: '../.env' }); // Adjust path if running from scripts folder

const Role = require('../models/Role');
const User = require('../models/User');

const seedDB = async () => {
    try {
        console.log('🌱 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/secure_fms');
        console.log('✅ Connected.');

        // 1. Create Roles
        const roleData = [
            { role_name: 'superadmin', description: 'System Owner - Can manage users' },
            { role_name: 'admin', description: 'Administrator - Can view all files' },
            { role_name: 'user', description: 'Standard User - Can view own files' }
        ];

        console.log('🔄 Seeding Roles...');
        for (const r of roleData) {
            const existing = await Role.findOne({ role_name: r.role_name });
            if (!existing) {
                await Role.create(r);
                console.log(`   ✅ Created role: ${r.role_name}`);
            } else {
                console.log(`   ℹ️ Role exists: ${r.role_name}`);
            }
        }

        // 2. Create Default Superadmin
        // 2. Create/Reset Default Superadmin
        const superRole = await Role.findOne({ role_name: 'superadmin' });
        
        // Remove existing to ensure clean state (fixes double-hashing issue)
        await User.deleteOne({ username: 'superadmin' });

        console.log('🔄 Creating Default Superadmin...');
        // Pass PLAIN TEXT password. The User model's pre-save hook will hash it.
        await User.create({
            username: 'superadmin',
            email: 'superadmin@admin.com', // LOGIN EMAIL
            password: 'admin123', 
            role: superRole._id,
            is_active: true
        });
        console.log('   ✅ Created User: "superadmin" (Password: "admin123")');

        console.log('✨ Database seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
