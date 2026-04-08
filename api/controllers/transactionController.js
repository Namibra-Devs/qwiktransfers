const { Transaction, User, Rate, SystemConfig, Referral, sequelize } = require('../models');
const { Op } = require('sequelize');
const { sendSMS } = require('../services/smsService');
const { sendTransactionInitiatedEmail, sendTransactionCompletedEmail } = require('../services/emailService');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const Big = require('big.js');
const fs = require('fs');
const path = require('path');
const { logAction } = require('../services/auditService');
const { createNotification, notifyRelevantVendors } = require('../services/notificationService');

const createTransaction = async (req, res) => {
    try {
        const { amount_sent, recipient_details, type, exchange_rate, amount_received, rate_locked_until, market_rate } = req.body;
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        // Daily Limit Enforcement (Dynamic from SystemConfig)
        const configRecord = await SystemConfig.findOne({ where: { key: 'tiered_limits' } });
        const limits = configRecord ? configRecord.value : { level1: 50, level2: 500, level3: 5000 };

        let dailyLimit = limits.level1;
        if (user.is_email_verified) dailyLimit = limits.level2;
        if (user.kyc_status === 'verified') dailyLimit = limits.level3;

        // Calculate sum of today's transactions
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todayTransactions = await Transaction.findAll({
            where: {
                userId,
                createdAt: { [require('sequelize').Op.gte]: startOfDay }
            }
        });

        const rateRecord = await Rate.findOne({ where: { pair: 'GHS-CAD' } });
        const liveRate = rateRecord ? parseFloat(rateRecord.rate) : 0.10;

        const getReferenceAmount = (amount, txType, rate) => {
            const currency = txType.split('-')[0];
            const numAmount = amount || 0;
            // Use Big for precision
            const bigAmount = new Big(numAmount);
            const bigRate = new Big(rate);
            return currency === 'GHS' ? bigAmount.times(bigRate).toNumber() : bigAmount.toNumber();
        };

        const currentSpent = todayTransactions.reduce((sum, tx) => {
            return new Big(sum).plus(getReferenceAmount(tx.amount_sent, tx.type, liveRate)).toNumber();
        }, 0);
        const prospectiveSent = getReferenceAmount(amount_sent, type || 'GHS-CAD', liveRate);

        if (currentSpent + prospectiveSent > dailyLimit) {
            let reason = `Verify your email to increase your limit to $${limits.level2}.`;
            if (user.is_email_verified && user.kyc_status !== 'verified') {
                reason = `Complete KYC verification to increase your limit to $${limits.level3}.`;
            } else if (user.is_email_verified && user.kyc_status === 'verified') {
                reason = `You have reached your maximum daily limit of $${limits.level3}.`;
            }

            return res.status(403).json({
                error: `Daily limit exceeded. You have already spent $${currentSpent.toFixed(2)}. Your current limit is $${dailyLimit}. ${reason}`
            });
        }

        const bigLiveRate = new Big(liveRate);
        const final_exchange_rate = exchange_rate || (type === 'CAD-GHS' 
            ? new Big(1).div(bigLiveRate).toFixed(6) 
            : bigLiveRate.toFixed(6));

        const final_amount_received = amount_received || new Big(amount_sent).times(final_exchange_rate).toFixed(2);

        // Idempotency: Prevent duplicate transactions with the same admin_reference
        if (recipient_details && recipient_details.admin_reference) {
            const existingTx = await Transaction.findOne({
                where: {
                    userId,
                    createdAt: { [Op.gt]: new Date(Date.now() - 10 * 60000) } // Within last 10 mins
                },
                order: [['createdAt', 'DESC']]
            });

            if (existingTx && existingTx.recipient_details && existingTx.recipient_details.admin_reference === recipient_details.admin_reference) {
                console.log(`Idempotency triggered for user ${userId}, reference ${recipient_details.admin_reference}`);
                return res.status(200).json(existingTx);
            }
        }

        let lockTimeMinutes = 15;
        const lockConfig = await SystemConfig.findOne({ where: { key: 'rate_lock_time' } });
        if (lockConfig && lockConfig.value) {
            lockTimeMinutes = parseInt(lockConfig.value) || 15;
        }

        const final_rate_locked_until = rate_locked_until || new Date(Date.now() + lockTimeMinutes * 60000);

        // Generate Custom Transaction ID: QT-YYYYMMDD-XXXX
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        const transaction_id = `QT-${datePart}-${randomPart}`;
        const transaction = await sequelize.transaction(async (t) => {
            const tx = await Transaction.create({
                userId,
                type: type || 'GHS-CAD',
                amount_sent,
                exchange_rate: parseFloat(final_exchange_rate),
                amount_received: parseFloat(final_amount_received),
                recipient_details,
                status: 'pending',
                proof_url: '',
                rate_locked_until: final_rate_locked_until,
                transaction_id,
                market_rate: market_rate || liveRate,
                base_currency_profit: 0
            }, { transaction: t });

            await logAction({
                userId,
                action: 'TRANSACTION_CREATE',
                details: `User created transaction ${tx.id} for ${amount_sent} ${type?.split('-')[0] || 'CAD'}`,
                ipAddress: req.ip
            });

            return tx;
        });

        // Respond immediately to the user
        res.status(201).json(transaction);

        // Notifications (Background)
        try {
            if (user) {
                await sendTransactionInitiatedEmail(user, transaction).catch(e => console.error("Email failed:", e.message));
                
                const fromCurr = type?.split('-')[0] || 'CAD';
                const toCurr = type?.split('-')[1] || 'GHS';
                
                if (user.phone) {
                    const refMsg = recipient_details.admin_reference ? `Ref: ${recipient_details.admin_reference}` : '';
                    await sendSMS(user.phone, `QWIK: Transfer of ${amount_sent} ${fromCurr} to ${recipient_details.name} (${amount_received} ${toCurr}) initiated. ${refMsg}.`).catch(e => console.error("SMS failed:", e.message));
                }

                await createNotification({
                    userId,
                    type: 'TRANSACTION_UPDATE',
                    message: `Transaction of ${amount_sent} ${fromCurr} initiated. Your rate is locked for 15 minutes.`,
                    link: `/dashboard?search=${transaction.transaction_id}`
                }).catch(e => console.error("In-app notification failed:", e.message));

                // Notify online vendors for Dispatch Pool
                await notifyRelevantVendors(transaction).catch(e => console.error("Vendor notification failed:", e.message));
            }
        } catch (notifErr) {
            console.error("Background notification block failed:", notifErr.message);
        }
    } catch (error) {
        console.error("Transaction Creation Error:", error);
        res.status(500).json({ error: error.message });
    }
};

const getTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        const { status, userId, vendorId } = req.query;

        if (req.user.role !== 'admin') {
            where.userId = req.user.id;
        } else {
            // Admin can filter by specific user or vendor
            if (userId) where.userId = userId;
            if (vendorId) where.vendorId = vendorId;
        }

        if (status && status !== 'all') {
            where.status = status;
        }

        if (search) {
            const sequelize = Transaction.sequelize;
            where[Op.or] = [
                sequelize.where(sequelize.cast(sequelize.col('Transaction.id'), 'TEXT'), { [Op.like]: `%${search}%` }),
                sequelize.where(sequelize.cast(sequelize.col('amount_sent'), 'TEXT'), { [Op.like]: `%${search}%` }),
                { '$user.first_name$': { [Op.like]: `%${search}%` } },
                { '$user.middle_name$': { [Op.like]: `%${search}%` } },
                { '$user.last_name$': { [Op.like]: `%${search}%` } },
                { recipient_details: { [Op.contains]: { name: search } } }
            ];
        }

        const { count, rows: transactions } = await Transaction.findAndCountAll({
            where,
            include: [
                { model: User, as: 'user', attributes: ['id', 'email', 'first_name', 'last_name', 'phone'] },
                { model: User, as: 'vendor', attributes: ['id', 'email', 'first_name', 'last_name', 'country'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true
        });

        res.json({
            transactions,
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        const where = {};

        // Allow lookup by ID (PK) or transaction_id (custom String)
        if (id && isNaN(id)) {
            where.transaction_id = id;
        } else if (id) {
            where[Op.or] = [{ id: id }, { transaction_id: id }];
        }

        if (req.user.role !== 'admin') {
            where.userId = req.user.id;
        }

        const transaction = await Transaction.findOne({ 
            where, 
            include: [
                { model: User, as: 'user' },
                { model: User, as: 'vendor', attributes: ['id', 'email', 'first_name', 'last_name', 'country'] }
            ] 
        });
        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const assignVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const { vendorId, pin } = req.body;
        
        if (!pin) return res.status(400).json({ error: 'Security PIN is required to assign vendor.' });
        
        const adminUser = await User.findByPk(req.user.id);
        if (!adminUser.transaction_pin) return res.status(400).json({ error: 'Please set your Security PIN in your profile first.' });
        
        const isMatch = await bcrypt.compare(pin, adminUser.transaction_pin);
        if (!isMatch) return res.status(400).json({ error: 'Invalid PIN' });
        
        const transaction = await Transaction.findByPk(id);
        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
        
        const oldVendorId = transaction.vendorId;
        transaction.vendorId = vendorId;
        
        // If reassigning a pending transaction, change it to processing
        if (transaction.status === 'pending' && vendorId) {
            transaction.status = 'processing';
        }
        
        await transaction.save();
        
        // Audit log
        await logAction({
            userId: req.user.id,
            action: 'REASSIGN_VENDOR',
            details: `Admin reassigned transaction ${transaction.id} from ${oldVendorId || 'None'} to vendor ${vendorId || 'None'}`,
            ipAddress: req.ip
        });

        // Notify the new vendor
        if (vendorId) {
            await createNotification({
                userId: vendorId,
                type: 'NEW_TRANSACTION_ASSIGNED',
                message: `An admin has manually assigned Transaction #${transaction.transaction_id} to your active operations.`
            });
        }

        // Fetch updated transaction to return
        const updatedTransaction = await Transaction.findByPk(id, {
            include: [
                { model: User, as: 'user', attributes: ['id', 'email', 'first_name', 'last_name', 'phone'] },
                { model: User, as: 'vendor', attributes: ['id', 'email', 'first_name', 'last_name', 'country'] }
            ]
        });

        res.json({ message: 'Vendor assigned successfully', transaction: updatedTransaction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, pin, proof_url } = req.body;
        const transaction = await Transaction.findByPk(id, { include: ['user'] });

        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

        // Enforce PIN and Proof for 'sent' (Admin Confirm) action
        if (status === 'sent') {
            if (!pin) return res.status(400).json({ error: 'Security PIN is required to confirm.' });
            
            const adminUser = await User.findByPk(req.user.id);
            if (!adminUser.transaction_pin) return res.status(400).json({ error: 'Please set your Security PIN in your profile first.' });
            
            const isMatch = await bcrypt.compare(pin, adminUser.transaction_pin);
            if (!isMatch) return res.status(400).json({ error: 'Invalid PIN' });

            const finalProof = proof_url || transaction.vendor_proof_url;
            if (!finalProof) return res.status(400).json({ error: 'Proof of payment is required.' });
            
            transaction.vendor_proof_url = finalProof;
        }

        const result = await sequelize.transaction(async (t) => {
            transaction.status = status;
            if (status === 'sent') {
                transaction.sent_at = new Date();

                // Calculate Profit
                const type = transaction.type || 'GHS-CAD';
                const bigMarketRate = new Big(transaction.market_rate || 0);
                const bigAmountSent = new Big(transaction.amount_sent);
                const bigAmountReceived = new Big(transaction.amount_received);

                if (type === 'GHS-CAD' && bigMarketRate.gt(0)) {
                    // How many CAD the market would have given for the GHS sent
                    const marketCAD = bigAmountSent.times(bigMarketRate);
                    // Profit is the difference
                    transaction.base_currency_profit = marketCAD.minus(bigAmountReceived).toFixed(4);
                } else if (type === 'CAD-GHS' && bigMarketRate.gt(0)) {
                    // How many CAD the recipient actually got at market rate
                    const actualCADEquivalent = bigAmountReceived.div(bigMarketRate);
                    // Profit is what user paid (CAD) minus what recipient got (in CAD equiv)
                    transaction.base_currency_profit = bigAmountSent.minus(actualCADEquivalent).toFixed(4);
                }

                // Async email notification
                sendTransactionCompletedEmail(transaction.user, transaction).catch(err => console.error("Completion email failed:", err));

                // Referral Logic: Reward referrer on first successful transaction
                if (transaction.user.referred_by_id) {
                    // Check if this is the user's first COMPLETED transaction
                    const completedCount = await Transaction.count({
                        where: {
                            userId: transaction.userId,
                            status: 'sent',
                            id: { [Op.ne]: transaction.id }
                        },
                        transaction: t
                    });

                    if (completedCount === 0) {
                        const refConfig = await SystemConfig.findOne({ where: { key: 'referral_settings' }, transaction: t });
                        const settings = refConfig ? refConfig.value : { reward_amount: 10, reward_currency: 'GHS' };

                        await Referral.create({
                            referrer_id: transaction.user.referred_by_id,
                            referred_user_id: transaction.userId,
                            status: 'pending',
                            reward_amount: settings.reward_amount,
                            reward_currency: settings.reward_currency
                        }, { transaction: t });

                        // Create notification for referrer (outside the DB transaction to avoid blocking)
                        createNotification({
                            userId: transaction.user.referred_by_id,
                            type: 'REFERRAL_REWARD',
                            message: `Success! Your friend ${transaction.user.first_name} completed their first transaction. You have a pending reward of ${settings.reward_amount} ${settings.reward_currency}!`
                        }).catch(err => console.error("Referral notification failed:", err));
                    }
                }
            }
            return await transaction.save({ transaction: t });
        });

        // Notify user about status change via SMS
        if (transaction.user && transaction.user.phone) {
            const toCurr = transaction.type?.split('-')[1] || 'CAD';
            await sendSMS(transaction.user.phone, `Success! Your transfer of ${transaction.amount_received} ${toCurr} to ${transaction.recipient_details.name} is COMPLETED.`);
        }

        // Update Audit Log
        const actionName = status === 'sent' ? 'ADMIN_FORCE_CONFIRM' : 'TRANSACTION_STATUS_CHANGE';
        await logAction({
            userId: req.user.id,
            action: actionName,
            details: `Admin changed status of transaction ${transaction.id} to ${status}`,
            ipAddress: req.ip
        });

        // Create Notification for User
        await createNotification({
            userId: transaction.userId,
            type: 'TRANSACTION_UPDATE',
            message: `Your transaction #${transaction.id} status has been updated to ${status.toUpperCase()}.`
        });

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

        // Check Rate Lock
        if (transaction.rate_locked_until && new Date() > new Date(transaction.rate_locked_until)) {
            return res.status(400).json({
                error: 'Rate lock expired. Please create a new transaction with the current market rate.',
                expired: true
            });
        }

        // Delete old proof if it exists
        if (transaction.proof_url) {
            const oldPath = path.join(__dirname, '..', transaction.proof_url);
            fs.access(oldPath, fs.constants.F_OK, (err) => {
                if (!err) {
                    fs.unlink(oldPath, (unlinkErr) => {
                        if (unlinkErr) console.error("Error deleting old proof:", unlinkErr);
                    });
                }
            });
        }

        transaction.proof_url = `/uploads/${req.file.filename}`;
        transaction.proof_uploaded_at = new Date();
        await transaction.save();

        // Notify user
        if (transaction.user && transaction.user.phone) {
            await sendSMS(transaction.user.phone, `Proof of payment uploaded for transaction #${transaction.id}. We will verify it shortly.`);
        }

        // Audit log
        await logAction({
            userId: transaction.userId,
            action: 'TRANSACTION_PROOF_UPLOAD',
            details: `User uploaded proof for transaction ${transaction.id}`,
            ipAddress: req.ip
        });

        // Create Notification for User
        await createNotification({
            userId: transaction.userId,
            type: 'TRANSACTION_UPDATE',
            message: `Proof of payment for transaction #${transaction.id} has been uploaded and is pending verification.`
        });

        res.json({ message: 'Proof uploaded successfully', proof_url: transaction.proof_url, proof_uploaded_at: transaction.proof_uploaded_at });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const cancelTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findByPk(id);

        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
        if (transaction.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        if (transaction.status !== 'pending') {
            return res.status(400).json({ error: `Cannot cancel a transaction that is already ${transaction.status}` });
        }

        if (transaction.proof_url) {
            return res.status(400).json({ error: 'Cannot cancel transaction after proof has been uploaded' });
        }

        transaction.status = 'cancelled';
        await transaction.save();

        // Audit log
        await logAction({
            userId: req.user.id,
            action: 'TRANSACTION_CANCEL',
            details: `Transaction ${transaction.id} cancelled by ${req.user.role}`,
            ipAddress: req.ip
        });

        // Notification
        if (req.user.role === 'admin') {
            await createNotification({
                userId: transaction.userId,
                type: 'TRANSACTION_UPDATE',
                message: `Your transaction #${transaction.id} was cancelled by an administrator.`
            });
        }

        res.json({ message: 'Transaction cancelled successfully', transaction });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const exportTransactions = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const where = {};

        if (req.user.role !== 'admin') {
            where.userId = req.user.id;
        }

        if (startDate && endDate) {
            const { Op } = require('sequelize');
            where.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const transactions = await Transaction.findAll({
            where,
            include: ['user'],
            order: [['createdAt', 'DESC']]
        });

        // Simple CSV generation
        let csv = 'ID,Date,User,Type,Amount Sent,Exchange Rate,Amount Received,Recipient,Status,Proof Uploaded At\n';
        transactions.forEach(tx => {
            const recipientName = tx.recipient_details?.name || 'N/A';
            const userName = tx.user?.full_name || tx.user?.email || 'N/A';
            csv += `${tx.id},${tx.createdAt},"${userName}",${tx.type},${tx.amount_sent},${tx.exchange_rate},${tx.amount_received},"${recipientName}",${tx.status},${tx.proof_uploaded_at || ''}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=transactions-${new Date().getTime()}.csv`);
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAdminStats = async (req, res) => {
    try {
        const { Op, fn, col } = require('sequelize');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        // Current KPIs
        const pendingTransactions = await Transaction.count({ where: { status: 'pending' } });
        const pendingKYC = await User.count({ where: { kyc_status: 'pending' } });
        const successVolume = await Transaction.sum('amount_received', { where: { status: 'sent' } });

        // Time-series Volume (CAD & GHS) - Group by day
        const volumeHistory = await Transaction.findAll({
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                [fn('SUM', col('amount_sent')), 'total_sent'],
                'type'
            ],
            where: {
                status: 'sent',
                createdAt: { [Op.gte]: thirtyDaysAgo }
            },
            group: [fn('DATE', col('createdAt')), 'type'],
            order: [[fn('DATE', col('createdAt')), 'ASC']]
        });

        // Time-series Transaction count
        const txHistory = await Transaction.findAll({
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                [fn('COUNT', col('id')), 'count']
            ],
            where: {
                createdAt: { [Op.gte]: thirtyDaysAgo }
            },
            group: [fn('DATE', col('createdAt'))],
            order: [[fn('DATE', col('createdAt')), 'ASC']]
        });

        // User Growth History
        const userHistory = await User.findAll({
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                [fn('COUNT', col('id')), 'count']
            ],
            where: {
                role: 'user',
                createdAt: { [Op.gte]: thirtyDaysAgo }
            },
            group: [fn('DATE', col('createdAt'))],
            order: [[fn('DATE', col('createdAt')), 'ASC']]
        });

        // Growth Calculation (Simple Month-over-Month estimation)
        const lastMonthStart = new Date();
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
        const thisMonthVolume = await Transaction.sum('amount_received', {
            where: { status: 'sent', createdAt: { [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }
        }) || 0;
        const lastMonthVolume = await Transaction.sum('amount_received', {
            where: {
                status: 'sent', createdAt: {
                    [Op.between]: [
                        new Date(lastMonthStart.getFullYear(), lastMonthStart.getMonth(), 1),
                        new Date(lastMonthStart.getFullYear(), lastMonthStart.getMonth() + 1, 0)
                    ]
                }
            }
        }) || 0;

        const volumeGrowth = lastMonthVolume > 0 ? ((thisMonthVolume - lastMonthVolume) / lastMonthVolume * 100).toFixed(1) : 100;

        // Total Profit (Sum of base_currency_profit for 'sent' transactions)
        const totalProfitSum = await Transaction.sum('base_currency_profit', { where: { status: 'sent' } }) || 0;

        res.json({
            pendingTransactions,
            pendingKYC,
            successVolume: successVolume || 0,
            volumeGrowth,
            totalProfit: parseFloat(totalProfitSum).toFixed(2),
            history: {
                volume: volumeHistory,
                transactions: txHistory,
                users: userHistory
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const exportStats = async (req, res) => {
    try {
        const { exportToExcel } = require('../services/exportService');
        const transactions = await Transaction.findAll({
            where: { status: 'sent' },
            limit: 5000,
            order: [['createdAt', 'DESC']]
        });

        const columns = [
            { header: 'Date', key: 'createdAt', width: 20 },
            { header: 'TX ID', key: 'transaction_id', width: 25 },
            { header: 'Type', key: 'type', width: 10 },
            { header: 'Sent', key: 'amount_sent', width: 15 },
            { header: 'Received', key: 'amount_received', width: 15 },
            { header: 'Market Rate', key: 'market_rate', width: 15 },
            { header: 'Actual Rate', key: 'locked_rate', width: 15 },
            { header: 'Profit (CAD)', key: 'base_currency_profit', width: 15 }
        ];

        const buffer = await exportToExcel(transactions, columns, 'Transaction Analytics');

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=qwik-analytics-report.xlsx');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUserStats = async (req, res) => {
    try {
        const { Op, fn, col } = require('sequelize');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const userId = req.user.id;

        // Current KPIs (User Specific)
        const totalSentCount = await Transaction.count({ where: { userId, status: 'sent' } });
        const pendingCount = await Transaction.count({ where: { userId, status: 'pending' } });
        
        const totalSentGHS = await Transaction.sum('amount_sent', { 
            where: { userId, status: 'sent', type: 'GHS-CAD' } 
        }) || 0;

        const totalSentCAD = await Transaction.sum('amount_sent', { 
            where: { userId, status: 'sent', type: 'CAD-GHS' } 
        }) || 0;

        const volumeHistory = await Transaction.findAll({
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                [fn('SUM', col('amount_sent')), 'total_sent']
            ],
            where: {
                userId,
                createdAt: { [Op.gte]: thirtyDaysAgo }
            },
            group: [fn('DATE', col('createdAt'))],
            order: [[fn('DATE', col('createdAt')), 'ASC']]
        });

        // Time-series Transaction count (User Specific)
        const txHistory = await Transaction.findAll({
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                [fn('COUNT', col('id')), 'count']
            ],
            where: {
                userId,
                createdAt: { [Op.gte]: thirtyDaysAgo }
            },
            group: [fn('DATE', col('createdAt'))],
            order: [[fn('DATE', col('createdAt')), 'ASC']]
        });

        res.json({
            pendingCount,
            totalSentCount,
            totalSentGHS,
            totalSentCAD,
            successVolume: (totalSentGHS + totalSentCAD), // Legacy support if needed
            history: {
                volume: volumeHistory,
                transactions: txHistory
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createTransaction, getTransactions, getTransactionById, updateStatus, uploadProof, cancelTransaction, exportTransactions, getAdminStats, getUserStats, exportStats, assignVendor };
