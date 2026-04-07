const prisma = require('../utils/prisma');
const { getIO } = require('../socket/index');

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

    // 3) Broadcast to board room (using x-socket-id to avoid self-echo)
    const io = getIO();
    const socketId = req.headers['x-socket-id'];
    const room = `board:${list.board.id}`;

    if (socketId) {
      io.to(room).except(socketId).emit('card:created', { card, listId, boardId: list.board.id });
    } else {
      io.to(room).emit('card:created', { card, listId, boardId: list.board.id });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error creating card', error: err.message });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { title, description, priority, listId, rank } = req.body;

    const card = await prisma.card.update({
      where: { id: cardId },
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

    // Broadcast card:updated (covers both title edits AND moves)
    const updatedList = await prisma.list.findUnique({
      where: { id: card.listId },
      include: { board: true },
    });
    const io = getIO();
    const socketId = req.headers['x-socket-id'];
    const room = `board:${updatedList.board.id}`;

    if (socketId) {
      io.to(room).except(socketId).emit('card:updated', { card, boardId: updatedList.board.id });
    } else {
      io.to(room).emit('card:updated', { card, boardId: updatedList.board.id });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error updating card', error: err.message });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;

    // Look up boardId BEFORE deleting
    const cardToDelete = await prisma.card.findUnique({
      where: { id: cardId },
      include: { list: { include: { board: true } } },
    });

    await prisma.card.delete({
      where: { id: cardId },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });

    // Broadcast card:deleted (AFTER response)
    if (cardToDelete) {
      const io = getIO();
      const socketId = req.headers['x-socket-id'];
      const room = `board:${cardToDelete.list.board.id}`;
      
      const payload = {
        cardId,
        listId: cardToDelete.listId,
        boardId: cardToDelete.list.board.id,
      };

      if (socketId) {
        io.to(room).except(socketId).emit('card:deleted', payload);
      } else {
        io.to(room).emit('card:deleted', payload);
      }
    }
  } catch (err) {
    res.status(500).json({ message: 'Error deleting card', error: err.message });
  }
};
