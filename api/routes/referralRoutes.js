const express = require('express');
const router = express.Router();
const { getReferralStats, getReferredUsers } = require('../controllers/referralController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getReferralStats);
router.get('/users', protect, getReferredUsers);

module.exports = router;
