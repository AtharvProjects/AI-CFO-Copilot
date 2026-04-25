const express = require('express');
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(auth);

// Apply strict AI rate limit
router.post('/', aiLimiter, chatController.handleChat);
router.post('/ask', aiLimiter, chatController.askQuick);

// History routes
router.get('/history/:agentId', chatController.getHistory);
router.delete('/clear/:agentId', chatController.clearHistory);

module.exports = router;
