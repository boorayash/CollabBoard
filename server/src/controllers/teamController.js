const prisma = require('../utils/prisma');

exports.createTeam = async (req, res) => {
  try {
    const { name, projectName } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          name,
          members: {
            create: {
              userId: req.user.id,
              role: 'ADMIN',
              status: 'ACCEPTED',
            },
          },
        },
        include: {
          members: true,
        },
      });

      await tx.board.create({
        data: {
          name: projectName || 'Main Board',
          teamId: team.id,
          lists: {
            create: [
              { name: 'To Do', rank: 'a' },
              { name: 'In Progress', rank: 'b' },
              { name: 'Done', rank: 'c' },
            ]
          }
        },
      });

      return team;

    });

    res.status(201).json({
      status: 'success',
      data: { team: result },

    });
  } catch (err) {
    console.error('[teamController.createTeam] Error:', err);
    res.status(500).json({ message: 'Error creating team', error: err.message });
  }
};

exports.getTeams = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: req.user.id,
            status: 'ACCEPTED',

          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },

      },
    });

    res.status(200).json({
      status: 'success',
      results: teams.length,
      data: { teams },
    });
  } catch (err) {
    console.error('[teamController.getTeams] Error:', err);
    res.status(500).json({ message: 'Error fetching teams', error: err.message });
  }
};

exports.inviteMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { targetUserId } = req.body;

    // 1) Logic-level check for duplicate (D-10)
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: targetUserId,
          teamId,
        },
      },
    });

    if (existingMember) {
      if (existingMember.status === 'PENDING') {
         return res.status(400).json({ message: 'Invitation already sent and is pending' });
      }
      return res.status(400).json({ message: 'User is already a member of this team' });
    }

    const teamMember = await prisma.teamMember.create({
      data: {
        userId: targetUserId,
        teamId,
        role: 'MEMBER', // Default for invited users (D-03)
        status: 'PENDING',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      }
    });

    res.status(201).json({ status: 'success', data: { teamMember } });
  } catch (err) {
    res.status(500).json({ message: 'Error inviting member', error: err.message });
  }
};

exports.respondToInvitation = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { action } = req.body; // 'ACCEPT' or 'REJECT'

    if (action === 'ACCEPT') {
      const teamMember = await prisma.teamMember.update({
        where: {
          userId_teamId: {
            userId: req.user.id,
            teamId,
          },
        },
        data: { status: 'ACCEPTED' },
      });
      res.status(200).json({ status: 'success', data: { teamMember } });
    } else if (action === 'REJECT') {
      await prisma.teamMember.delete({
        where: {
          userId_teamId: {
            userId: req.user.id,
            teamId,
          },
        },
      });
      res.status(200).json({ status: 'success', message: 'Invitation rejected' });
    } else {
      res.status(400).json({ message: 'Invalid action' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error responding to invitation', error: err.message });
  }
};

exports.getInvitations = async (req, res) => {
  try {
    const invitations = await prisma.teamMember.findMany({
      where: {
        userId: req.user.id,
        status: 'PENDING',
      },
      include: {
        team: true,
      },
    });

    res.status(200).json({
      status: 'success',
      results: invitations.length,
      data: { invitations },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching invitations', error: err.message });
  }
};

exports.getTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;

    const members = await prisma.teamMember.findMany({
      where: { teamId, status: 'ACCEPTED' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.status(200).json({ data: { members } });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching members', error: err.message });
  }
};

exports.updateMemberRole = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const { role } = req.body;

    if (!['ADMIN', 'MEMBER'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be ADMIN or MEMBER' });
    }

    // Protection: If demoting self, ensure another admin exists (D-09)
    if (userId === req.user.id && role === 'MEMBER') {
       const adminCount = await prisma.teamMember.count({
         where: { teamId, role: 'ADMIN', status: 'ACCEPTED' }
       });
       if (adminCount <= 1) {
         return res.status(403).json({ message: 'Cannot demote the last admin. Promote another member first.' });
       }
    }

    const teamMember = await prisma.teamMember.update({
      where: {
        userId_teamId: { userId, teamId }
      },
      data: { role }
    });

    res.status(200).json({ status: 'success', data: { teamMember } });
  } catch (err) {
    res.status(500).json({ message: 'Error updating role', error: err.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { teamId, userId } = req.params;

    // Protection: Cannot remove last admin (D-09)
    const targetMember = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } }
    });

    if (targetMember && targetMember.role === 'ADMIN') {
      const adminCount = await prisma.teamMember.count({
        where: { teamId, role: 'ADMIN', status: 'ACCEPTED' }
      });
      if (adminCount <= 1) {
        return res.status(403).json({ message: 'Cannot remove the last admin. Promote another member first.' });
      }
    }

    await prisma.teamMember.delete({
      where: { userId_teamId: { userId, teamId } }
    });

    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(500).json({ message: 'Error removing member', error: err.message });
  }
};

exports.leaveTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    // Protection: Cannot leave if last admin (D-09)
    const membership = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } }
    });

    if (membership && membership.role === 'ADMIN') {
      const adminCount = await prisma.teamMember.count({
        where: { teamId, role: 'ADMIN', status: 'ACCEPTED' }
      });
      if (adminCount <= 1) {
        return res.status(403).json({ message: 'You are the last admin. You must promote someone else or delete the team before leaving.' });
      }
    }

    await prisma.teamMember.delete({
      where: {
        userId_teamId: { userId, teamId },
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'You have left the team',
    });
  } catch (err) {
    res.status(500).json({ message: 'Error leaving team', error: err.message });
  }
};
