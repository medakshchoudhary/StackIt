const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User'); // Import the User model

router.post(
    '/register',
    [
        check('username', 'Username is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
    ],
    register
);

router.post(
    '/login',
    [
        check('password', 'Password is required').exists()
    ],
    login
);

router.get('/me', protect, getMe);

// Search users for mentions
router.get('/search-users', protect, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json({ success: true, data: [] });
        }

        const users = await User.find({
            username: { $regex: q, $options: 'i' },
            isBanned: false
        })
        .select('username _id')
        .limit(10);

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching users'
        });
    }
});

module.exports = router;