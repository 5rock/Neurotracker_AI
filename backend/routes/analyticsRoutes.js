const express = require('express');
const router = express.Router();
const {
  getDashboard, getHeatmap, getRetentionCurve, getLeaderboard
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/heatmap', getHeatmap);
router.get('/retention', getRetentionCurve);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
