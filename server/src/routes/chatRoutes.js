const express = require('express');
const router = express.Router();
const { getMessages, toggleSaveMessage } = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/:teamId', getMessages);
router.put('/:messageId/toggle-save', toggleSaveMessage);

module.exports = router;
