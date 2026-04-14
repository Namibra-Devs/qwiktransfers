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

        // Audit log
        await logAction({
            userId: user.id,
            action: 'VENDOR_TOGGLE_ONLINE',
            details: `Vendor ${user.id} toggled status to ${user.is_online ? 'online' : 'offline'}`,
            ipAddress: req.ip
        });

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
            include: [{ model: User, as: 'user', attributes: ['full_name', 'first_name', 'middle_name', 'last_name', 'email'] }],
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
            include: [{ model: User, as: 'user', attributes: ['full_name', 'first_name', 'middle_name', 'last_name', 'email'] }],
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
        const { transactionId, proof_url } = req.body;
        
        const transaction = await Transaction.findOne({
            where: {
                id: transactionId,
                vendorId: req.user.id,
                status: 'processing'
            }
        });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found or not currently assigned to you' });
        }

        // Check if proof exists (either already saved or provided in request)
        const finalProof = proof_url || transaction.vendor_proof_url;
        if (!finalProof) {
            return res.status(400).json({ error: 'Vendor payment proof is required to complete transaction' });
        }

        await sequelize.transaction(async (t) => {
            transaction.status = 'sent';
            transaction.vendor_proof_url = finalProof;
            await transaction.save({ transaction: t });

            // Update User Lifetime Transfers
            const user = await User.findByPk(transaction.userId, { transaction: t });
            if (user) {
                const amount = parseFloat(transaction.amount_sent);
                const type = transaction.type || 'GHS-CAD';
                if (type.startsWith('GHS')) {
                    user.balance_ghs = (parseFloat(user.balance_ghs || 0) + amount).toFixed(2);
                } else if (type.startsWith('CAD')) {
                    user.balance_cad = (parseFloat(user.balance_cad || 0) + amount).toFixed(2);
                }
                await user.save({ transaction: t });

                // Notification for User (outside transaction or after commit is better, but sequelize transaction helper handles callback)
                createNotification({
                    userId: transaction.userId,
                    type: 'TRANSACTION_COMPLETE',
                    message: `Your transaction #${transaction.id} has been completed! You can view the payment proof in your dashboard.`
                }).catch(err => console.error("Notification failed:", err));

                // Communications
                if (user.phone) {
                    const toCurr = transaction.type?.split('-')[1] || 'CAD';
                    sendSMS(user.phone, `Success! Your transfer of ${transaction.amount_received} ${toCurr} to ${transaction.recipient_details.name} is COMPLETED.`).catch(err => console.error("Vendor completion SMS failed:", err));
                }
                sendTransactionCompletedEmail(user, transaction).catch(err => console.error("Vendor completion email failed:", err));
            }
        });

        res.json({ message: 'Transaction sent successfully', transaction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const uploadVendorProof = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const proof_url = `/uploads/proofs/${req.file.filename}`;
        res.json({ proof_url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const rejectTransaction = async (req, res) => {
    try {
        const { transactionId, reason } = req.body;
        if (!reason || reason.trim() === '') {
            return res.status(400).json({ error: 'Rejection reason is required' });
        }

        const transaction = await Transaction.findOne({
            where: {
                id: transactionId,
                vendorId: req.user.id,
                status: 'processing'
            }
        });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found or not currently assigned to you' });
        }

        transaction.status = 'pending';
        transaction.vendorId = null;
        transaction.rejection_reason = reason;
        await transaction.save();

        // Audit log
        await logAction({
            userId: req.user.id,
            action: 'VENDOR_REJECT_TRANSACTION',
            details: `Vendor rejected transaction ${transaction.id}. Reason: ${reason}`,
            ipAddress: req.ip
        });

        // Notification for User
        await createNotification({
            userId: transaction.userId,
            type: 'TRANSACTION_UPDATE',
            message: `Your transaction #${transaction.id} was returned to the pool by the vendor. Reason: ${reason}`
        });

        res.json({ message: 'Transaction rejected successfully', transaction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    toggleStatus,
    getAvailablePool,
    getHandledTransactions,
    acceptTransaction,
    completeTransaction,
    uploadVendorProof,
    rejectTransaction
};
