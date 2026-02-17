const { AuditLog, User } = require('../models');
const { Op } = require('sequelize');

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
                { '$user.full_name$': { [Op.like]: `%${search}%` } },
                { '$user.email$': { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: logs } = await AuditLog.findAndCountAll({
            where,
            include: [{ model: User, as: 'user', attributes: ['full_name', 'email', 'role'] }],
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

module.exports = { getAuditLogs };
