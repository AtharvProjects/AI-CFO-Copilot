const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', generalLimiter, authController.register);
router.post('/login', generalLimiter, authController.login);
router.get('/profile', auth, authController.getProfile);

module.exports = router;
