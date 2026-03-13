const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { verifyVendor } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = path.join(__dirname, '../uploads/proofs/');
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        cb(null, `vendor-proof-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

router.use(verifyVendor);

router.post('/toggle-status', vendorController.toggleStatus);
router.get('/pool', vendorController.getAvailablePool);
router.get('/transactions', vendorController.getHandledTransactions);
router.post('/accept', vendorController.acceptTransaction);
router.post('/reject', vendorController.rejectTransaction);
router.post('/complete', vendorController.completeTransaction);
router.post('/upload-proof', upload.single('proof'), vendorController.uploadVendorProof);

module.exports = router;
