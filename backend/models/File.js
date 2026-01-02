const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
    original_name: {
        type: String,
        required: true
    },
    stored_name: {
        type: String,
        required: true
    },
    file_hash: {
        type: String,
        required: false // Hashing disabled per user request
    },
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mimeType: {
        type: String
    },
    size: {
        type: Number
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Enforce Referential Integrity: Check if owner exists before saving
fileSchema.pre('save', async function(next) {
    if (this.isModified('owner_id')) {
        const User = mongoose.model('User');
        const owner = await User.findById(this.owner_id);
        if (!owner) {
            return next(new Error('Referential Integrity Error: Associated User (owner) does not exist.'));
        }
    }
    next();
});

// Enforce Security Rule: Admin can access all files, User can access only owned files
fileSchema.statics.findAccessibleByUser = async function(user) {
    // Ensure role is populated on the user object
    if (!user.role || typeof user.role === 'string') {
         // Best effort: if role isn't populated/loaded, default to strict ownership
         return this.find({ owner_id: user._id });
    }

    // Single Role Check
    const isSuperUser = user.role.role_name === 'admin' || user.role.role_name === 'superadmin';

    if (isSuperUser) {
        return this.find({}); // Admin/Superadmin sees all
    } else {
        return this.find({ owner_id: user._id }); // User sees owned
    }
};

const File = mongoose.model('File', fileSchema);

module.exports = File;
