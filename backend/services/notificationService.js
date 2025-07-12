const Notification = require('../models/Notification');

class NotificationService {
    static async createNotification({ recipient, type, data }) {
        return await Notification.create({
            recipient,
            type,
            data
        });
    }

    static async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false }) {
        const query = { recipient: userId };
        if (unreadOnly) query.read = false;

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('data.questionId', 'title');

        const total = await Notification.countDocuments(query);

        return {
            notifications,
            page,
            pages: Math.ceil(total / limit),
            total
        };
    }

    static async markAsRead(notificationId, userId) {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { read: true },
            { new: true }
        );

        if (!notification) throw new Error('Notification not found');
        return notification;
    }

    static async markAllAsRead(userId) {
        await Notification.updateMany(
            { recipient: userId, read: false },
            { read: true }
        );

        return { message: 'All notifications marked as read' };
    }
}

module.exports = NotificationService;
