const express = require('express');
const router = express.Router();
const { voteAnswer } = require('../controllers/voteController');
const { protect } = require('../middleware/authMiddleware');

router.post('/answers/:id/vote', protect, voteAnswer);

module.exports = router;