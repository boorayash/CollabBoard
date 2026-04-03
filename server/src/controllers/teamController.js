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

      if (projectName) {
        await tx.board.create({
          data: {
            name: projectName,
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
      }

      return team;
    });

    res.status(201).json({
      status: 'success',
      data: { team: result },
    });
  } catch (err) {
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
    res.status(500).json({ message: 'Error fetching teams', error: err.message });
  }
};

exports.inviteMember = async (req, res) => {
  try {
    const { id: teamId } = req.params;
    const { targetUserId } = req.body;

    // Verify user is ADMIN of the team
    const adminMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: req.user.id,
          teamId,
        },
      },
    });

    if (!adminMember || adminMember.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only team admins can invite members' });
    }

    // Check if user is already a member or pending
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
         return res.status(400).json({ message: 'Invitation already sent' });
      }
      return res.status(400).json({ message: 'User is already a member' });
    }

    const teamMember = await prisma.teamMember.create({
      data: {
        userId: targetUserId,
        teamId,
        role: 'MEMBER',
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
    const { id: teamId } = req.params;
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
    const { id: teamId } = req.query.id ? req.query : req.params;

    const members = await prisma.teamMember.findMany({
      where: { teamId, status: 'ACCEPTED' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.status(200).json({ data: { members } });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching members', error: err.message });
  }
};

exports.leaveTeam = async (req, res) => {
  try {
    const { id: teamId } = req.params;

    await prisma.teamMember.delete({
      where: {
        userId_teamId: {
          userId: req.user.id,
          teamId,
        },
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
