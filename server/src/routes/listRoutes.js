const express = require('express');
const listController = require('../controllers/listController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // Protect all list routes

router.post('/', listController.createList);
router.get('/', listController.getLists);

module.exports = router;
