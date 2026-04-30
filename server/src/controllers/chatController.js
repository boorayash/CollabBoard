const prisma = require('../utils/prisma');

// Get all messages for a team
const getMessages = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    // Optional: check if user is in team
    const teamMember = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId: req.user.id, teamId } },
    });

    if (!teamMember) {
      return res.status(403).json({ error: 'You are not a member of this team' });
    }

    const messages = await prisma.teamMessage.findMany({
      where: { teamId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// Toggle the saved status of a message
const toggleSaveMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await prisma.teamMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Verify user is in the same team
    const teamMember = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId: req.user.id, teamId: message.teamId } },
    });

    if (!teamMember) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedMessage = await prisma.teamMessage.update({
      where: { id: messageId },
      data: { isSaved: !message.isSaved },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(updatedMessage);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessages,
  toggleSaveMessage,
};
