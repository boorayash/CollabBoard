const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { setupBoardRooms } = require('./boardRooms');
const { setupChatRooms } = require('./chatRooms');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // In production, restrict to frontend URL
      methods: ['GET', 'POST'],
    },
  });

  // Authentication middleware — verify JWT from handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error: No token'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      socket.disconnect(true); // Automatically disconnect on invalid token
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId} (socket: ${socket.id})`);
    setupBoardRooms(socket, io);
    setupChatRooms(socket, io);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId} (socket: ${socket.id})`);
    });
  });
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

module.exports = { initSocket, getIO };
