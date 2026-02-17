const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auditController = require('../controllers/auditController');
const rateAlertController = require('../controllers/rateAlertController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Notification Routes
router.get('/notifications', verifyToken, notificationController.getNotifications);
router.patch('/notifications/:id/read', verifyToken, notificationController.markAsRead);
router.post('/notifications/read-all', verifyToken, notificationController.markAllAsRead);

// Rate Alert Routes
router.get('/rate-alerts', verifyToken, rateAlertController.getMyAlerts);
router.post('/rate-alerts', verifyToken, rateAlertController.createAlert);
router.delete('/rate-alerts/:id', verifyToken, rateAlertController.deleteAlert);

// Audit Log Routes (Admin Only)
router.get('/admin/audit-logs', verifyToken, verifyAdmin, auditController.getAuditLogs);

module.exports = router;
