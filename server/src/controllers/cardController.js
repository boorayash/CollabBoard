const prisma = require('../utils/prisma');

exports.createCard = async (req, res) => {
  try {
    const { title, description, listId, rank, priority } = req.body;

    // 1) Verify user belongs to list's board team
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        board: {
          include: {
            team: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    const isMember = list.board.team.members.some(
      (m) => m.userId === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You do not have access to this board' });
    }

    // 2) Create card
    const card = await prisma.card.create({
      data: {
        title,
        description,
        listId,
        rank,
        priority: priority || 'LOW',
      },
    });

    res.status(201).json({
      status: 'success',
      data: { card },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating card', error: err.message });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, listId, rank } = req.body;

    const card = await prisma.card.update({
      where: { id },
      data: {
        title,
        description,
        priority,
        listId,
        rank,
      },
    });

    res.status(200).json({
      status: 'success',
      data: { card },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating card', error: err.message });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.card.delete({
      where: { id },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting card', error: err.message });
  }
};
