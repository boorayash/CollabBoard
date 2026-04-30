const prisma = require('../utils/prisma');
const { getIO } = require('../socket/index');

exports.createCard = async (req, res) => {
  try {
    const { title, description, listId, rank, priority, assigneeIds, category } = req.body;

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

    const member = list.board.team.members.find(
      (m) => m.userId === req.user.id
    );

    if (!member) {
      return res.status(403).json({ message: 'You do not have access to this board' });
    }

    // Default to creator if no assignees provided
    const finalAssigneeIds = (assigneeIds && assigneeIds.length > 0) ? assigneeIds : [req.user.id];

    // 2) Create card with multiple assignees
    const card = await prisma.card.create({
      data: {
        title,
        description,
        listId,
        rank,
        priority: priority || 'LOW',
        category,
        assignees: {
          connect: finalAssigneeIds.map(id => ({ id }))
        }
      },
      include: {
        assignees: { select: { id: true, name: true } }
      }
    });

    res.status(201).json({
      status: 'success',
      data: { card },
    });

    // 3) Broadcast
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
    const { title, description, priority, listId, rank, assigneeIds, category } = req.body;

    const currentCard = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        assignees: true,
        list: {
          include: {
            board: {
              include: {
                team: {
                  include: { members: true },
                },
              },
            },
          },
        },
      },
    });

    if (!currentCard) {
      return res.status(404).json({ message: 'Card not found' });
    }

    const member = currentCard.list.board.team.members.find(m => m.userId === req.user.id);
    if (!member) {
      return res.status(403).json({ message: 'You do not have access to this board' });
    }

    // Move permission: admin or any of the assignees
    const isMoving = (listId !== undefined && listId !== currentCard.listId) || 
                     (rank !== undefined && rank !== currentCard.rank);
                     
    const isAssignee = currentCard.assignees.some(a => a.id === req.user.id);

    if (isMoving && member.role !== 'ADMIN' && !isAssignee) {
      return res.status(403).json({ message: 'Only admins or assigned users can move this task' });
    }

    const dataToUpdate = {
      title,
      description,
      priority,
      listId,
      rank,
      category,
    };

    if (assigneeIds !== undefined) {
      dataToUpdate.assignees = {
        set: assigneeIds.map(id => ({ id }))
      };
    }

    const card = await prisma.card.update({
      where: { id: cardId },
      data: dataToUpdate,
      include: {
        assignees: { select: { id: true, name: true } }
      }
    });

    res.status(200).json({
      status: 'success',
      data: { card },
    });

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
