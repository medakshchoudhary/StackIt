const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Answer content is required'],
        trim: true,
        minlength: [20, 'Answer must be at least 20 characters long']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
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
    }],
    isAccepted: {
        type: Boolean,
        default: false
    },
    voteCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Update vote count when votes array is modified
answerSchema.pre('save', function(next) {
    if (this.isModified('votes')) {
        this.voteCount = this.votes.reduce((acc, vote) => {
            return acc + (vote.vote === 'up' ? 1 : -1);
        }, 0);
    }
    next();
});

module.exports = mongoose.model('Answer', answerSchema);