import { getSocket } from './socketClient';
import { store } from '../store/index';

export const setupBoardListeners = () => {
  const socket = getSocket();
  if (!socket) return;

  // Remove any existing listeners first (prevent duplicates on re-mount)
  cleanupBoardListeners();

  // Refinement #1: Standardized event names — entity:past-tense
  socket.on('card:created', (data) => {
    store.dispatch({ type: 'board/socketCardCreated', payload: data });
  });

  socket.on('card:updated', (data) => {
    store.dispatch({ type: 'board/socketCardUpdated', payload: data });
  });

  socket.on('card:deleted', (data) => {
    store.dispatch({ type: 'board/socketCardDeleted', payload: data });
  });

  socket.on('list:created', (data) => {
    store.dispatch({ type: 'board/socketListCreated', payload: data });
  });

  socket.on('list:updated', (data) => {
    store.dispatch({ type: 'board/socketListUpdated', payload: data });
  });

  socket.on('list:deleted', (data) => {
    store.dispatch({ type: 'board/socketListDeleted', payload: data });
  });

  socket.on('board:updated', (data) => {
    store.dispatch({ type: 'board/socketBoardUpdated', payload: data });
  });

  socket.on('board:deleted', (data) => {
    store.dispatch({ type: 'board/socketBoardDeleted', payload: data });
    // Dispatch a standard board delete that the React lifecycle will react to
    // and push them away from the component
    window.location.href = '/dashboard';
  });
};

export const cleanupBoardListeners = () => {
  const socket = getSocket();
  if (!socket) return;
  socket.off('card:created');
  socket.off('card:updated');
  socket.off('card:deleted');
  socket.off('list:created');
  socket.off('list:updated');
  socket.off('list:deleted');
  socket.off('board:updated');
  socket.off('board:deleted');
};
