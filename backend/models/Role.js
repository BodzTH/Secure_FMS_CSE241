const mongoose = require('mongoose');

const roleSchema = mongoose.Schema({
    role_name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
