const setupBoardRooms = (socket, io) => {
  // Join a board room
  socket.on('board:join', (boardId) => {
    // Leave any previous board room (user can only be in one board at a time)
    const currentRooms = Array.from(socket.rooms);
    currentRooms.forEach((room) => {
      if (room !== socket.id && room.startsWith('board:')) {
        socket.leave(room);
        console.log(`User ${socket.userId} left room ${room}`);
      }
    });

    const roomName = `board:${boardId}`;
    socket.join(roomName);
    console.log(`User ${socket.userId} joined room ${roomName}`);
  });

  // Leave a board room explicitly
  socket.on('board:leave', (boardId) => {
    const roomName = `board:${boardId}`;
    socket.leave(roomName);
    console.log(`User ${socket.userId} left room ${roomName}`);
  });
};

module.exports = { setupBoardRooms };
