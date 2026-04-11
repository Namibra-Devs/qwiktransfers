const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, resendVerification, forgotPassword, resetPassword, getProfile, getAllUsers, updateKYCStatus, submitKYC, updateProfile, changePassword, setPin, verifyPin, updateUserRole,
    createVendor,
    createAdmin,
    updateUserRegion,
    toggleUserStatus,
    updateAvatar,
    updatePushToken,
    disableAccount,
    requestDeletion,
    generate2FA,
    verify2FA,
    disable2FA
} = require('../controllers/authController');
const { verifyToken, verifyAdmin, verifySuperAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', verifyToken, getProfile);
router.patch('/profile', verifyToken, updateProfile);
router.post('/change-password', verifyToken, changePassword);
router.post('/set-pin', verifyToken, setPin);
router.post('/verify-pin', verifyToken, verifyPin);

// Danger Zone
router.post('/disable-account', verifyToken, disableAccount);
router.post('/delete-account', verifyToken, requestDeletion);

// 2FA Routes
router.post('/2fa/generate', verifyToken, generate2FA);
router.post('/2fa/verify', verifyToken, verify2FA);
router.post('/2fa/disable', verifyToken, disable2FA);

router.get('/users', verifyAdmin, getAllUsers);
router.patch('/kyc/status', verifyAdmin, updateKYCStatus);
router.patch('/update-role', verifySuperAdmin, updateUserRole);
router.post('/create-vendor', verifySuperAdmin, createVendor);
router.post('/create-admin', verifySuperAdmin, createAdmin);
router.patch('/update-region', verifySuperAdmin, updateUserRegion);
router.patch('/toggle-status', verifyAdmin, toggleUserStatus);

// Avatar & Device Info
router.post('/avatar', verifyToken, upload.single('avatar'), updateAvatar);
router.post('/push-token', verifyToken, updatePushToken);

router.post('/kyc', verifyToken, upload.fields([
    { name: 'front', maxCount: 1 },
    { name: 'back', maxCount: 1 }
]), submitKYC);

module.exports = router;
