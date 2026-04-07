const { Notification, User } = require('../models');
const { sendPushMessage } = require('./pushNotification');

/**
 * Send an in-app notification to a user.
 * @param {Object} data - The notification data
 * @param {Number} data.userId - ID of the user to notify
 * @param {String} data.type - Type of notification (e.g., 'TRANSACTION_UPDATE', 'SYSTEM_ALERT')
 * @param {String} data.message - The notification message
 * @param {String} data.link - Optional link for deep-linking
 */
const createNotification = async ({ userId, type, message, link }) => {
    try {
        await Notification.create({
            userId,
            type,
            message,
            link
        });

        // Trigger an Expo Push Notification if the user has a registered token
        try {
            const user = await User.findByPk(userId);
            if (user && user.expo_push_token) {
                let title = 'QwikTransfers Update';
                if (type === 'TRANSACTION_UPDATE') title = 'Transaction Update';
                else if (type === 'RATE_ALERT') title = 'Rate Alert';

                await sendPushMessage(user.expo_push_token, title, message, { type });
            }
        } catch (pushErr) {
            console.error('Failed to send push notification:', pushErr);
        }

    } catch (error) {
        console.error('Failed to create notification:', error);
    }
};

/**
 * Notify vendors in the relevant region about a new transaction request.
 * Only notifies vendors that are currently marked as online.
 * @param {Object} transaction - The newly created transaction object
 */
const notifyRelevantVendors = async (transaction) => {
    try {
        const type = transaction.type || '';
        const amount_sent = transaction.amount_sent;
        
        const sourceCurrency = type.split('-')[0]?.toUpperCase();
        const sourceCountry = sourceCurrency === 'CAD' ? 'Canada' : 
                            sourceCurrency === 'GHS' ? 'Ghana' : null;

        console.log(`[NOTIF] Processing transaction ${transaction.transaction_id || transaction.id} | Source: ${sourceCurrency} -> ${sourceCountry}`);

        if (!sourceCountry) {
            console.log(`[NOTIF] Skip: No matching source country for currency ${sourceCurrency}`);
            return;
        }

        const { Sequelize } = require('../models');
        const Op = Sequelize.Op;
        
        const onlineVendors = await User.findAll({
            where: {
                role: 'vendor',
                is_online: true,
                is_active: true,
                [Op.or]: [
                    { country: sourceCountry },
                    { country: sourceCountry.toUpperCase() },
                    { country: 'All' }
                ]
            }
        });

        console.log(`[NOTIF] Found ${onlineVendors.length} online vendors matching the ${sourceCountry} region.`);

        if (onlineVendors.length === 0) return;

        const message = `New ${amount_sent} ${sourceCurrency} transaction request available in your region.`;
        const link = `/vendor?tab=pool&search=${transaction.transaction_id || transaction.id}`;

        for (const vendor of onlineVendors) {
            console.log(`[NOTIF] Sending alert to vendor ID: ${vendor.id} (${vendor.email})`);
            await createNotification({
                userId: vendor.id,
                type: 'TRANSACTION_UPDATE',
                message,
                link
            });
        }
    } catch (error) {
        console.error('[NOTIF ERROR] Failed to notify relevant vendors:', error);
    }
};

module.exports = { createNotification, notifyRelevantVendors };
