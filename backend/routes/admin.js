const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getUsers,
    banUser,
    getSiteStats
} = require('../controllers/adminController');

// Fix: Change how we apply middleware
router.use(protect);
router.use(authorize('admin'));

// Routes
router.get('/users', getUsers);
router.patch('/users/:id/ban', banUser);
router.get('/stats', getSiteStats);

module.exports = router;