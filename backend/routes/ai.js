const express = require('express');
const router = express.Router();
const {
    generateAnswer,
    getAnswer,
    voteOnAnswer,
    getStats
} = require('../controllers/aiController');

// AI answer routes
router.post('/answer/:questionId', generateAnswer);
router.get('/answer/:questionId', getAnswer);
router.post('/answer/:answerId/vote', voteOnAnswer);
router.get('/stats', getStats);

module.exports = router;
