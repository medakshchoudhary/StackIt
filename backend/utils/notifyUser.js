const Notification = require('../models/Notification');

const notifyUser = async ({ recipient, type, question, answer, actor, message }) => {
    try {
        await Notification.create({
            recipient,
            type,
            question,
            answer,
            actor,
            message
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

module.exports = { notifyUser };