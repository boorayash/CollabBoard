const prisma = require('../utils/prisma');

exports.createList = async (req, res) => {
  try {
    const { name, boardId, rank } = req.body;

    // 1) Verify user belongs to board's team
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        team: {
          include: {
            members: true,
          },
        },
      },
    });

    const isMember = board.team.members.some(
      (m) => m.userId === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You do not have access to this board' });
    }

    // 2) Create list
    const list = await prisma.list.create({
      data: {
        name,
        boardId,
        rank,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { list },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating list', error: err.message });
  }
};

exports.getLists = async (req, res) => {
  try {
    const { boardId } = req.query;

    const lists = await prisma.list.findMany({
      where: {
        boardId,
        board: {
          team: {
            members: {
              some: {
                userId: req.user.id,
              },
            },
          },
        },
      },
      include: {
        cards: {
          orderBy: {
            rank: 'asc',
          },
        },
      },
      orderBy: {
        rank: 'asc',
      },
    });

    res.status(200).json({
      status: 'success',
      results: lists.length,
      data: { lists },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching lists', error: err.message });
  }
};
