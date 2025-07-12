const Question = require('../models/Question');
const { validationResult } = require('express-validator');

// @desc    Get all questions
// @route   GET /api/questions
// @access  Public
exports.getQuestions = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Question.countDocuments();

        const questions = await Question.find()
            .populate('author', 'username')
            .sort('-createdAt')
            .skip(startIndex)
            .limit(limit);

        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.json({
            success: true,
            count: questions.length,
            pagination,
            data: questions
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Public
exports.getQuestion = async (req, res, next) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate('author', 'username')
            .populate({
                path: 'answers',
                populate: {
                    path: 'author',
                    select: 'username'
                }
            });

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Increment views
        question.views += 1;
        await question.save();

        res.json({
            success: true,
            data: question
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create question
// @route   POST /api/questions
// @access  Private
exports.createQuestion = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, tags } = req.body;

        const question = await Question.create({
            title,
            description,
            tags,
            author: req.user.id
        });

        res.status(201).json({
            success: true,
            data: question
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private
exports.updateQuestion = async (req, res, next) => {
    try {
        let question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Make sure user is question owner
        if (question.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this question'
            });
        }

        question = await Question.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({
            success: true,
            data: question
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private
exports.deleteQuestion = async (req, res, next) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Make sure user is question owner or admin
        if (question.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this question'
            });
        }

        await question.remove();

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};