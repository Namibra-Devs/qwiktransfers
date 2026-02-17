const { AuditLog } = require('../models');

/**
 * Record an action in the audit log.
 * @param {Object} data - The log data
 * @param {Number} data.userId - ID of the user performing the action
 * @param {String} data.action - The action being performed (e.g., 'LOGIN', 'TRANSACTION_COMPLETE')
 * @param {String} data.details - JSON string or text describing the changes/actions
 * @param {String} data.ipAddress - IP address of the request
 */
const logAction = async ({ userId, action, details, ipAddress }) => {
    try {
        await AuditLog.create({
            userId,
            action,
            details: typeof details === 'object' ? JSON.stringify(details) : details,
            ipAddress
        });
    } catch (error) {
        console.error('Failed to record audit log:', error);
    }
};

module.exports = { logAction };
