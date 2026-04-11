const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { verifyToken, verifySuperAdmin } = require('../middleware/authMiddleware');

// Public/Authenticated routes
router.get('/', verifyToken, announcementController.getUserAnnouncements);
router.post('/:id/dismiss', verifyToken, announcementController.dismissAnnouncement);

// Admin-only routes
router.get('/admin', verifyToken, verifySuperAdmin, announcementController.getAdminAnnouncements);
router.post('/admin', verifyToken, verifySuperAdmin, announcementController.createAnnouncement);
router.delete('/admin/:id', verifyToken, verifySuperAdmin, announcementController.deleteAnnouncement);

module.exports = router;
