const { Notification } = require('../models');

/**
 * Send an in-app notification to a user.
 * @param {Object} data - The notification data
 * @param {Number} data.userId - ID of the user to notify
 * @param {String} data.type - Type of notification (e.g., 'TRANSACTION_UPDATE', 'SYSTEM_ALERT')
 * @param {String} data.message - The notification message
 */
const createNotification = async ({ userId, type, message }) => {
    try {
        await Notification.create({
            userId,
            type,
            message
        });
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
};

module.exports = { createNotification };
