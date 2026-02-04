const express = require('express');
const router = express.Router();
const { createTransaction, getTransactions, updateStatus } = require('../controllers/transactionController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.post('/', verifyToken, createTransaction);
router.get('/', verifyToken, getTransactions);
router.patch('/:id/status', verifyAdmin, updateStatus);

module.exports = router;
