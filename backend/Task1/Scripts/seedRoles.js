require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../models/Role');

const seedRoles = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if roles already exist
        const existingRoles = await Role.find();
        if (existingRoles.length > 0) {
            console.log('⚠️  Roles already exist. Skipping seeding.');
            console.log(`Found ${existingRoles.length} roles:`);
            existingRoles.forEach(role => {
                console.log(`  - ${role.name}: [${role.permissions.join(', ')}]`);
            });
            process.exit(0);
        }

        // Define roles with permissions
        const roles = [
            {
                name: 'admin',
                permissions: [
                    'upload_file',
                    'delete_own_file',
                    'delete_any_file',
                    'view_users',
                    'view_all_files',
                    'view_logs'
                ]
            },
            {
                name: 'user',
                permissions: [
                    'upload_file',
                    'delete_own_file'
                ]
            }
        ];

        // Insert roles
        const createdRoles = await Role.insertMany(roles);
        
        console.log('✅ Roles seeded successfully!');
        console.log('\n📋 Created Roles:');
        createdRoles.forEach(role => {
            console.log(`\n🔹 ${role.name.toUpperCase()}`);
            console.log(`   ID: ${role._id}`);
            console.log(`   Permissions:`);
            role.permissions.forEach(perm => {
                console.log(`     - ${perm}`);
            });
        });

        console.log('\n✅ Database is ready! You can now register users.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding roles:', error);
        process.exit(1);
    }
};

// Run seeder
seedRoles();
