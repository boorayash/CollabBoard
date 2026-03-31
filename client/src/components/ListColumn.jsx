import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useDispatch } from 'react-redux';
import { createCard } from '../store/slices/boardSlice';
import TaskCard from './TaskCard';
import { getInitialRank } from '../utils/ranks';

const ListColumn = ({ list }) => {
  const dispatch = useDispatch();
  const { setNodeRef } = useDroppable({ id: list.id });

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
    <Paper sx={{ width: 300, minHeight: 'fit-content', maxHeight: '80vh', p: 2, bgcolor: '#1e1e1e', border: '1px solid #333', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>{list.name}</Typography>
      <Box ref={setNodeRef} sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <SortableContext items={list.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <TaskCard key={card.id} card={card} />
          ))}
        </SortableContext>
      </Box>
      <Button 
        onClick={onAddTask} 
        fullWidth 
        sx={{ mt: 1, color: '#999', justifyContent: 'flex-start', textTransform: 'none' }}
      >
        + Add Task
      </Button>
    </Paper>
  );
};

export default ListColumn;
