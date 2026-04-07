import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, Typography, IconButton, Stack, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { deleteCard } from '../store/slices/boardSlice';

const TaskCard = ({ card }) => {
  const dispatch = useDispatch();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    marginBottom: 8,
    cursor: 'grab',
  };

  const onDeleteTask = (e) => {
    e.stopPropagation(); // Prevent drag start if clicking delete
    if (window.confirm(`Delete task "${card.title}"?`)) {
      dispatch(deleteCard(card.id));
    }
  };

  return (
    <Card 
      component={motion.div}
      layout
      whileHover="hover"
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      sx={{ 
        bgcolor: '#1e293b', 
        border: '1px solid var(--glass-border)', 
        borderRadius: 2,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        '&:hover': { 
          border: '1px solid var(--color-primary)',
          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)' 
        } 
      }}
    >
      <CardContent sx={{ p: '14px !important', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#f8fafc', flexGrow: 1 }}>{card.title}</Typography>
        
        <motion.div variants={{ initial: { opacity: 0 }, hover: { opacity: 1 } }} initial="initial">
          <Tooltip title="Delete Task">
            <IconButton 
              size="small" 
              onClick={onDeleteTask}
              onPointerDown={(e) => e.stopPropagation()} // Vital for dnd-kit compatibility
              sx={{ 
                color: 'rgba(255,255,255,0.2)', 
                ml: 1, p: 0.5,
                '&:hover': { color: '#ff4444', background: 'rgba(255,68,68,0.1)' } 
              }}
            >
              <Trash2 size={14} />
            </IconButton>
          </Tooltip>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
