const cron = require('node-cron');
const { Rate, RateAlert, User } = require('./models');
const { createNotification } = require('./services/notificationService');
const { sendSMS } = require('./services/smsService');
const axios = require('axios');

const checkRatesAndAlert = async () => {
    try {
        console.log('Running Rate Watcher...');

        // Load target pair
        const rateRecord = await Rate.findOne({ where: { pair: 'GHS-CAD' } });
        if (!rateRecord) return;

        let marketRateCADtoGHS = null;
        try {
            const response = await axios.get('https://api.exchangerate-api.com/v4/latest/CAD');
            marketRateCADtoGHS = response.data.rates.GHS;
        } catch (apiError) {
            console.error('API Error in Rate Watcher:', apiError.message);
            return;
        }

        // marketRateCADtoGHS is e.g. 15.5
        // Users might set alerts for "When 1 CAD is above 15.0 GHS"

        const activeAlerts = await RateAlert.findAll({ where: { isActive: true }, include: [{ model: User, as: 'user' }] });

        for (const alert of activeAlerts) {
            const target = parseFloat(alert.targetRate);
            const current = parseFloat(marketRateCADtoGHS);
            let triggered = false;

            if (alert.direction === 'above' && current >= target) {
                triggered = true;
            } else if (alert.direction === 'below' && current <= target) {
                triggered = true;
            }

            if (triggered) {
                console.log(`Alert triggered for User ${alert.userId}: ${current} ${alert.direction} ${target}`);

                const message = `Rate Alert: The CAD to GHS rate is now ${current.toFixed(2)}. This matches your target of ${target.toFixed(2)} (${alert.direction}).`;

                // 1. In-app notification
                await createNotification({
                    userId: alert.userId,
                    type: 'RATE_ALERT',
                    message
                });

                // 2. SMS (Optionally based on user preference or just send for high importance)
                if (alert.user && alert.user.phone) {
                    await sendSMS(alert.user.phone, message).catch(err => console.error("Alert SMS failed:", err));
                }

                // Deactivate alert to prevent spamming? 
                // Or set a cooldown. For now, let's keep it active but maybe the user deletes it.
                // Re-notifying every hour might be annoying. Let's deactivate it for now.
                alert.isActive = false;
                await alert.save();
            }
        }
    } catch (error) {
        console.error('Rate Watcher Error:', error);
    }
};

// Run every hour
const startRateWatcher = () => {
    cron.schedule('0 * * * *', checkRatesAndAlert);
    console.log('Hourly Rate Watcher scheduled.');

    // Also run once on startup for immediate feedback if alert condition is met
    checkRatesAndAlert();
};

module.exports = { startRateWatcher };
