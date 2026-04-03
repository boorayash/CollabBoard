import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useDispatch } from 'react-redux';
import { Plus } from 'lucide-react';
import { createCard } from '../store/slices/boardSlice';
import TaskCard from './TaskCard';
import { getInitialRank } from '../utils/ranks';

const ListColumn = ({ list }) => {
  const dispatch = useDispatch();
  const { setNodeRef, isOver } = useDroppable({ id: list.id });

  const onAddTask = () => {
    const title = prompt('Enter task title:');
    if (title) {
      dispatch(createCard({ 
        title, 
        listId: list.id, 
        rank: getInitialRank(list.cards?.length || 0) 
      }));
    }
  };
  return (
    <Paper 
      sx={{ 
        width: 320, minHeight: 'fit-content', maxHeight: '80vh', p: 2, 
        background: 'var(--glass-bg)', 
        backdropFilter: 'blur(var(--glass-blur))',
        border: isOver ? '1px solid var(--color-primary)' : '1px solid var(--glass-border)',
        borderRadius: 3, 
        display: 'flex', flexDirection: 'column',
        boxShadow: isOver ? '0 0 15px rgba(124, 58, 237, 0.4)' : 'none',
        transition: 'all 0.2s ease'
      }}
    >
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, px: 1, letterSpacing: '0.2px' }}>{list.name}</Typography>
      <Box ref={setNodeRef} sx={{ flexGrow: 1, overflowY: 'auto', p: 1, minHeight: 50 }}>
        <SortableContext items={list.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {list.cards.length === 0 ? (
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', mt: 1, mb: 2 }}>
              No tasks yet
            </Typography>
          ) : (
            list.cards.map((card) => (
              <TaskCard key={card.id} card={card} />
            ))
          )}
        </SortableContext>
      </Box>
      <Button 
        onClick={onAddTask} 
        fullWidth 
        startIcon={<Plus size={16} />}
        sx={{ 
          mt: 1, 
          color: 'rgba(255,255,255,0.7)', 
          justifyContent: 'flex-start', 
          textTransform: 'none',
          borderRadius: 2,
          '&:hover': {
            background: 'rgba(255,255,255,0.05)',
            color: '#fff'
          }
        }}
      >
      Add Task
      </Button>
    </Paper>
  );
};

export default ListColumn;
