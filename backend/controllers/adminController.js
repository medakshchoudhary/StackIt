const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const asyncHandler = require('express-async-handler');

// @desc    Get all users (with filters and pagination)
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const role = req.query.role;
    const isBanned = req.query.isBanned === 'true';

    let query = {};
    if (search) {
        query.$or = [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }
    if (role) query.role = role;
    if (req.query.isBanned !== undefined) query.isBanned = isBanned;

    const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
        users,
        page,
        pages: Math.ceil(total / limit),
        total
    });
});

// @desc    Ban/Unban a user
// @route   PATCH /api/admin/users/:id/ban
// @access  Private (Admin only)
exports.banUser = asyncHandler(async (req, res) => {
    const { isBanned, banReason } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Prevent banning admins
    if (user.role === 'admin') {
        res.status(403);
        throw new Error('Cannot ban admin users');
    }

    user.isBanned = isBanned;
    user.banReason = isBanned ? banReason : null;
    await user.save();

    res.json({
        message: isBanned ? 'User banned successfully' : 'User unbanned successfully',
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isBanned: user.isBanned,
            banReason: user.banReason
        }
    });
});

// @desc    Get site statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getSiteStats = asyncHandler(async (req, res) => {
    const stats = {
        users: {
            total: await User.countDocuments({}),
            banned: await User.countDocuments({ isBanned: true }),
            newToday: await User.countDocuments({
                createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            })
        },
        questions: {
            total: await Question.countDocuments({}),
            unanswered: await Question.countDocuments({ answers: { $size: 0 } }),
            newToday: await Question.countDocuments({
                createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            })
        },
        answers: {
            total: await Answer.countDocuments({}),
            accepted: await Answer.countDocuments({ isAccepted: true }),
            newToday: await Answer.countDocuments({
                createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            })
        }
    };

    res.json(stats);
});
