const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/userValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);

// Protected routes
router.get('/profile', protect, getProfile);

module.exports = router;
