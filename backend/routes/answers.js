const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
    createAnswer,
    updateAnswer,
    deleteAnswer
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

module.exports = router;