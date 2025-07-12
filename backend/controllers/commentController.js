const Comment = require('../models/Comment');
const Answer = require('../models/Answer');
const { validationResult } = require('express-validator');

// @desc    Get comments for an answer
// @route   GET /api/answers/:answerId/comments
// @access  Public
exports.getComments = async (req, res, next) => {
    try {
        const { answerId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get top-level comments (not replies)
        const comments = await Comment.find({ 
            answer: answerId, 
            parentComment: null,
            isDeleted: false 
        })
        .populate('author', 'username')
        .populate({
            path: 'replies',
            populate: {
                path: 'author',
                select: 'username'
            },
            options: {
                sort: { createdAt: 1 }
            }
        })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit);

        const total = await Comment.countDocuments({ 
            answer: answerId, 
            parentComment: null,
            isDeleted: false 
        });

        res.json({
            success: true,
            data: comments,
            pagination: {
                page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a comment
// @route   POST /api/answers/:answerId/comments
// @access  Private
exports.createComment = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { answerId } = req.params;
        const { content, parentCommentId } = req.body;

        // Check if answer exists
        const answer = await Answer.findById(answerId);
        if (!answer) {
            return res.status(404).json({
                success: false,
                message: 'Answer not found'
            });
        }

        // If this is a reply, check if parent comment exists
        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) {
                return res.status(404).json({
                    success: false,
                    message: 'Parent comment not found'
                });
            }
        }

        const comment = await Comment.create({
            content,
            author: req.user.id,
            answer: answerId,
            parentComment: parentCommentId || null
        });

        // If this is a reply, add it to parent's replies array
        if (parentCommentId) {
            await Comment.findByIdAndUpdate(
                parentCommentId,
                { $push: { replies: comment._id } }
            );
        }

        await comment.populate('author', 'username');

        res.status(201).json({
            success: true,
            data: comment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check if user is comment author
        if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this comment'
            });
        }

        comment.content = req.body.content || comment.content;
        await comment.save();

        await comment.populate('author', 'username');

        res.json({
            success: true,
            data: comment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check if user is comment author or admin
        if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }

        // Soft delete - mark as deleted but keep for replies
        comment.isDeleted = true;
        comment.deletedAt = new Date();
        comment.content = '[deleted]';
        await comment.save();

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Vote on a comment
// @route   POST /api/comments/:id/vote
// @access  Private
exports.voteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        const { value } = req.body;

        if (![1, -1].includes(value)) {
            return res.status(400).json({
                success: false,
                message: 'Vote value must be 1 or -1'
            });
        }

        // Check if user has already voted
        const existingVote = comment.votes.find(
            vote => vote.user.toString() === req.user.id
        );

        if (existingVote) {
            // Remove vote if clicking same value
            if (existingVote.value === value) {
                comment.votes = comment.votes.filter(
                    vote => vote.user.toString() !== req.user.id
                );
            } else {
                // Update vote value
                existingVote.value = value;
            }
        } else {
            // Add new vote
            comment.votes.push({
                user: req.user.id,
                value
            });
        }

        await comment.save();

        res.json({
            success: true,
            data: {
                voteCount: comment.voteCount,
                userVote: comment.votes.find(v => v.user.toString() === req.user.id)?.value || null
            }
        });
    } catch (error) {
        next(error);
    }
};
