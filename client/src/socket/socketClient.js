import { io } from 'socket.io-client';

let socket = null;
let currentBoardId = null; // Track current board for reconnection

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Socket connects to the root server, not the /api path
  const baseURL = API_URL.replace('/api', '');

  socket = io(baseURL, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    // Refinement #3: On reconnect, rejoin the board room
    if (currentBoardId) {
      socket.emit('board:join', currentBoardId);
      console.log('Rejoined board room after reconnect:', currentBoardId);
    }
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentBoardId = null;
  }
};

export const joinBoard = (boardId) => {
  currentBoardId = boardId;
  if (socket?.connected) {
    socket.emit('board:join', boardId);
  }
};

export const leaveBoard = (boardId) => {
  if (currentBoardId === boardId) {
    currentBoardId = null;
  }
  if (socket?.connected) {
    socket.emit('board:leave', boardId);
  }
};
