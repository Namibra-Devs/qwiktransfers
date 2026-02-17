const { RateAlert } = require('../models');
const { createNotification } = require('../services/notificationService');

const createAlert = async (req, res) => {
    try {
        const { targetRate, direction } = req.body;
        const alert = await RateAlert.create({
            userId: req.user.id,
            targetRate,
            direction: direction || 'above',
            isActive: true
        });

        // Add in-app notification
        await createNotification({
            userId: req.user.id,
            type: 'RATE_ALERT',
            message: `Rate Watcher Set: We will notify you when 1 CAD reaches ${parseFloat(targetRate).toFixed(2)} GHS (${direction || 'above'}).`
        });

        res.status(201).json(alert);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMyAlerts = async (req, res) => {
    try {
        const alerts = await RateAlert.findAll({
            where: { userId: req.user.id }
        });
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteAlert = async (req, res) => {
    try {
        const { id } = req.params;
        await RateAlert.destroy({
            where: { id, userId: req.user.id }
        });
        res.json({ message: 'Alert deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createAlert, getMyAlerts, deleteAlert };
