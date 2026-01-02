const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Owner ID is required']
    },
    fileName: {
        type: String,
        required: [true, 'File name is required'],
        trim: true
    },
    fileHash: {
        type: String,
        required: [true, 'File hash is required'],
        unique: true
    }
}, {
    timestamps: true
});

// Index for faster queries by owner
fileSchema.index({ ownerId: 1 });

const File = mongoose.model('File', fileSchema);

module.exports = File;
