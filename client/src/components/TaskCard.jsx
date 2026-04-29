import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tooltip } from '@mui/material';
import { Trash2, CheckCircle2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { deleteCard } from '../store/slices/boardSlice';
import ProgressBar from './ProgressBar';

const TaskCard = ({ card, listName }) => {
  const dispatch = useDispatch();
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    marginBottom: 8,
    cursor: 'grab',
  };

  // CB-006 — detect Done column
  const isDone = listName?.toLowerCase().replace(/\s+/g, '').includes('done');

  const onDeleteTask = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete task "${card.title}"?`)) {
      dispatch(deleteCard(card.id));
    }
  };

  // Priority — use real card.priority if available, fallback to hash-based mock
  const priorityOptions = ['High', 'Medium', 'Low'];
  const priorityColors = { High: '#FF3B30', Medium: '#FFCC00', Low: '#34C759' };
  const hash = card.id ? card.id.length + card.title.length : 1;
  const resolvedPriority = card.priority || priorityOptions[hash % priorityOptions.length];

  // CB-006 overrides for Done column
  const displayPriorityColor = isDone ? '#9ca3af' : priorityColors[resolvedPriority] ?? '#9ca3af';
  const progressValue         = isDone ? 100 : (hash * 13) % 100;
  const progressColor         = isDone ? '#97C459' : priorityColors[resolvedPriority] ?? '#9ca3af';

  const tagBg      = 'bg-[#007AFF]/10';
  const tagColor   = 'text-[#007AFF]';
  const tagContent = 'DESIGN';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`glass-card animate-slide-in rounded-[28px] p-6 cursor-grab relative overflow-hidden ${isDragging ? 'dragging-state' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${tagBg} ${tagColor}`}>
          {tagContent}
        </span>

        {isDone ? (
          /* CB-006 optional check icon for Done cards */
          <Tooltip title="Completed">
            <span className="text-[#97C459] bg-[#97C459]/10 rounded-full p-1.5 flex items-center">
              <CheckCircle2 size={14} />
            </span>
          </Tooltip>
        ) : (
          <Tooltip title="Delete Task">
            <button
              onClick={onDeleteTask}
              onPointerDown={(e) => e.stopPropagation()}
              className="text-gray-400 hover:text-red-500 transition-colors bg-black/5 hover:bg-black/10 rounded-full p-1.5"
            >
              <Trash2 size={14} />
            </button>
          </Tooltip>
        )}
      </div>

      <h3 className="text-[17px] font-semibold leading-snug mb-3">
        {card.title}
      </h3>

      <ProgressBar progress={progressValue} color={progressColor} />

      <div className="mt-5 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: displayPriorityColor }}
          />
          <span className={`text-[11px] font-medium ${isDone ? 'opacity-40' : 'opacity-60'}`}>
            {isDone ? 'Done' : resolvedPriority}
          </span>
        </div>

        <div className="flex ml-2">
          {[
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=64&q=80',
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&q=80'
          ].map((avatar, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full border-2 border-white -ml-2 bg-cover bg-center"
              style={{ backgroundImage: `url(${avatar})` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
