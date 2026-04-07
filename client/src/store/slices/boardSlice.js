import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getSocket } from '../../socket/socketClient';

const API_URL = import.meta.env.API_URL;

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const headers = user?.token ? { Authorization: `Bearer ${user.token}` } : {};
  const socket = getSocket();
  if (socket?.id) {
    headers['x-socket-id'] = socket.id;
  }
  return headers;
};

export const fetchBoards = createAsyncThunk('board/fetchAll', async (teamId, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/boards?teamId=${teamId}`, {
      headers: getAuthHeader(),
    });
    return {
      boards: response.data.data.boards,
      role: response.data.data.role
    };
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

export const deleteList = createAsyncThunk('board/deleteList', async (listId, thunkAPI) => {
  try {
    await axios.delete(`${API_URL}/lists/${listId}`, {
      headers: getAuthHeader(),
    });
    return listId;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error deleting list');
  }
});

export const deleteCard = createAsyncThunk('board/deleteCard', async (cardId, thunkAPI) => {
  try {
    await axios.delete(`${API_URL}/cards/${cardId}`, {
      headers: getAuthHeader(),
    });
    return cardId;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error deleting card');
  }
});

const initialState = {
  boards: [],
  role: null, // Current user's role in the team (ADMIN or MEMBER)
  currentBoard: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  boardDeleted: null, // Stores ID of deleted board if user was viewing it
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
    },

    // === Socket-driven reducers (for other users' updates) ===

    socketCardCreated: (state, action) => {
      const { card, listId, boardId } = action.payload;
      const board = state.boards.find(b => b.id === boardId);
      if (board) {
        const list = board.lists?.find(l => l.id === listId);
        if (list) {
          if (!list.cards) list.cards = [];
          // Avoid duplicates
          if (!list.cards.find(c => c.id === card.id)) {
            list.cards.push(card);
            list.cards.sort((a, b) => a.rank.localeCompare(b.rank));
          }
        }
      }
    },

    socketCardUpdated: (state, action) => {
      const { card, boardId } = action.payload;
      const board = state.boards.find(b => b.id === boardId);
      if (!board) return;

      // Remove card from its current list (handles moves)
      board.lists?.forEach(list => {
        if (list.cards) {
          list.cards = list.cards.filter(c => c.id !== card.id);
        }
      });

      // Add card to its (possibly new) list
      const targetList = board.lists?.find(l => l.id === card.listId);
      if (targetList) {
        if (!targetList.cards) targetList.cards = [];
        targetList.cards.push(card);
        targetList.cards.sort((a, b) => a.rank.localeCompare(b.rank));
      }
    },

    socketCardDeleted: (state, action) => {
      const { cardId, listId, boardId } = action.payload;
      const board = state.boards.find(b => b.id === boardId);
      if (board) {
        const list = board.lists?.find(l => l.id === listId);
        if (list?.cards) {
          list.cards = list.cards.filter(c => c.id !== cardId);
        }
      }
    },

    socketListCreated: (state, action) => {
      const { list, boardId } = action.payload;
      const board = state.boards.find(b => b.id === boardId);
      if (board) {
        if (!board.lists) board.lists = [];
        // Avoid duplicates
        if (!board.lists.find(l => l.id === list.id)) {
          board.lists.push(list);
          board.lists.sort((a, b) => a.rank.localeCompare(b.rank));
        }
      }
    },

    socketListDeleted: (state, action) => {
      const { listId, boardId } = action.payload;
      const board = state.boards.find(b => b.id === boardId);
      if (board && board.lists) {
        board.lists = board.lists.filter(l => l.id !== listId);
      }
    },

    socketListUpdated: (state, action) => {
      const { list, boardId } = action.payload;
      const board = state.boards.find(b => b.id === boardId);
      if (board && board.lists) {
        const index = board.lists.findIndex(l => l.id === list.id);
        if (index !== -1) {
          board.lists[index] = { ...board.lists[index], ...list };
          board.lists.sort((a, b) => a.rank.localeCompare(b.rank));
        }
      }
    },

    socketBoardUpdated: (state, action) => {
      const { boardId, name } = action.payload;
      const board = state.boards.find(b => b.id === boardId);
      if (board) {
        board.name = name;
      }
    },

    socketBoardDeleted: (state, action) => {
      const { boardId } = action.payload;
      // If we are viewing THIS board, trigger redirection
      const viewingDeletedBoard = state.boards.some(b => b.id === boardId);
      if (viewingDeletedBoard) {
        state.boardDeleted = boardId;
      }
      state.boards = state.boards.filter(b => b.id !== boardId);
    },

    resetBoardDeleted: (state) => {
      state.boardDeleted = null;
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
        state.boards = action.payload.boards;
        state.role = action.payload.role;
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
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        state.boards.forEach(board => {
          if (board.lists) {
            board.lists = board.lists.filter(l => l.id !== action.payload);
          }
        });
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        state.boards.forEach(board => {
          board.lists?.forEach(list => {
            if (list.cards) {
              list.cards = list.cards.filter(c => c.id !== action.payload);
            }
          });
        });
      });
  },
});

export const {
  resetBoardState, setCurrentBoard, moveCardOptimistic,
  socketCardCreated, socketCardUpdated, socketCardDeleted,
  socketListCreated, socketListDeleted, socketListUpdated,
  socketBoardUpdated, socketBoardDeleted, resetBoardDeleted
} = boardSlice.actions;
export default boardSlice.reducer;
