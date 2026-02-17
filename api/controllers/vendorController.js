const { Transaction, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const { sendSMS } = require('../services/smsService');
const { sendTransactionCompletedEmail } = require('../services/emailService');
const { logAction } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');

const toggleStatus = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.is_online = !user.is_online;
        await user.save();

        res.json({ is_online: user.is_online });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAvailablePool = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const where = {
            status: 'pending',
            vendorId: null
        };

        // Filter by region if not 'All'
        if (user.country === 'Canada') {
            where.type = { [Op.like]: 'CAD-%' };
        } else if (user.country === 'Ghana') {
            where.type = { [Op.like]: 'GHS-%' };
        }

        const pool = await Transaction.findAll({
            where,
            include: [{ model: User, as: 'user', attributes: ['full_name', 'email'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(pool);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getHandledTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            where: {
                vendorId: req.user.id
            },
            include: [{ model: User, as: 'user', attributes: ['full_name', 'email'] }],
            order: [['updatedAt', 'DESC']]
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const acceptTransaction = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { transactionId } = req.body;

        // Atomic check: Must be pending and have no vendor assigned
        const transaction = await Transaction.findOne({
            where: {
                id: transactionId,
                status: 'pending',
                vendorId: null
            },
            lock: t.LOCK.UPDATE,
            transaction: t
        });

        if (!transaction) {
            await t.rollback();
            return res.status(400).json({ error: 'Transaction already accepted or unavailable' });
        }

        transaction.vendorId = req.user.id;
        transaction.status = 'processing';
        await transaction.save({ transaction: t });

        // Audit log
        await logAction({
            userId: req.user.id,
            action: 'VENDOR_ACCEPT_TRANSACTION',
            details: `Vendor accepted transaction ${transaction.id}`,
            ipAddress: req.ip
        });

        // Notification for User
        await createNotification({
            userId: transaction.userId,
            type: 'TRANSACTION_UPDATE',
            message: `Your transaction #${transaction.id} has been accepted by a vendor and is being processed.`
        });

        await t.commit();
        res.json({ message: 'Transaction accepted successfully', transaction });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: error.message });
    }
};

const completeTransaction = async (req, res) => {
    try {
        const { transactionId } = req.body;
        const transaction = await Transaction.findOne({
            where: {
                id: transactionId,
                vendorId: req.user.id,
                status: 'processing'
            }
        });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found or not assigned to you' });
        }

        transaction.status = 'sent';
        transaction.sent_at = new Date();
        await transaction.save();

        // Audit log
        await logAction({
            userId: req.user.id,
            action: 'VENDOR_COMPLETE_TRANSACTION',
            details: `Vendor marked transaction ${transaction.id} as completed/sent`,
            ipAddress: req.ip
        });

        // Notification for User
        await createNotification({
            userId: transaction.userId,
            type: 'TRANSACTION_UPDATE',
            message: `Good news! Your transaction #${transaction.id} has been fully processed and sent to the recipient.`
        });

        // Fetch user for notifications
        const user = await User.findByPk(transaction.userId);

        // Async Notifications
        if (user) {
            // Email
            sendTransactionCompletedEmail(user, transaction).catch(err => console.error("Vendor completion email failed:", err));

            // SMS
            if (user.phone) {
                const toCurr = transaction.type?.split('-')[1] || 'CAD';
                await sendSMS(user.phone, `Success! Your transfer of ${transaction.amount_received} ${toCurr} to ${transaction.recipient_details.name} is COMPLETED.`);
            }
        }

        res.json({ message: 'Transaction marked as sent', transaction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    toggleStatus,
    getAvailablePool,
    getHandledTransactions,
    acceptTransaction,
    completeTransaction
};
