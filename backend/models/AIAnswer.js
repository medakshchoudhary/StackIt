const mongoose = require('mongoose');

const aiAnswerSchema = new mongoose.Schema({
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    confidence: {
        type: Number,
        default: 0.7,
        min: 0,
        max: 1
    },
    isHelpful: {
        type: Number,
        default: 0 // Track user feedback: positive votes minus negative votes
    },
    helpfulVotes: {
        type: Number,
        default: 0
    },
    unhelpfulVotes: {
        type: Number,
        default: 0
    },
    votes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        vote: {
            type: String,
            enum: ['helpful', 'unhelpful']
        }
    }],
    generatedAt: {
        type: Date,
        default: Date.now
    },
    version: {
        type: String,
        default: '1.0'
    }
}, {
    timestamps: true
});

// Index for faster queries
aiAnswerSchema.index({ question: 1 });
aiAnswerSchema.index({ generatedAt: -1 });

module.exports = mongoose.model('AIAnswer', aiAnswerSchema);
