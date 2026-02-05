const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { email, password, role, country } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            password: hashedPassword,
            role: role || 'user',
            country: country || 'Ghana',
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

const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        res.json(user);
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

const updateProfile = async (req, res) => {
    try {
        const { full_name, phone } = req.body;
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.full_name = full_name;
        user.phone = phone;
        await user.save();

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Current password incorrect' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const setPin = async (req, res) => {
    try {
        const { pin } = req.body;
        if (!/^\d{4}$/.test(pin)) {
            return res.status(400).json({ error: 'PIN must be 4 digits' });
        }
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.transaction_pin = await bcrypt.hash(pin, 10);
        await user.save();

        res.json({ message: 'Transaction PIN set successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const verifyPin = async (req, res) => {
    try {
        const { pin } = req.body;
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (!user.transaction_pin) return res.status(400).json({ error: 'Transaction PIN not set' });

        const isMatch = await bcrypt.compare(pin, user.transaction_pin);
        if (!isMatch) return res.status(401).json({ error: 'Invalid PIN' });

        res.json({ message: 'PIN verified' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login, getProfile, getAllUsers, updateKYC, updateProfile, changePassword, setPin, verifyPin };
