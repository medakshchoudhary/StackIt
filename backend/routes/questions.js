const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
    getQuestions,
    getQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    acceptAnswer
} = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(getQuestions)
    .post(
        protect,
        [
            check('title', 'Title is required').not().isEmpty(),
            check('description', 'Description is required').not().isEmpty(),
            check('tags', 'At least one tag is required').custom((value) => {
                // Accept both arrays and strings
                if (Array.isArray(value)) {
                    return value.length > 0;
                }
                if (typeof value === 'string') {
                    try {
                        const parsed = JSON.parse(value);
                        return Array.isArray(parsed) && parsed.length > 0;
                    } catch (e) {
                        return value.trim().length > 0;
                    }
                }
                return false;
            })
        ],
        createQuestion
    );

router.route('/:id')
    .get(getQuestion)
    .put(protect, updateQuestion)
    .delete(protect, deleteQuestion);

// Accept answer route
router.post('/:id/accept-answer/:answerId', protect, acceptAnswer);

module.exports = router;