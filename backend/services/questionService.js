const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Tag = require('../models/Tag');
const User = require('../models/User');
const NotificationService = require('./notificationService');

class QuestionService {
    static async createQuestion(userId, { title, description, tags }) {
        // First validate and get/create tags
        const tagIds = await this.processTagIds(tags);
        
        const question = await Question.create({
            title,
            description,
            tags: tagIds,
            author: userId
        });

        // Update tag usage count
        await Tag.updateMany(
            { _id: { $in: tagIds } },
            { $inc: { questionCount: 1 } }
        );

        return question;
    }

    static async acceptAnswer(questionId, answerId, userId) {
        const question = await Question.findById(questionId);
        if (!question) throw new Error('Question not found');

        // Verify question ownership
        if (question.author.toString() !== userId) {
            throw new Error('Not authorized to accept answer');
        }

        const answer = await Answer.findById(answerId);
        if (!answer) throw new Error('Answer not found');

        // Update question with accepted answer
        question.acceptedAnswer = answerId;
        await question.save();

        // Update answerer's reputation
        await User.findByIdAndUpdate(
            answer.author,
            { $inc: { reputation: 15 } }
        );

        // Notify the answer author
        await NotificationService.createNotification({
            recipient: answer.author,
            type: 'ANSWER_ACCEPTED',
            data: {
                questionId: question._id,
                questionTitle: question.title
            }
        });

        return question;
    }

    static async processTagIds(tagNames) {
        const tagIds = [];
        
        for (const name of tagNames) {
            let tag = await Tag.findOne({ name: name.toLowerCase() });
            
            if (!tag) {
                tag = await Tag.create({
                    name: name.toLowerCase(),
                    isApproved: false // New tags need approval
                });
            }
            
            tagIds.push(tag._id);
        }
        
        return tagIds;
    }
}

module.exports = QuestionService;
