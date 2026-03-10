const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auditController = require('../controllers/auditController');
const rateAlertController = require('../controllers/rateAlertController');
const systemController = require('../controllers/systemController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Notification Routes
router.get('/notifications', verifyToken, notificationController.getNotifications);
router.patch('/notifications/:id/read', verifyToken, notificationController.markAsRead);
router.post('/notifications/read-all', verifyToken, notificationController.markAllAsRead);

// Rate Alert Routes
router.get('/rate-alerts', verifyToken, rateAlertController.getMyAlerts);
router.post('/rate-alerts', verifyToken, rateAlertController.createAlert);
router.delete('/rate-alerts/:id', verifyToken, rateAlertController.deleteAlert);

// System Settings Routes
router.get('/config/public', systemController.getPublicConfig);
router.get('/payment-methods', verifyToken, systemController.getPaymentMethods);
router.post('/payment-methods', verifyToken, verifyAdmin, systemController.updatePaymentMethod);
router.get('/config', verifyToken, verifyAdmin, systemController.getSystemConfig);
router.post('/config', verifyToken, verifyAdmin, systemController.updateSystemConfig);
router.post('/logo', verifyToken, verifyAdmin, upload.single('logo'), systemController.uploadLogo);

// Backup Routes
router.post('/backup/manual', verifyToken, verifyAdmin, systemController.manualBackup);
router.get('/backups', verifyToken, verifyAdmin, systemController.getBackupsList);
router.get('/backups/download/:filename', verifyToken, verifyAdmin, systemController.downloadBackup);

// Audit Log Routes (Admin Only)
router.get('/admin/audit-logs', verifyToken, verifyAdmin, auditController.getAuditLogs);
router.get('/admin/audit-logs/export', verifyToken, verifyAdmin, auditController.exportAuditLogs);
router.delete('/admin/audit-logs/cleanup', verifyToken, verifyAdmin, auditController.cleanupAuditLogs);

module.exports = router;
