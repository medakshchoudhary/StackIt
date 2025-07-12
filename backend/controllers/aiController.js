const AIAnswer = require('../models/AIAnswer');
const Question = require('../models/Question');
const aiService = require('../services/aiService');
const asyncHandler = require('express-async-handler');

// @desc    Generate AI answer for a question
// @route   POST /api/ai/answer/:questionId
// @access  Public
exports.generateAnswer = asyncHandler(async (req, res) => {
    const { questionId } = req.params;

    // Check if question exists
    const question = await Question.findById(questionId).populate('tags', 'name');
    if (!question) {
        return res.status(404).json({
            success: false,
            message: 'Question not found'
        });
    }

    // Check if AI answer already exists
    const existingAnswer = await AIAnswer.findOne({ question: questionId });
    if (existingAnswer) {
        return res.json({
            success: true,
            data: existingAnswer,
            message: 'AI answer already exists'
        });
    }

    // Check if we should generate an answer
    if (!aiService.shouldGenerateAnswer(question)) {
        return res.status(400).json({
            success: false,
            message: 'Question does not meet criteria for AI answer generation'
        });
    }

    try {
        // Generate AI answer
        console.log('Generating AI answer for question:', questionId);
        console.log('Question details:', {
            title: question.title,
            description: question.description?.substring(0, 100) + '...',
            tags: question.tags?.map(tag => typeof tag === 'string' ? tag : tag.name)
        });
        
        const aiResponse = await aiService.generateAnswer(question);
        console.log('AI response generated successfully');

        // Save AI answer to database
        const aiAnswer = await AIAnswer.create({
            question: questionId,
            answer: aiResponse.answer,
            confidence: aiResponse.confidence,
            generatedAt: aiResponse.generatedAt
        });

        console.log('AI answer saved to database:', aiAnswer._id);

        res.status(201).json({
            success: true,
            data: aiAnswer
        });
    } catch (error) {
        console.error('Error generating AI answer:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Failed to generate AI answer',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @desc    Get AI answer for a question
// @route   GET /api/ai/answer/:questionId
// @access  Public
exports.getAnswer = asyncHandler(async (req, res) => {
    const { questionId } = req.params;

    const aiAnswer = await AIAnswer.findOne({ question: questionId });
    
    if (!aiAnswer) {
        return res.status(404).json({
            success: false,
            message: 'No AI answer found for this question'
        });
    }

    res.json({
        success: true,
        data: aiAnswer
    });
});

// @desc    Vote on AI answer helpfulness
// @route   POST /api/ai/answer/:answerId/vote
// @access  Private
exports.voteOnAnswer = asyncHandler(async (req, res) => {
    const { answerId } = req.params;
    const { vote } = req.body; // 'helpful' or 'unhelpful'

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    const aiAnswer = await AIAnswer.findById(answerId);
    if (!aiAnswer) {
        return res.status(404).json({
            success: false,
            message: 'AI answer not found'
        });
    }

    if (!['helpful', 'unhelpful'].includes(vote)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid vote type'
        });
    }

    // Check if user has already voted
    const existingVoteIndex = aiAnswer.votes.findIndex(
        v => v.user.toString() === req.user.id
    );

    if (existingVoteIndex !== -1) {
        const existingVote = aiAnswer.votes[existingVoteIndex];
        
        // If same vote, remove it (toggle)
        if (existingVote.vote === vote) {
            aiAnswer.votes.splice(existingVoteIndex, 1);
            
            // Update counters
            if (vote === 'helpful') {
                aiAnswer.helpfulVotes = Math.max(0, aiAnswer.helpfulVotes - 1);
                aiAnswer.isHelpful -= 1;
            } else {
                aiAnswer.unhelpfulVotes = Math.max(0, aiAnswer.unhelpfulVotes - 1);
                aiAnswer.isHelpful += 1;
            }
        } else {
            // Change vote
            const oldVote = existingVote.vote;
            existingVote.vote = vote;
            
            // Update counters
            if (oldVote === 'helpful') {
                aiAnswer.helpfulVotes = Math.max(0, aiAnswer.helpfulVotes - 1);
                aiAnswer.isHelpful -= 1;
            } else {
                aiAnswer.unhelpfulVotes = Math.max(0, aiAnswer.unhelpfulVotes - 1);
                aiAnswer.isHelpful += 1;
            }
            
            if (vote === 'helpful') {
                aiAnswer.helpfulVotes += 1;
                aiAnswer.isHelpful += 1;
            } else {
                aiAnswer.unhelpfulVotes += 1;
                aiAnswer.isHelpful -= 1;
            }
        }
    } else {
        // Add new vote
        aiAnswer.votes.push({
            user: req.user.id,
            vote: vote
        });
        
        // Update counters
        if (vote === 'helpful') {
            aiAnswer.helpfulVotes += 1;
            aiAnswer.isHelpful += 1;
        } else {
            aiAnswer.unhelpfulVotes += 1;
            aiAnswer.isHelpful -= 1;
        }
    }

    await aiAnswer.save();

    // Get user's current vote
    const userVote = aiAnswer.votes.find(v => v.user.toString() === req.user.id);

    res.json({
        success: true,
        data: {
            helpfulVotes: aiAnswer.helpfulVotes,
            unhelpfulVotes: aiAnswer.unhelpfulVotes,
            isHelpful: aiAnswer.isHelpful,
            userVote: userVote ? userVote.vote : null
        }
    });
});

// @desc    Get AI statistics
// @route   GET /api/ai/stats
// @access  Public
exports.getStats = asyncHandler(async (req, res) => {
    const totalAnswers = await AIAnswer.countDocuments();
    const avgConfidence = await AIAnswer.aggregate([
        { $group: { _id: null, avgConfidence: { $avg: '$confidence' } } }
    ]);
    const totalHelpfulVotes = await AIAnswer.aggregate([
        { $group: { _id: null, total: { $sum: '$helpfulVotes' } } }
    ]);

    res.json({
        success: true,
        data: {
            totalAnswers,
            averageConfidence: avgConfidence[0]?.avgConfidence || 0,
            totalHelpfulVotes: totalHelpfulVotes[0]?.total || 0
        }
    });
});
