const express = require('express');
const teamController = require('../controllers/teamController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // Protect all team routes

router.post('/', teamController.createTeam);
router.get('/', teamController.getTeams);

module.exports = router;
