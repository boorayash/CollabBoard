import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import boardReducer from './slices/boardSlice';
import teamReducer from './slices/teamSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    board: boardReducer,
    team: teamReducer,
    chat: chatReducer,
  },
});
