const { PaymentMethod, SystemConfig } = require('../models');
const fs = require('fs');
const path = require('path');
const backupService = require('../services/backupService');
const { logAction } = require('../services/auditService');

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

        // Audit log
        await logAction({
            userId: req.user.id,
            action: 'UPDATE_PAYMENT_METHOD',
            details: `Admin updated payment method: ${type} (${currency})`,
            ipAddress: req.ip
        });
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

        // Audit log
        await logAction({
            userId: req.user.id,
            action: 'UPDATE_SYSTEM_CONFIG',
            details: `Admin updated system config: ${key} = ${typeof value === 'object' ? JSON.stringify(value) : value}`,
            ipAddress: req.ip
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const uploadLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const newLogoPath = `uploads/${req.file.filename}`;

        // Find existing logo config
        let logoConfig = await SystemConfig.findOne({ where: { key: 'system_logo' } });

        if (logoConfig) {
            // Delete old file if it exists
            const oldPath = path.join(__dirname, '..', logoConfig.value);
            if (fs.existsSync(oldPath)) {
                try {
                    fs.unlinkSync(oldPath);
                } catch (err) {
                    console.error('Failed to delete old logo:', err);
                }
            }
            logoConfig.value = newLogoPath;
            await logoConfig.save();
        } else {
            logoConfig = await SystemConfig.create({ key: 'system_logo', value: newLogoPath });
        }

        res.json({ message: 'Logo updated successfully', logo_url: newLogoPath });

        // Audit log
        await logAction({
            userId: req.user.id,
            action: 'UPDATE_SYSTEM_LOGO',
            details: `Admin uploaded new system logo: ${newLogoPath}`,
            ipAddress: req.ip
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const manualBackup = async (req, res) => {
    try {
        const result = await backupService.createBackup();
        res.json({ message: 'Backup created successfully', filename: result.filename });

        // Audit log
        await logAction({
            userId: req.user.id,
            action: 'SYSTEM_BACKUP_MANUAL',
            details: `Admin triggered manual system backup: ${result.filename}`,
            ipAddress: req.ip
        });
    } catch (error) {
        console.error('Manual backup failed:', error);
        res.status(500).json({ error: 'System backup failed. Ensure pg_dump is installed and configured.' });
    }
};

const getBackupsList = async (req, res) => {
    try {
        const backups = await backupService.getBackups();
        res.json(backups);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch backups' });
    }
};

const downloadBackup = async (req, res) => {
    try {
        const { filename } = req.params;
        const filepath = path.join(backupService.backupDir, filename);

        if (!fs.existsSync(filepath)) {
            return res.status(404).json({ error: 'Backup file not found' });
        }

        res.download(filepath);
    } catch (error) {
        res.status(500).json({ error: 'Download failed' });
    }
};

module.exports = {
    getPaymentMethods,
    updatePaymentMethod,
    getSystemConfig,
    updateSystemConfig,
    uploadLogo,
    manualBackup,
    getBackupsList,
    downloadBackup
};
