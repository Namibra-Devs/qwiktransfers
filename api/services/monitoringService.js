const cron = require('node-cron');
const { Transaction, AuditLog, User, SystemConfig } = require('../models');
const { Op } = require('sequelize');
const { sendPushNotification } = require('./pushNotification');

const checkVolumeDrops = async () => {
    try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

        // Current 24h volume
        const currentVolume = await Transaction.sum('amount_sent', {
            where: {
                status: 'sent',
                createdAt: { [Op.gte]: twentyFourHoursAgo }
            }
        }) || 0;

        // Last 7 days volume for average
        const weeklyVolume = await Transaction.sum('amount_sent', {
            where: {
                status: 'sent',
                createdAt: { [Op.gte]: sevenDaysAgo, [Op.lt]: twentyFourHoursAgo }
            }
        }) || 0;

        const dailyAverage = weeklyVolume / 6; // Average of previous 6 days

        if (dailyAverage > 100 && currentVolume < (dailyAverage * 0.3)) {
            await alertAdmins(`⚠️ Alert: Transaction volume has dropped by over 70% compared to the weekly average.`, 'volume_drop');
        }
    } catch (error) {
        console.error('Volume check error:', error);
    }
};

const checkKYCSpikes = async () => {
    try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const rejectionCount = await AuditLog.count({
            where: {
                action: 'UPDATE_KYC_STATUS',
                details: { [Op.like]: '%rejected%' },
                createdAt: { [Op.gte]: oneHourAgo }
            }
        });

        if (rejectionCount >= 5) {
            await alertAdmins(`🚨 Alert: High KYC rejection rate detected (5+ rejections in the last hour).`, 'kyc_spike');
        }
    } catch (error) {
        console.error('KYC spike check error:', error);
    }
};

const checkAuditCleanup = async () => {
    try {
        const config = await SystemConfig.findOne({ where: { key: 'auto_audit_cleanup' } });
        if (config && config.value === 'true') {
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

            const deleted = await AuditLog.destroy({
                where: { createdAt: { [Op.lt]: ninetyDaysAgo } }
            });

            if (deleted > 0) {
                console.log(`Auto-cleaned ${deleted} audit logs.`);
            }
        }
    } catch (error) {
        console.error('Auto cleanup error:', error);
    }
};

const alertAdmins = async (message, type) => {
    const adminUsers = await User.findAll({
        where: { role: 'admin', expo_push_token: { [Op.ne]: null } }
    });

    for (const admin of adminUsers) {
        await sendPushNotification(admin.expo_push_token, 'System Alert', message, { type });
    }
};

const initMonitoring = () => {
    // Run checks hourly
    cron.schedule('0 * * * *', () => {
        console.log('Running hourly platform health checks...');
        checkVolumeDrops();
        checkKYCSpikes();
        checkAuditCleanup();
    });
};

module.exports = { initMonitoring };
