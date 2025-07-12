const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    createTag,
    getTags,
    suggestTags,
    approveTag,
    deleteTag
} = require('../controllers/tagController');

router.route('/')
    .get(getTags)
    .post(protect, createTag);

router.get('/suggest', suggestTags);
router.patch('/:id/approve', protect, authorize('admin'), approveTag);
router.delete('/:id', protect, authorize('admin'), deleteTag);

module.exports = router;