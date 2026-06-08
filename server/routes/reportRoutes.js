const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { aiLimiter } = require('../middleware/rateLimiter');
const auth = require('../middleware/auth');

// Apply auth middleware to get real user data
router.get('/monthly', auth, aiLimiter, reportController.getMonthlyReportData);

module.exports = router;
