const express = require('express');
const boardController = require('../controllers/boardController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // Protect all board routes

// GET /boards?teamId=xxx — needs teamId from query
router.get('/', authorize('ADMIN', 'MEMBER'), boardController.getBoards);

// POST /boards — teamId comes from body
router.post('/', authorize('ADMIN', 'MEMBER'), boardController.createBoard);

// PATCH /boards/:boardId — boardId in param, middleware resolves teamId
router.patch('/:boardId', authorize('ADMIN'), boardController.updateBoard);

// DELETE /boards/:boardId — boardId in param, middleware resolves teamId
router.delete('/:boardId', authorize('ADMIN'), boardController.deleteBoard);

module.exports = router;
