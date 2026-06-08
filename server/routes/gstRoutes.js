const express = require('express');
const router = express.Router();
const gstController = require('../controllers/gstController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/summary', gstController.getGstSummary);

module.exports = router;
