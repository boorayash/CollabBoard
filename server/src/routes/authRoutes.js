const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.use(protect);
router.get('/users/search', authController.searchUsers);

module.exports = router;
