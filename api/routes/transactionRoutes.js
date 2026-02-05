const express = require('express');
const router = express.Router();
const { createTransaction, getTransactions, updateStatus } = require('../controllers/transactionController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', verifyToken, createTransaction);
router.get('/', verifyToken, getTransactions);
router.patch('/:id/status', verifyAdmin, updateStatus);

router.post('/:id/upload-proof', verifyToken, upload.single('proof'), async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await require('../models').Transaction.findByPk(id);
        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

        transaction.proof_url = `/uploads/${req.file.filename}`;
        await transaction.save();

        res.json({ message: 'Proof uploaded successfully', proof_url: transaction.proof_url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
