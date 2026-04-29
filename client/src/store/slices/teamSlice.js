import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { logout } from './authSlice';

const API_URL = import.meta.env.API_URL;

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

// Async Thunks

export const fetchMyTeams = createAsyncThunk('team/fetchMyTeams', async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/teams`, {
      headers: getAuthHeader(),
    });
    return response.data.data.teams;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching teams');
  }
});

export const searchUsers = createAsyncThunk('team/searchUsers', async ({ query, exact = false }, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/auth/users/search`, {
      params: { query, exact },
      headers: getAuthHeader(),
    });
    return response.data.data.users;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error searching users');
  }
});

export const fetchTeamMembers = createAsyncThunk('team/fetchTeamMembers', async (teamId, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/teams/${teamId}/members`, {
      headers: getAuthHeader(),
    });
    return response.data.data.members;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching members');
  }
});

export const createTeam = createAsyncThunk('team/createTeam', async (teamData, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/teams`, teamData, {
      headers: getAuthHeader(),
    });
    return response.data.data.team;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error creating team');
  }
});

export const inviteMember = createAsyncThunk('team/inviteMember', async ({ teamId, targetUserId }, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/teams/${teamId}/invite`, { targetUserId }, {
      headers: getAuthHeader(),
    });
    return response.data.data.teamMember;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error inviting member');
  }
});

export const fetchInvitations = createAsyncThunk('team/fetchInvitations', async (_, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/teams/invitations`, {
      headers: getAuthHeader(),
    });
    return response.data.data.invitations;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching invitations');
  }
});

export const leaveTeam = createAsyncThunk('team/leaveTeam', async (teamId, thunkAPI) => {
  try {
    const response = await axios.delete(`${API_URL}/teams/${teamId}/leave`, {
      headers: getAuthHeader(),
    });
    return { teamId };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error leaving team');
  }
});

export const respondToInvite = createAsyncThunk('team/respondToInvite', async ({ teamId, action }, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/teams/${teamId}/respond`, { action }, {
      headers: getAuthHeader(),
    });
    return { teamId, action, teamMember: response.data.data?.teamMember };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error responding to invitation');
  }
});

export const removeMember = createAsyncThunk('team/removeMember', async ({ teamId, userId }, thunkAPI) => {
  try {
    await axios.delete(`${API_URL}/teams/${teamId}/members/${userId}`, {
      headers: getAuthHeader(),
    });
    return userId;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error removing member');
  }
});

export const updateMemberRole = createAsyncThunk('team/updateRole', async ({ teamId, userId, role }, thunkAPI) => {
  try {
    const response = await axios.patch(`${API_URL}/teams/${teamId}/members/${userId}`, { role }, {
      headers: getAuthHeader(),
    });
    return response.data.data.teamMember;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error updating role');
  }
});

const initialState = {
  myTeams: [],
  invitations: [],
  searchResults: [],
  teamMembers: [],
  currentTeam: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    resetTeamState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    setCurrentTeam: (state, action) => {
      state.currentTeam = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Teams
      .addCase(fetchMyTeams.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyTeams.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.myTeams = action.payload;
      })
      .addCase(fetchMyTeams.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create Team
      .addCase(createTeam.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.myTeams.push(action.payload);
        state.currentTeam = action.payload;
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Fetch Team Members
      .addCase(fetchTeamMembers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teamMembers = action.payload;
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Fetch Invitations
      .addCase(fetchInvitations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInvitations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invitations = action.payload;
      })
      .addCase(fetchInvitations.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Respond to Invite
      .addCase(respondToInvite.fulfilled, (state, action) => {
        const { teamId, action: responseAction } = action.payload;
        // Remove from invitations list
        state.invitations = state.invitations.filter(inv => inv.teamId !== teamId);
        // If accepted, we might want to refetch teams or add it optimisticly, but usually refetch is safer.
        // We will handle refetching in the component or add a boolean flag.
      })
      // Leave Team
      .addCase(leaveTeam.fulfilled, (state, action) => {
        const { teamId } = action.payload;
        state.myTeams = state.myTeams.filter(team => team.id !== teamId);
        if (state.currentTeam?.id === teamId) {
          state.currentTeam = null;
        }
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        state.teamMembers = state.teamMembers.filter(m => m.userId !== action.payload);
      })
      .addCase(updateMemberRole.fulfilled, (state, action) => {
        const index = state.teamMembers.findIndex(m => m.userId === action.payload.userId);
        if (index !== -1) {
          state.teamMembers[index] = { 
            ...state.teamMembers[index], 
            ...action.payload 
          };
        }
      })
      // Bug 2 fix: clear all team data when user logs out
      .addCase(logout, () => initialState);
  },
});

export const { resetTeamState, clearSearchResults, setCurrentTeam } = teamSlice.actions;
export default teamSlice.reducer;
