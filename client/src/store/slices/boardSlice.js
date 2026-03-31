import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

export const fetchBoards = createAsyncThunk('board/fetchAll', async (teamId, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/boards?teamId=${teamId}`, {
      headers: getAuthHeader(),
    });
    return response.data.data.boards;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching boards');
  }
});

export const createBoard = createAsyncThunk('board/create', async (boardData, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/boards`, boardData, {
      headers: getAuthHeader(),
    });
    return response.data.data.board;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error creating board');
  }
});

const initialState = {
  boards: [],
  currentBoard: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    resetBoardState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
    setCurrentBoard: (state, action) => {
      state.currentBoard = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.boards = action.payload;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.boards.push(action.payload);
      });
  },
});

export const { resetBoardState, setCurrentBoard } = boardSlice.actions;
export default boardSlice.reducer;
