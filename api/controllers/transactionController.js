const { Transaction, User, Rate } = require('../models');

const createTransaction = async (req, res) => {
    try {
        const { amount_sent, recipient_details, type } = req.body;
        const userId = req.user.id;

        // Fetch latest rate (mocked for now or fetched from Rate model)
        const rateRecord = await Rate.findOne({ where: { pair: 'GHS-CAD' } });
        const exchange_rate = rateRecord ? rateRecord.rate : 0.10; // Default fallback

        const amount_received = amount_sent * exchange_rate; // Simplified calculation

        const transaction = await Transaction.create({
            userId,
            type: type || 'GHS-CAD',
            amount_sent,
            exchange_rate,
            amount_received,
            recipient_details,
            status: 'pending',
            proof_url: '' // To be updated via separate upload endpoint
        });

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTransactions = async (req, res) => {
    try {
        const where = {};
        if (req.user.role !== 'admin') {
            where.userId = req.user.id;
        }
        const transactions = await Transaction.findAll({ where, include: ['user'] });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const transaction = await Transaction.findByPk(id);

        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

        transaction.status = status;
        await transaction.save();

        // specific logic for status changes (e.g. notify user) can go here

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createTransaction, getTransactions, updateStatus };
