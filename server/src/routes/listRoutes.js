const express = require('express');
const listController = require('../controllers/listController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // Protect all list routes

// GET /lists?boardId=xxx — boardId from query, no authorize needed (just protect)
router.get('/', listController.getLists);

// POST /lists — boardId comes from body, ADMIN only
router.post('/', authorize('ADMIN'), listController.createList);

// PATCH /lists/:listId — listId in param, middleware resolves teamId
router.patch('/:listId', authorize('ADMIN', 'MEMBER'), listController.updateList);

// DELETE /lists/:listId — listId in param, ADMIN only
router.delete('/:listId', authorize('ADMIN'), listController.deleteList);

module.exports = router;
