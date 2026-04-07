const express = require('express');
const { protect, authorize } = require('../middlewares/authMiddleware');
const teamController = require('../controllers/teamController');

const router = express.Router();

router.use(protect); // Protect all team routes

// Self actions / Global actions (no team context needed for auth)
router.post('/', teamController.createTeam);
router.get('/', teamController.getTeams);
router.get('/invitations', teamController.getInvitations);

// Team-specific routes — :teamId is always explicit
router.get('/:teamId/members', authorize(), teamController.getTeamMembers);
router.post('/:teamId/invite', authorize('ADMIN'), teamController.inviteMember);
router.patch('/:teamId/members/:userId', authorize('ADMIN'), teamController.updateMemberRole);
router.delete('/:teamId/members/:userId', authorize('ADMIN'), teamController.removeMember);
router.delete('/:teamId/leave', teamController.leaveTeam);
router.post('/:teamId/respond', teamController.respondToInvitation);

module.exports = router;
