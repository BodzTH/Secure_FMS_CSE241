const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// --- YOUR TASK: PASSWORD HASHING MIDDLEWARE ---
// This runs automatically before saving to MongoDB
userSchema.pre('save', async function (next) {
    // 1. Validate Role Integrity
    if (this.isModified('role')) {
        const Role = mongoose.model('Role');
        const roleExists = await Role.findById(this.role);
        if (!roleExists) {
            return next(new Error('Referential Integrity Error: Assigned Role does not exist.'));
        }
    }

    // 2. Hash Password
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Helper method to compare passwords (for the Login dev to use)
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Helper method to check if user has a specific role
// Requires role to be populated: await user.populate('role')
userSchema.methods.hasRole = function (roleName) {
    return this.role && this.role.role_name === roleName;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
