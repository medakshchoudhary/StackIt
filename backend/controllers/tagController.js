const Tag = require('../models/Tag');
const asyncHandler = require('express-async-handler');

// @desc    Create a new tag
// @route   POST /api/tags
// @access  Private (Admin only)
exports.createTag = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    
    const tag = await Tag.create({
        name,
        description,
        creator: req.user._id,
        isApproved: req.user.role === 'admin' // Auto-approve if admin creates
    });

    res.status(201).json(tag);
});

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public
exports.getTags = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    let query = {};
    if (search) {
        query = { $text: { $search: search } };
    }

    const tags = await Tag.find(query)
        .sort({ questionCount: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await Tag.countDocuments(query);

    res.json({
        tags,
        page,
        pages: Math.ceil(total / limit),
        total
    });
});

// @desc    Get tag suggestions
// @route   GET /api/tags/suggest
// @access  Public
exports.suggestTags = asyncHandler(async (req, res) => {
    const query = req.query.q || '';
    const limit = parseInt(req.query.limit) || 5;

    const suggestions = await Tag.find({
        name: { $regex: `^${query}`, $options: 'i' },
        isApproved: true
    })
    .select('name description questionCount')
    .limit(limit)
    .sort({ questionCount: -1 });

    res.json(suggestions);
});

// @desc    Approve/Reject a tag
// @route   PATCH /api/tags/:id/approve
// @access  Private (Admin only)
exports.approveTag = asyncHandler(async (req, res) => {
    const { approved } = req.body;
    
    const tag = await Tag.findByIdAndUpdate(
        req.params.id,
        { isApproved: approved },
        { new: true }
    );

    if (!tag) {
        res.status(404);
        throw new Error('Tag not found');
    }

    res.json(tag);
});

// @desc    Delete a tag
// @route   DELETE /api/tags/:id
// @access  Private (Admin only)
exports.deleteTag = asyncHandler(async (req, res) => {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
        res.status(404);
        throw new Error('Tag not found');
    }

    await tag.remove();
    res.json({ message: 'Tag removed' });
});
