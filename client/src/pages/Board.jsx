import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, TextField, Stack, Skeleton } from '@mui/material';
import { fetchBoards, createList, createBoard } from '../store/slices/boardSlice';
import KanbanBoard from '../components/KanbanBoard';
import Sidebar from '../components/Sidebar';
import { Plus } from 'lucide-react';
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

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'row' }}>
      <Sidebar />

      {/* Kanban Area */}
      <Box sx={{ flexGrow: 1, p: 4, overflowX: 'auto', overflowY: 'hidden', display: 'flex', alignItems: 'flex-start', justifyContent: board ? 'flex-start' : 'center', position: 'relative' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', gap: 3, height: '100%', width: '100%' }}>
            <Skeleton variant="rounded" width={320} height={500} sx={{ bgcolor: 'var(--glass-bg)', borderRadius: 3 }} />
            <Skeleton variant="rounded" width={320} height={300} sx={{ bgcolor: 'var(--glass-bg)', borderRadius: 3 }} />
            <Skeleton variant="rounded" width={320} height={400} sx={{ bgcolor: 'var(--glass-bg)', borderRadius: 3 }} />
          </Box>
        ) : board ? (
          <>
            {(!board.lists || board.lists.length === 0) ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', width: '100%', gap: 3 }}>
                <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                  Create your first list
                </Typography>
                <Button 
                  onClick={onAddList} 
                  variant="contained" 
                  startIcon={<Plus size={20} />}
                  sx={{ 
                    bgcolor: 'var(--color-primary)', height: 48, px: 4, borderRadius: 2,
                    textTransform: 'none', fontSize: '1rem',
                    '&:hover': { bgcolor: '#6d28d9' },
                    '&:active': { transform: 'scale(0.98)' }
                  }}
                >
                Add List
                </Button>
              </Box>
            ) : (
              <>
                <KanbanBoard initialData={board.lists} />
                <Button 
                  onClick={onAddList} 
                  variant="outlined" 
                  startIcon={<Plus size={20} />}
                  sx={{ 
                    minWidth: 280, 
                    ml: 2, 
                    height: 56, 
                    borderRadius: 2,
                    border: '1px dashed var(--glass-border)', 
                    color: 'rgba(255,255,255,0.7)',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(var(--glass-blur))',
                    textTransform: 'none',
                    fontSize: '1rem',
                    flexShrink: 0,
                    '&:hover': {
                      background: 'rgba(255,255,255,0.1)',
                      borderColor: 'var(--color-secondary)'
                    },
                    '&:active': { transform: 'scale(0.98)' }
                  }}
                >
                Add List
                </Button>
              </>
            )}
          </>
        ) : (
          <Stack spacing={3} alignItems="center" sx={{ 
            mt: 10, p: 5, borderRadius: 3, 
            background: 'var(--glass-bg)', backdropFilter: 'blur(var(--glass-blur))',
            border: '1px solid var(--glass-border)'
           }}>
             <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>Welcome to CollabBoard!</Typography>
             <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>You don't have any boards yet. Create your first one to get started.</Typography>
             <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                <TextField 
                  size="small" 
                  fullWidth
                  placeholder="Board Name (e.g. Sprint 1)" 
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  sx={{ 
                    bgcolor: 'rgba(0,0,0,0.2)', 
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': { 
                      '& fieldset': { borderColor: 'var(--glass-border)' },
                      '&.Mui-focused fieldset': { borderColor: 'var(--color-primary)' }
                    },
                    input: { color: '#fff' }
                  }}
                />
                <Button 
                  variant="contained" 
                  onClick={onCreateBoard} 
                  disabled={!newBoardName.trim()}
                  sx={{ 
                    bgcolor: 'var(--color-primary)', textTransform: 'none',
                    '&:hover': { bgcolor: '#6d28d9' }
                  }}
                >
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
