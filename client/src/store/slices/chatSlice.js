import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.API_URL}/chat`;

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (teamId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}/${teamId}`, config);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const toggleSaveMessage = createAsyncThunk(
  'chat/toggleSaveMessage',
  async (messageId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(`${API_URL}/${messageId}/toggle-save`, {}, config);
      return response.data; // The updated message
    } catch (error) {
      const message = error.response?.data?.error || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    currentTeamId: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    receiveMessage: (state, action) => {
      // Check if message already exists to avoid duplicates
      // Also ensure the message belongs to the currently active team chat
      if (state.currentTeamId && action.payload.teamId !== state.currentTeamId) {
        return;
      }
      
      const exists = state.messages.find(m => m.id === action.payload.id);
      if (!exists) {
        state.messages.push(action.payload);
      }
    },
    updateMessageStatus: (state, action) => {
      const index = state.messages.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    },
    resetChat: (state) => {
      state.messages = [];
      state.currentTeamId = null;
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state, action) => {
        state.isLoading = true;
        state.currentTeamId = action.meta.arg; // action.meta.arg contains the teamId passed to fetchMessages
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(toggleSaveMessage.fulfilled, (state, action) => {
        const index = state.messages.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.messages[index] = action.payload;
        }
      });
  },
});

export const { receiveMessage, updateMessageStatus, resetChat } = chatSlice.actions;
export default chatSlice.reducer;
