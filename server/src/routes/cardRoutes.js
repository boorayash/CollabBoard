const express = require('express');
const cardController = require('../controllers/cardController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // Protect all card routes

// POST /cards — listId from body, ADMIN + MEMBER
router.post('/', authorize('ADMIN', 'MEMBER'), cardController.createCard);

// PATCH /cards/:cardId — cardId in param, middleware resolves teamId
router.patch('/:cardId', authorize('ADMIN', 'MEMBER'), cardController.updateCard);

// DELETE /cards/:cardId — cardId in param, ADMIN + MEMBER
router.delete('/:cardId', authorize('ADMIN', 'MEMBER'), cardController.deleteCard);

module.exports = router;
