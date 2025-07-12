const express = require('express');
const router = express.Router();
const {
    generateAnswer,
    getAnswer,
    voteOnAnswer,
    getStats
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// AI answer routes
router.post('/answer/:questionId', generateAnswer);
router.get('/answer/:questionId', getAnswer);
router.post('/answer/:answerId/vote', protect, voteOnAnswer);
router.get('/stats', getStats);

module.exports = router;
