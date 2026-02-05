const express = require('express');
const router = express.Router();
const { register, login, getProfile, getAllUsers, updateKYC } = require('../controllers/authController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', verifyToken, getProfile);
router.get('/users', verifyAdmin, getAllUsers);
router.patch('/kyc/status', verifyAdmin, updateKYC);
router.post('/kyc', verifyToken, upload.single('document'), async (req, res) => {
    try {
        const user = await require('../models').User.findByPk(req.user.id);
        user.kyc_document = `/uploads/${req.file.filename}`;
        user.kyc_status = 'pending';
        await user.save();
        res.json({ message: 'KYC document uploaded', kyc_status: 'pending' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
