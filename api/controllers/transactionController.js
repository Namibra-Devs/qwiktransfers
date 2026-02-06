const { Transaction, User, Rate } = require('../models');
const { sendSMS } = require('../services/smsService');
const { sendTransactionInitiatedEmail } = require('../services/emailService');

const createTransaction = async (req, res) => {
    try {
        const { amount_sent, recipient_details, type } = req.body;
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        // Daily Limit Enforcement
        let dailyLimit = 50; // Level 1 (Unverified Email)
        if (user.is_email_verified) dailyLimit = 500; // Level 2 (Verified Email)
        if (user.kyc_status === 'verified') dailyLimit = 5000; // Level 3 (Verified KYC)

        // Calculate sum of today's transactions
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todayTransactions = await Transaction.findAll({
            where: {
                userId,
                createdAt: { [require('sequelize').Op.gte]: startOfDay }
            }
        });

        // Convert current today sum and prospective amount to reference USD/CAD equivalent
        // Simple conversion for limit check: 1 CAD/USD ≈ 15 GHS
        const getReferenceAmount = (amount, t) => {
            const currency = t.split('-')[0];
            return currency === 'GHS' ? amount / 15 : amount;
        };

        const currentSpent = todayTransactions.reduce((sum, tx) => sum + getReferenceAmount(tx.amount_sent, tx.type), 0);
        const prospectiveSent = getReferenceAmount(amount_sent, type || 'GHS-CAD');

        if (currentSpent + prospectiveSent > dailyLimit) {
            let reason = "Verify your email to increase your limit to $500.";
            if (user.is_email_verified && user.kyc_status !== 'verified') {
                reason = "Complete KYC verification to increase your limit to $5,000.";
            } else if (user.is_email_verified && user.kyc_status === 'verified') {
                reason = "You have reached your maximum daily limit of $5,000.";
            }

            return res.status(403).json({
                error: `Daily limit exceeded. You have already spent $${currentSpent.toFixed(2)}. Your current limit is $${dailyLimit}. ${reason}`
            });
        }

        const rateRecord = await Rate.findOne({ where: { pair: 'GHS-CAD' } });
        const exchange_rate = rateRecord ? rateRecord.rate : 0.10;

        const amount_received = amount_sent * exchange_rate;

        const transaction = await Transaction.create({
            userId,
            type: type || 'GHS-CAD',
            amount_sent,
            exchange_rate,
            amount_received,
            recipient_details,
            status: 'pending',
            proof_url: ''
        });

        // Send Email Notification
        if (user) {
            await sendTransactionInitiatedEmail(user, transaction);
        }

        // Send SMS Notification (Short & Concise)
        if (user && user.phone) {
            const fromCurr = type.split('-')[0];
            const toCurr = type.split('-')[1];
            const refMsg = recipient_details.admin_reference ? `Ref: ${recipient_details.admin_reference}` : '';
            await sendSMS(user.phone, `QWIK: Transfer of ${amount_sent} ${fromCurr} to ${recipient_details.name} (${amount_received} ${toCurr}) initiated. ${refMsg}.`);
        }

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTransactions = async (req, res) => {
    try {
        const where = {};
        if (req.user.role !== 'admin') {
            where.userId = req.user.id;
        }
        const transactions = await Transaction.findAll({
            where,
            include: ['user'],
            order: [['createdAt', 'DESC']]
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const transaction = await Transaction.findByPk(id, { include: ['user'] });

        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

        transaction.status = status;
        await transaction.save();

        // Notify user about status change
        if (transaction.user && transaction.user.phone) {
            await sendSMS(transaction.user.phone, `Update: Your transaction to ${transaction.recipient_details.name} is now ${status.toUpperCase()}.`);
        }

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const uploadProof = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findByPk(id, { include: ['user'] });
        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

        transaction.proof_url = `/uploads/${req.file.filename}`;
        await transaction.save();

        // Notify user
        if (transaction.user && transaction.user.phone) {
            await sendSMS(transaction.user.phone, `Proof of payment uploaded for transaction #${transaction.id}. We will verify it shortly.`);
        }

        res.json({ message: 'Proof uploaded successfully', proof_url: transaction.proof_url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createTransaction, getTransactions, updateStatus, uploadProof };
