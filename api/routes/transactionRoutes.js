const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', verifyToken, transactionController.createTransaction);
router.get('/', verifyToken, transactionController.getTransactions);
router.get('/stats', verifyToken, verifyAdmin, transactionController.getAdminStats);
router.get('/export', verifyToken, transactionController.exportTransactions);
router.get('/admin/stats/export', verifyToken, verifyAdmin, transactionController.exportStats);
router.patch('/:id/status', verifyToken, verifyAdmin, transactionController.updateStatus);
router.patch('/:id/cancel', verifyToken, transactionController.cancelTransaction);
router.post('/:id/upload-proof', verifyToken, upload.single('proof'), transactionController.uploadProof);
router.get('/:id', verifyToken, transactionController.getTransactionById);

module.exports = router;
