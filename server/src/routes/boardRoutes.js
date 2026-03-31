const express = require('express');
const boardController = require('../controllers/boardController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // Protect all board routes

router.post('/', boardController.createBoard);
router.get('/', boardController.getBoards);

module.exports = router;
