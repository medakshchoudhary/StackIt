const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
    createAnswer,
    updateAnswer,
    deleteAnswer,
    voteAnswer,
    acceptAnswer
} = require('../controllers/answerController');
const { protect } = require('../middleware/authMiddleware');

// Create answer for a question
router.post(
    '/:questionId/answers',
    protect,
    [check('content', 'Answer content is required').not().isEmpty()],
    createAnswer
);

// Update and delete specific answers
router.route('/:id')
    .put(protect, updateAnswer)
    .delete(protect, deleteAnswer);

// Vote on answer
router.post('/:id/vote', protect, voteAnswer);

// Accept answer
router.post('/:id/accept', protect, acceptAnswer);

module.exports = router;