const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const authMiddleware = require('../middleware/authMiddleware');
const authOptionalMiddleware = require('../middleware/authOptionalMiddleware');

router.post('/scan', authOptionalMiddleware, emailController.scanEmail);
router.get('/history', authMiddleware, emailController.getScanHistory);

module.exports = router;
