const Question = require('../models/Question');
const { validationResult } = require('express-validator');
const Answer = require('../models/Answer');

// @desc    Get all questions
// @route   GET /api/questions
// @access  Public
exports.getQuestions = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        
        // Search functionality
        const search = req.query.search || '';
        const tag = req.query.tag || '';
        
        let query = {};
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (tag) {
            const Tag = require('../models/Tag');
            const tagDoc = await Tag.findOne({ name: { $regex: tag, $options: 'i' } });
            if (tagDoc) {
                query.tags = tagDoc._id;
            }
        }
        
        const total = await Question.countDocuments(query);

        const questions = await Question.find(query)
            .populate('author', 'username')
            .populate('tags', 'name description') // Add description to populate tags properly
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
            .populate('tags', 'name description') // Add this line to populate tags properly
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

        // Increment views only if user hasn't viewed this question recently
        const userId = req.user?.id;
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        if (userId) {
            // For authenticated users, check if they viewed this question in the last 24 hours
            const existingView = question.viewedBy.find(view => 
                view.user.toString() === userId && 
                view.viewedAt > oneDayAgo
            );

            if (!existingView) {
                // Remove old view if exists
                question.viewedBy = question.viewedBy.filter(view => 
                    view.user.toString() !== userId
                );
                
                // Add new view
                question.viewedBy.push({
                    user: userId,
                    viewedAt: now
                });
                
                question.views += 1;
                await question.save();
            }
        } else {
            // For anonymous users, increment view count every time
            // (This can be improved with session tracking or IP-based tracking)
            question.views += 1;
            await question.save();
        }

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

        // Debug: Log the received data
        console.log('Received question data:', { title, description, tags, tagsType: typeof tags });

        // Process tags - handle both string and array formats
        let tagArray = tags;
        if (typeof tags === 'string') {
            try {
                tagArray = JSON.parse(tags);
            } catch (e) {
                // If parsing fails, split by comma
                tagArray = tags.split(',').map(tag => tag.trim());
            }
        }

        // Ensure tagArray is actually an array
        if (!Array.isArray(tagArray)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Tags must be an array' 
            });
        }

        // Process tags - convert tag names to ObjectIds, create new tags if needed
        const Tag = require('../models/Tag');
        const tagIds = [];
        
        for (const tagName of tagArray) {
            let tag = await Tag.findOne({ name: tagName.toLowerCase() });
            
            if (!tag) {
                // Create new tag if it doesn't exist
                tag = await Tag.create({
                    name: tagName.toLowerCase(),
                    description: `Tag for ${tagName}`,
                    creator: req.user.id,
                    isApproved: true // Auto-approve for now
                });
                console.log('Created new tag:', tag.name);
            }
            
            tagIds.push(tag._id);
        }

        const question = await Question.create({
            title,
            description,
            tags: tagIds,
            author: req.user.id
        });

        // Populate the tags and author before sending response
        await question.populate('tags', 'name description');
        await question.populate('author', 'username');

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

// @desc    Accept answer
// @route   POST /api/questions/:id/accept-answer/:answerId
// @access  Private
exports.acceptAnswer = async (req, res, next) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Make sure user is question owner
        if (question.author.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Only question author can accept answers'
            });
        }

        // Check if answer exists and belongs to this question
        const answer = await Answer.findById(req.params.answerId);
        if (!answer || answer.question.toString() !== req.params.id) {
            return res.status(404).json({
                success: false,
                message: 'Answer not found'
            });
        }

        // Update question with accepted answer
        question.acceptedAnswer = req.params.answerId;
        await question.save();

        // Mark answer as accepted
        answer.isAccepted = true;
        await answer.save();

        res.json({
            success: true,
            data: question
        });
    } catch (error) {
        next(error);
    }
};