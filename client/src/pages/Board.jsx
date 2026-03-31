import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, CircularProgress } from '@mui/material';
import { logout } from '../store/slices/authSlice';
import KanbanBoard from '../components/KanbanBoard';

const Board = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // For MVP, we'll use a placeholder state if no real board exists yet
  const [lists, setLists] = useState([
    { id: 'l1', name: 'To Do', cards: [{ id: 'c1', title: 'Task 1' }, { id: 'c2', title: 'Task 2' }] },
    { id: 'l2', name: 'In Progress', cards: [{ id: 'c3', title: 'Task 3' }] },
    { id: 'l3', name: 'Done', cards: [] },
  ]);

  const onLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#121212' }}>
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
        <Typography variant="h6" fontWeight="bold">CollabBoard</Typography>
        <Box>
          <Button onClick={onLogout} color="error" variant="outlined" size="small">Logout</Button>
        </Box>
      </Box>

      {/* Kanban Area */}
      <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        <KanbanBoard initialData={lists} />
      </Box>
    </Box>
  );
};

export default Board;
