const express = require('express');
const plaidController = require('../controllers/plaidController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/create_link_token', plaidController.createLinkToken);
router.post('/set_access_token', plaidController.setAccessToken);
router.get('/transactions', plaidController.getTransactions);

module.exports = router;
