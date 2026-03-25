const { AuditLog, User } = require('../models');
const { Op } = require('sequelize');

const { exportToExcel } = require('../services/exportService');

const getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50, search = '', action = '' } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (action) {
            where.action = action;
        }

        if (search) {
            where[Op.or] = [
                { details: { [Op.like]: `%${search}%` } },
                { '$user.first_name$': { [Op.like]: `%${search}%` } },
                { '$user.middle_name$': { [Op.like]: `%${search}%` } },
                { '$user.last_name$': { [Op.like]: `%${search}%` } },
                { '$user.email$': { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: logs } = await AuditLog.findAndCountAll({
            where,
            include: [{ model: User, as: 'user', attributes: ['first_name', 'middle_name', 'last_name', 'email', 'role'] }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            logs,
            total: count,
            pages: Math.ceil(count / limit)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const exportAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.findAll({
            include: [{ model: User, as: 'user', attributes: ['first_name', 'middle_name', 'last_name', 'email'] }],
            order: [['createdAt', 'DESC']],
            limit: 5000 // Upper limit for safety
        });

        const columns = [
            { header: 'Date', key: 'createdAt', width: 25 },
            { header: 'User', key: 'userName', width: 25 },
            { header: 'Action', key: 'action', width: 20 },
            { header: 'Details', key: 'details', width: 50 },
            { header: 'IP Address', key: 'ipAddress', width: 20 }
        ];

        const data = logs.map(log => ({
            createdAt: log.createdAt,
            userName: log.user ? `${log.user.full_name} (${log.user.email})` : 'System',
            action: log.action,
            details: log.details,
            ipAddress: log.ipAddress
        }));

        const buffer = await exportToExcel(data, columns, 'Audit Logs');

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.xlsx');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const cleanupAuditLogs = async (req, res) => {
    try {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const deletedCount = await AuditLog.destroy({
            where: {
                createdAt: { [Op.lt]: ninetyDaysAgo }
            }
        });

        res.json({ message: `Successfully cleaned up ${deletedCount} old audit logs.`, deletedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAuditLogs, exportAuditLogs, cleanupAuditLogs };
