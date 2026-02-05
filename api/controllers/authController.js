const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            password: hashedPassword,
            role: role || 'user',
            kyc_status: 'pending',
            balance_ghs: 0.0,
            balance_cad: 0.0
        });
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.json({ user, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password'] } });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateKYC = async (req, res) => {
    try {
        const { userId, status } = req.body;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        user.kyc_status = status;
        await user.save();
        res.json({ message: 'KYC status updated', kyc_status: status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login, getProfile, getAllUsers, updateKYC };
