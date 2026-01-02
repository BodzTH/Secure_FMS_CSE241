const mongoose = require('mongoose');

const roleSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Role name is required'],
        enum: {
            values: ['admin', 'user'],
            message: 'Role must be either admin or user'
        },
        unique: true
    },
    permissions: {
        type: [String],
        default: [],
        validate: {
            validator: function(permissions) {
                const validPermissions = [
                    'upload_file',
                    'delete_own_file',
                    'delete_any_file',
                    'view_users',
                    'view_all_files',
                    'view_logs'
                ];
                return permissions.every(p => validPermissions.includes(p));
            },
            message: 'Invalid permission detected'
        }
    }
}, {
    timestamps: true
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
