const prisma = require('../utils/prisma');

exports.createBoard = async (req, res) => {
  try {
    const { name, teamId } = req.body;

    // 1) Verify user belongs to team
    const teamMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId: req.user.id,
          teamId,
        },
      },
    });

    if (!teamMember) {
      return res.status(403).json({ message: 'You do not have access to this team' });
    }

    // 2) Create board
    const board = await prisma.board.create({
      data: {
        name,
        teamId,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { board },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating board', error: err.message });
  }
};

exports.getBoards = async (req, res) => {
  try {
    const { teamId } = req.query;

    const boards = await prisma.board.findMany({
      where: {
        teamId,
        team: {
          members: {
            some: {
              userId: req.user.id,
            },
          },
        },
      },
      include: {
        lists: {
          include: {
            cards: true,
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      results: boards.length,
      data: { boards },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching boards', error: err.message });
  }
};
