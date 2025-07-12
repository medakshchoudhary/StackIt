const Answer = require('../models/Answer');

// @desc    Vote on answer
// @route   POST /api/answers/:id/vote
// @access  Private
exports.voteAnswer = async (req, res, next) => {
    try {
        const answer = await Answer.findById(req.params.id);

        if (!answer) {
            return res.status(404).json({
                success: false,
                message: 'Answer not found'
            });
        }

        const { value } = req.body;

        if (![1, -1].includes(value)) {
            return res.status(400).json({
                success: false,
                message: 'Vote value must be 1 or -1'
            });
        }

        // Check if user has already voted
        const existingVote = answer.votes.find(
            (vote) => vote.user.toString() === req.user.id
        );

        if (existingVote) {
            // Remove vote if clicking same value
            if (existingVote.value === value) {
                answer.votes = answer.votes.filter(
                    (vote) => vote.user.toString() !== req.user.id
                );
            } else {
                // Update vote value
                existingVote.value = value;
            }
        } else {
            // Add new vote
            answer.votes.push({
                user: req.user.id,
                value
            });
        }

        await answer.save();

        res.json({
            success: true,
            data: answer
        });
    } catch (error) {
        next(error);
    }
};