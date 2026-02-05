const express = require('express');
const router = express.Router();
const { createTransaction, getTransactions, updateStatus, uploadProof } = require('../controllers/transactionController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', verifyToken, createTransaction);
router.get('/', verifyToken, getTransactions);
router.patch('/:id/status', verifyAdmin, updateStatus);
router.post('/:id/upload-proof', verifyToken, upload.single('proof'), uploadProof);

module.exports = router;
