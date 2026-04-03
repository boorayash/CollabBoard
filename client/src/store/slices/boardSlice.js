import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.API_URL;

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

export const createList = createAsyncThunk('board/createList', async (listData, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/lists`, listData, {
      headers: getAuthHeader(),
    });
    return response.data.data.list;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error creating list');
  }
});

export const createCard = createAsyncThunk('board/createCard', async (cardData, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/cards`, cardData, {
      headers: getAuthHeader(),
    });
    return response.data.data.card;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error creating card');
  }
});

export const updateCardPosition = createAsyncThunk('board/updateCardPosition', async ({ cardId, data }, thunkAPI) => {
  try {
    const response = await axios.patch(`${API_URL}/cards/${cardId}`, data, {
      headers: getAuthHeader(),
    });
    return response.data.data.card;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error updating card position');
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
    // Optimistic update for Drag and Drop
    moveCardOptimistic: (state, action) => {
      const { activeId, overId, overContainerId } = action.payload;
      
      const currentBoard = state.boards.find(b => b.id === state.currentBoard?.id);
      if (!currentBoard) return;

      const activeList = currentBoard.lists.find(l => l.cards.find(c => c.id === activeId));
      const overList = currentBoard.lists.find(l => l.id === overContainerId);

      if (!activeList || !overList) return;

      const activeIndex = activeList.cards.findIndex(c => c.id === activeId);
      const [movedCard] = activeList.cards.splice(activeIndex, 1);
      
      movedCard.listId = overContainerId;
      
      const overIndex = overList.cards.findIndex(c => c.id === overId);
      const insertionIndex = overIndex >= 0 ? overIndex : overList.cards.length;
      
      overList.cards.splice(insertionIndex, 0, movedCard);
    }
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
      })
      .addCase(createList.fulfilled, (state, action) => {
        const board = state.boards.find(b => b.id === action.payload.boardId);
        if (board) {
          if (!board.lists) board.lists = [];
          board.lists.push({ ...action.payload, cards: [] });
        }
      })
      .addCase(createCard.fulfilled, (state, action) => {
        const board = state.boards.find(b => b.lists?.find(l => l.id === action.payload.listId));
        if (board) {
          const list = board.lists.find(l => l.id === action.payload.listId);
          if (list) {
            if (!list.cards) list.cards = [];
            list.cards.push(action.payload);
            list.cards.sort((a, b) => a.rank.localeCompare(b.rank));
          }
        }
      })
      .addCase(updateCardPosition.fulfilled, (state, action) => {
        const board = state.boards.find(b => b.lists?.find(l => l.cards?.find(c => c.id === action.payload.id))) || state.boards[0];
        if (board) {
          // Remove from old list internally
          board.lists.forEach(list => {
            if (list.cards) {
              list.cards = list.cards.filter(c => c.id !== action.payload.id);
            }
          });
          // Add to new list
          const targetList = board.lists.find(l => l.id === action.payload.listId);
          if (targetList) {
            if (!targetList.cards) targetList.cards = [];
            targetList.cards.push(action.payload);
            targetList.cards.sort((a, b) => a.rank.localeCompare(b.rank));
          }
        }
      });
  },
});

export const { resetBoardState, setCurrentBoard, moveCardOptimistic } = boardSlice.actions;
export default boardSlice.reducer;
