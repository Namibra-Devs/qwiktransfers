const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auditController = require('../controllers/auditController');
const rateAlertController = require('../controllers/rateAlertController');
const systemController = require('../controllers/systemController');
const { verifyToken, verifyAdmin, verifySuperAdmin } = require('../middleware/authMiddleware');
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
router.post('/payment-methods', verifyToken, verifySuperAdmin, systemController.updatePaymentMethod);
router.get('/config', verifyToken, verifySuperAdmin, systemController.getSystemConfig);
router.post('/config', verifyToken, verifySuperAdmin, systemController.updateSystemConfig);
router.post('/logo', verifyToken, verifySuperAdmin, upload.single('logo'), systemController.uploadLogo);

// Backup Routes
router.post('/backup/manual', verifyToken, verifySuperAdmin, systemController.manualBackup);
router.get('/backups', verifyToken, verifySuperAdmin, systemController.getBackupsList);
router.get('/backups/download/:filename', verifyToken, verifySuperAdmin, systemController.downloadBackup);

// Health Check Route
router.get('/health', verifyToken, verifySuperAdmin, systemController.getSystemHealth);

// Audit Log Routes (Admin Only)
router.get('/admin/audit-logs', verifyToken, verifySuperAdmin, auditController.getAuditLogs);
router.post('/admin/audit-logs/export', verifyToken, verifySuperAdmin, auditController.exportAuditLogs);
router.delete('/admin/audit-logs/cleanup', verifyToken, verifySuperAdmin, auditController.cleanupAuditLogs);

module.exports = router;
