const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// User Routes
router.post('/', verifyToken, upload.single('attachment'), complaintController.createComplaint);
router.get('/', verifyToken, complaintController.getUserComplaints);
router.get('/vendor', verifyToken, complaintController.getVendorComplaints);
router.patch('/:id', verifyToken, upload.single('attachment'), complaintController.updateUserComplaint);
router.delete('/:id', verifyToken, complaintController.cancelComplaint);

// Admin Routes
router.get('/admin', verifyToken, verifyAdmin, complaintController.getAllComplaints);
router.patch('/admin/:id', verifyToken, verifyAdmin, complaintController.updateComplaint);

module.exports = router;
