const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
    getComments,
    createComment,
    updateComment,
    deleteComment,
    voteComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// Get comments for an answer
router.get('/:answerId/comments', getComments);

// Create comment for an answer
router.post(
    '/:answerId/comments',
    protect,
    [check('content', 'Comment content is required').not().isEmpty().isLength({ max: 1000 })],
    createComment
);

// Update and delete specific comments
router.route('/comments/:id')
    .put(protect, updateComment)
    .delete(protect, deleteComment);

// Vote on comment
router.post('/comments/:id/vote', protect, voteComment);

module.exports = router;
