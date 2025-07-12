const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Answer',
        required: true
    },
    value: {
        type: Number,
        enum: [-1, 1],
        required: true
    }
}, {
    timestamps: true
});

// Ensure one vote per user per answer
voteSchema.index({ user: 1, answer: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);