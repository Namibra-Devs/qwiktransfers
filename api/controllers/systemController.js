const { PaymentMethod, SystemConfig } = require('../models');

const getPaymentMethods = async (req, res) => {
    try {
        // Public endpoint: Fetch all active payment methods
        const methods = await PaymentMethod.findAll({
            where: { is_active: true }
        });
        res.json(methods);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updatePaymentMethod = async (req, res) => {
    try {
        // Admin endpoint: Update or Create a payment method
        const { type, currency, details, is_active } = req.body;

        if (!type || !currency) {
            return res.status(400).json({ error: 'Type and Currency are required' });
        }

        let method = await PaymentMethod.findOne({ where: { type, currency } });

        if (method) {
            method.details = details;
            method.is_active = is_active !== undefined ? is_active : method.is_active;
            await method.save();
        } else {
            method = await PaymentMethod.create({
                type,
                currency,
                details,
                is_active: is_active !== undefined ? is_active : true
            });
        }

        res.json({ message: 'Payment method updated', method });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getSystemConfig = async (req, res) => {
    try {
        const configs = await SystemConfig.findAll();
        const configMap = {};
        configs.forEach(c => {
            configMap[c.key] = c.value;
        });

        // Default tiered limits if not set
        if (!configMap['tiered_limits']) {
            configMap['tiered_limits'] = {
                level1: 50,
                level2: 500,
                level3: 5000
            };
        }

        res.json(configMap);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateSystemConfig = async (req, res) => {
    try {
        const { key, value } = req.body;

        if (!key) {
            return res.status(400).json({ error: 'Key is required' });
        }

        let config = await SystemConfig.findOne({ where: { key } });

        if (config) {
            config.value = value;
            await config.save();
        } else {
            config = await SystemConfig.create({ key, value });
        }

        res.json({ message: `System config ${key} updated`, config });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getPaymentMethods,
    updatePaymentMethod,
    getSystemConfig,
    updateSystemConfig
};
