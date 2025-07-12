const Answer = require('../models/Answer');
const Question = require('../models/Question');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { notifyUser } = require('../utils/notifyUser');

// @desc    Create answer
// @route   POST /api/questions/:questionId/answers
// @access  Private
exports.createAnswer = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const question = await Question.findById(req.params.questionId);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        const answer = await Answer.create({
            content: req.body.content,
            author: req.user.id,
            question: req.params.questionId
        });

        // Add answer to question's answers array
        question.answers.push(answer._id);
        await question.save();

        // Notify question author
        await notifyUser({
            recipient: question.author,
            type: 'answer',
            question: question._id,
            answer: answer._id,
            actor: req.user.id,
            message: `${req.user.username} answered your question`
        });

        res.status(201).json({
            success: true,
            data: answer
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update answer
// @route   PUT /api/answers/:id
// @access  Private
exports.updateAnswer = async (req, res, next) => {
    try {
        let answer = await Answer.findById(req.params.id);

        if (!answer) {
            return res.status(404).json({
                success: false,
                message: 'Answer not found'
            });
        }

        // Make sure user is answer owner
        if (answer.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this answer'
            });
        }

        answer = await Answer.findByIdAndUpdate(
            req.params.id,
            { content: req.body.content },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: answer
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete answer
// @route   DELETE /api/answers/:id
// @access  Private
exports.deleteAnswer = async (req, res, next) => {
    try {
        const answer = await Answer.findById(req.params.id);

        if (!answer) {
            return res.status(404).json({
                success: false,
                message: 'Answer not found'
            });
        }

        // Make sure user is answer owner or admin
        if (answer.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this answer'
            });
        }

        await answer.remove();

        // Remove answer from question's answers array
        const question = await Question.findById(answer.question);
        question.answers = question.answers.filter(
            (answerId) => answerId.toString() !== req.params.id
        );
        await question.save();

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Vote on answer
// @route   POST /api/answers/:id/vote
// @access  Private
exports.voteAnswer = async (req, res, next) => {
    try {
        const { value } = req.body; // 'up' or 'down'
        const answerId = req.params.id;
        const userId = req.user.id;

        if (!['up', 'down'].includes(value)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid vote type. Must be "up" or "down"'
            });
        }

        const answer = await Answer.findById(answerId);
        if (!answer) {
            return res.status(404).json({
                success: false,
                message: 'Answer not found'
            });
        }

        // Check if user has already voted
        const existingVoteIndex = answer.votes.findIndex(
            v => v.user.toString() === userId
        );

        let userVote = null;

        if (existingVoteIndex !== -1) {
            const existingVote = answer.votes[existingVoteIndex];
            
            // If same vote, remove it (toggle)
            if (existingVote.vote === value) {
                answer.votes.splice(existingVoteIndex, 1);
                userVote = null;
            } else {
                // If different vote, replace it
                answer.votes[existingVoteIndex].vote = value;
                userVote = value;
            }
        } else {
            // Add new vote
            answer.votes.push({
                user: userId,
                vote: value
            });
            userVote = value;
        }

        await answer.save();

        res.json({
            success: true,
            data: {
                voteCount: answer.voteCount,
                userVote: userVote,
                message: 'Vote recorded successfully'
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Accept answer
// @route   POST /api/answers/:id/accept
// @access  Private
exports.acceptAnswer = async (req, res, next) => {
    try {
        const answerId = req.params.id;
        const userId = req.user.id;

        const answer = await Answer.findById(answerId).populate('question');
        if (!answer) {
            return res.status(404).json({
                success: false,
                message: 'Answer not found'
            });
        }

        // Only question author can accept answers
        if (answer.question.author.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Only question author can accept answers'
            });
        }

        // Unaccept all other answers for this question
        await Answer.updateMany(
            { question: answer.question._id },
            { isAccepted: false }
        );

        // Accept this answer
        answer.isAccepted = true;
        await answer.save();

        // Update question's accepted answer
        answer.question.acceptedAnswer = answerId;
        await answer.question.save();

        // Notify answer author
        await notifyUser({
            recipient: answer.author,
            type: 'accept',
            question: answer.question._id,
            answer: answer._id,
            actor: userId,
            message: `Your answer was accepted`
        });

        res.json({
            success: true,
            data: {
                message: 'Answer accepted successfully'
            }
        });
    } catch (error) {
        next(error);
    }
};