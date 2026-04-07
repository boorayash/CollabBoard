const prisma = require('../utils/prisma');
const { getIO } = require('../socket/index');

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
      data: { 
        boards,
        role: req.memberRole // Populated by authorize middleware
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching boards', error: err.message });
  }
};

exports.updateBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { name } = req.body;

    const board = await prisma.board.update({
      where: { id: boardId },
      data: { name },
    });

    res.status(200).json({
      status: 'success',
      data: { board },
    });

    // Broadcast board:updated
    const io = getIO();
    const socketId = req.headers['x-socket-id'];
    const room = `board:${boardId}`;
    const payload = { boardId, name, teamId: board.teamId };

    if (socketId) {
      io.to(room).except(socketId).emit('board:updated', payload);
    } else {
      io.to(room).emit('board:updated', payload);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error updating board', error: err.message });
  }
};

exports.deleteBoard = async (req, res) => {
  try {
    const { boardId } = req.params;

    // IMPORTANT: Fetch board context BEFORE deletion
    const boardToDelete = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!boardToDelete) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const { teamId } = boardToDelete;

    await prisma.board.delete({
      where: { id: boardId },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });

    // Broadcast board:deleted WITH context
    const io = getIO();
    const socketId = req.headers['x-socket-id'];
    const room = `board:${boardId}`;
    const payload = { boardId, teamId };

    if (socketId) {
      io.to(room).except(socketId).emit('board:deleted', payload);
    } else {
      io.to(room).emit('board:deleted', payload);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error deleting board', error: err.message });
  }
};
