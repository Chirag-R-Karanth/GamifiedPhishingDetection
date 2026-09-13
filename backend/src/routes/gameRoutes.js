const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/scenarios', authMiddleware, gameController.getScenarios);
router.get('/daily-challenge', authMiddleware, gameController.getDailyChallenge);
router.post('/submit-answer', authMiddleware, gameController.submitAnswer);
router.get('/leaderboard', authMiddleware, gameController.getLeaderboard);

module.exports = router;
