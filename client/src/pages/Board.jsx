import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, TextField, Stack } from '@mui/material';
import { logout } from '../store/slices/authSlice';
import { fetchBoards, createList, createBoard } from '../store/slices/boardSlice';
import KanbanBoard from '../components/KanbanBoard';
import { getInitialRank } from '../utils/ranks';

const Board = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [newBoardName, setNewBoardName] = useState('');

  const { user } = useSelector((state) => state.auth);
  const { boards, isLoading } = useSelector((state) => state.board);
  
  const teamId = user?.teamId;
  const board = boards.find((b) => b.id === id) || boards[0];

  useEffect(() => {
    if (teamId) {
      dispatch(fetchBoards(teamId));
    }
  }, [dispatch, teamId]);

  const onCreateBoard = () => {
    if (newBoardName.trim() && teamId) {
      dispatch(createBoard({ name: newBoardName, teamId }));
      setNewBoardName('');
    }
  };

  const onAddList = () => {
    const name = prompt('Enter list name:');
    if (name && board) {
      dispatch(createList({ name, boardId: board.id, rank: getInitialRank(board.lists?.length || 0) }));
    }
  };

  const onLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#121212', color: 'white' }}>
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
        <Typography variant="h6" fontWeight="bold">CollabBoard</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#aaa' }}>{user?.name}</Typography>
          <Button onClick={onLogout} color="error" variant="outlined" size="small">Logout</Button>
        </Box>
      </Box>

      {/* Kanban Area */}
      <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: board ? 'flex-start' : 'center' }}>
        {isLoading ? (
          <CircularProgress />
        ) : board ? (
          <>
            <KanbanBoard initialData={board.lists || []} />
            <Button 
              onClick={onAddList} 
              variant="dashed" 
              sx={{ minWidth: 200, ml: 2, height: 50, border: '1px dashed #444', color: '#999' }}
            >
              + Add List
            </Button>
          </>
        ) : (
          <Stack spacing={3} alignItems="center" sx={{ mt: 10 }}>
             <Typography variant="h5" color="grey.400">Welcome to CollabBoard!</Typography>
             <Typography color="grey.600">You don't have any boards yet. Create your first one to get started.</Typography>
             <Stack direction="row" spacing={1}>
                <TextField 
                  size="small" 
                  placeholder="Board Name (e.g. Sprint 1)" 
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  sx={{ 
                    bgcolor: '#1e1e1e', 
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': { color: 'white' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444' }
                  }}
                />
                <Button variant="contained" onClick={onCreateBoard} disabled={!newBoardName.trim()}>
                  Create Board
                </Button>
             </Stack>
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default Board;
