import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const TaskCard = ({ card }) => {
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

  return (
    <Card 
      component={motion.div}
      layout
      whileHover={{ scale: 1.03 }}
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
      <CardContent sx={{ p: '14px !important' }}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#f8fafc' }}>{card.title}</Typography>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
