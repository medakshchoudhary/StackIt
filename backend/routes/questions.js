const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
    getQuestions,
    getQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion
} = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(getQuestions)
    .post(
        protect,
        [
            check('title', 'Title is required').not().isEmpty(),
            check('description', 'Description is required').not().isEmpty(),
            check('tags', 'At least one tag is required').isArray({ min: 1 })
        ],
        createQuestion
    );

router.route('/:id')
    .get(getQuestion)
    .put(protect, updateQuestion)
    .delete(protect, deleteQuestion);

module.exports = router;