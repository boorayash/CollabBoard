const prisma = require('../utils/prisma');

const setupChatRooms = (socket, io) => {
  // Join a team's chat room
  socket.on('join_team_chat', async (teamId) => {
    try {
      // Verify membership
      const teamMember = await prisma.teamMember.findUnique({
        where: { userId_teamId: { userId: socket.userId, teamId } }
      });
      if (!teamMember) return;

      const roomName = `team_chat_${teamId}`;
      socket.join(roomName);
    } catch (error) {
      console.error('Error joining team chat:', error);
    }
  });

  // Leave a team's chat room
  socket.on('leave_team_chat', (teamId) => {
    socket.leave(`team_chat_${teamId}`);
  });

  // Handle new message
  socket.on('send_message', async (data) => {
    try {
      const { teamId, content } = data;

      // Verify membership
      const teamMember = await prisma.teamMember.findUnique({
        where: { userId_teamId: { userId: socket.userId, teamId } }
      });
      if (!teamMember) return;

      // Save to DB
      const message = await prisma.teamMessage.create({
        data: {
          content,
          teamId,
          userId: socket.userId,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });

      // Broadcast to room
      io.to(`team_chat_${teamId}`).emit('receive_message', message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });
};

module.exports = { setupChatRooms };
