const express = require('express');
const router = express.Router();
const { getReferralStats, getReferredUsers } = require('../controllers/referralController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/stats', verifyToken, getReferralStats);
router.get('/users', verifyToken, getReferredUsers);

module.exports = router;
