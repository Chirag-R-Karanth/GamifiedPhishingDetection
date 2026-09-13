const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/metrics', authMiddleware, mlController.getModelPerformance);
router.post('/retrain', authMiddleware, mlController.retrainModels);

module.exports = router;
