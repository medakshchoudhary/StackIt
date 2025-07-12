const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [10, 'Title must be at least 10 characters long'],
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [20, 'Description must be at least 20 characters long']
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
        required: true
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Answer'
    }],
    acceptedAnswer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Answer',
        default: null
    },
    views: {
        type: Number,
        default: 0
    },
    viewedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        viewedAt: {
            type: Date,
            default: Date.now
        }
    }],
    voteCount: {
        type: Number,
        default: 0
    },
    votes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        vote: {
            type: String,
            enum: ['up', 'down'],
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Add text index for search functionality
questionSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Question', questionSchema);