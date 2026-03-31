const express = require('express');
const cardController = require('../controllers/cardController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // Protect all card routes

router.post('/', cardController.createCard);
router.patch('/:id', cardController.updateCard);
router.delete('/:id', cardController.deleteCard);

module.exports = router;
