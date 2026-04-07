const prisma = require('../utils/prisma');
const { getIO } = require('../socket/index');

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

    // 3) Broadcast to board room (using x-socket-id to avoid self-echo)
    const io = getIO();
    const socketId = req.headers['x-socket-id'];
    const room = `board:${boardId}`;

    const payload = { list: { ...list, cards: [] }, boardId };
    
    if (socketId) {
      io.to(room).except(socketId).emit('list:created', payload);
    } else {
      io.to(room).emit('list:created', payload);
    }
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

exports.updateList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { name, rank } = req.body;

    // RBAC: Only Admin can rename. Members can only reorder (rank).
    // req.memberRole is populated by the authorize middleware
    if (name && req.memberRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Only team admins can rename lists' });
    }

    const list = await prisma.list.update({
      where: { id: listId },
      data: { name, rank },
    });

    res.status(200).json({
      status: 'success',
      data: { list },
    });

    // Broadcast update
    const io = getIO();
    const socketId = req.headers['x-socket-id'];
    const room = `board:${list.boardId}`;

    if (socketId) {
      io.to(room).except(socketId).emit('list:updated', { list, boardId: list.boardId });
    } else {
      io.to(room).emit('list:updated', { list, boardId: list.boardId });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error updating list', error: err.message });
  }
};

exports.deleteList = async (req, res) => {
  try {
    const { listId } = req.params;

    const listToDelete = await prisma.list.findUnique({
      where: { id: listId },
    });

    if (!listToDelete) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Prisma will handle card deletion via CASCADE if configured, 
    // but better to be safe or explicit if not.
    await prisma.list.delete({
      where: { id: listId },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });

    // Broadcast deletion
    const io = getIO();
    const socketId = req.headers['x-socket-id'];
    const room = `board:${listToDelete.boardId}`;

    const payload = { listId, boardId: listToDelete.boardId };

    if (socketId) {
      io.to(room).except(socketId).emit('list:deleted', payload);
    } else {
      io.to(room).emit('list:deleted', payload);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error deleting list', error: err.message });
  }
};
