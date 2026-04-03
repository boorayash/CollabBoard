const express = require('express');
const teamController = require('../controllers/teamController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // Protect all team routes

router.get('/members/:id', teamController.getTeamMembers);

router.post('/', teamController.createTeam);
router.get('/', teamController.getTeams);

router.get('/invitations', teamController.getInvitations);
router.post('/:id/invite', teamController.inviteMember);
router.delete('/:id/leave', teamController.leaveTeam);
router.post('/:id/respond', teamController.respondToInvitation);


module.exports = router;
