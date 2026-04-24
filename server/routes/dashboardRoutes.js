const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', dashboardController.getDashboardData);

module.exports = router;
