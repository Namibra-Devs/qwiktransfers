const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Public route to submit inquiry
// We use an optional verifyToken to log the user if they are logged in
const { optionalVerifyToken } = require('../middleware/authMiddleware');

// Add optionalVerifyToken to middleware if not exists, for now just use skip or handle in controller
// Let's assume verifyToken is strict. For public form, we might not need it.
// I'll check authMiddleware.js to see if there's an optional version.

router.post('/inquiry', (req, res, next) => {
    // Basic middleware to attach user if token exists but don't block
    const token = req.headers['authorization']?.split(' ')[1];
    if (token) {
        const jwt = require('jsonwebtoken');
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (e) {
            // ignore
        }
    }
    next();
}, supportController.submitInquiry);

router.get('/inquiries', verifyToken, verifyAdmin, supportController.getInquiries);
router.patch('/inquiries/:id', verifyToken, verifyAdmin, supportController.updateInquiryStatus);

module.exports = router;
