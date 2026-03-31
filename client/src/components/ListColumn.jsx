import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Box, Typography, Paper } from '@mui/material';
import TaskCard from './TaskCard';

const ListColumn = ({ list }) => {
  return (
    <Paper sx={{ width: 300, minHeight: 'fit-content', maxHeight: '80vh', p: 2, bgcolor: '#1e1e1e', border: '1px solid #333', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>{list.name}</Typography>
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <SortableContext items={list.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <TaskCard key={card.id} card={card} />
          ))}
        </SortableContext>
      </Box>
    </Paper>
  );
};

export default ListColumn;
