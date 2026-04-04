import { getSocket } from './socketClient';
import { store } from '../store/index';

// Track the current user's pending actions to prevent duplicate updates (Option A)
// Refinement #2: pendingActions are always added AFTER API response (consistent timing)
let pendingActions = new Set();

export const addPendingAction = (actionKey) => {
  pendingActions.add(actionKey);
  // Auto-cleanup after 5 seconds (safety net for missed events)
  setTimeout(() => pendingActions.delete(actionKey), 5000);
};

export const setupBoardListeners = () => {
  const socket = getSocket();
  if (!socket) return;

  // Remove any existing listeners first (prevent duplicates on re-mount)
  socket.off('card:created');
  socket.off('card:updated');
  socket.off('card:deleted');
  socket.off('list:created');

  // Refinement #1: Standardized event names — entity:past-tense
  socket.on('card:created', (data) => {
    const key = `card:created:${data.card.id}`;
    if (pendingActions.has(key)) {
      pendingActions.delete(key);
      return; // This user created it — already handled by API response
    }
    store.dispatch({ type: 'board/socketCardCreated', payload: data });
  });

  // Refinement #4: card:updated handles both title edits AND moves (no separate card:moved)
  socket.on('card:updated', (data) => {
    const key = `card:updated:${data.card.id}`;
    if (pendingActions.has(key)) {
      pendingActions.delete(key);
      return;
    }
    store.dispatch({ type: 'board/socketCardUpdated', payload: data });
  });

  socket.on('card:deleted', (data) => {
    const key = `card:deleted:${data.cardId}`;
    if (pendingActions.has(key)) {
      pendingActions.delete(key);
      return;
    }
    store.dispatch({ type: 'board/socketCardDeleted', payload: data });
  });

  socket.on('list:created', (data) => {
    const key = `list:created:${data.list.id}`;
    if (pendingActions.has(key)) {
      pendingActions.delete(key);
      return;
    }
    store.dispatch({ type: 'board/socketListCreated', payload: data });
  });
};

export const cleanupBoardListeners = () => {
  const socket = getSocket();
  if (!socket) return;
  socket.off('card:created');
  socket.off('card:updated');
  socket.off('card:deleted');
  socket.off('list:created');
};
