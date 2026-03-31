import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, Typography } from '@mui/material';

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
    <Card ref={setNodeRef} style={style} {...attributes} {...listeners} sx={{ bgcolor: '#2c2c2c', border: '1px solid #444', '&:hover': { border: '1px solid #7c4dff' } }}>
      <CardContent sx={{ p: '12px !important' }}>
        <Typography variant="body2">{card.title}</Typography>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
