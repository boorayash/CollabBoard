import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tooltip, Button } from '@mui/material';
import { Trash2, CheckCircle2, UserPlus, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteCard, updateCardDetails } from '../store/slices/boardSlice';
import ProgressBar from './ProgressBar';

const TaskCard = ({ card, listName, isDraggable = true }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    marginBottom: 8,
    cursor: isDraggable ? 'grab' : 'default',
  };

  // CB-006 — detect Done column
  const isDone = listName?.toLowerCase().replace(/\s+/g, '').includes('done');

  const onDeleteTask = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete task "${card.title}"?`)) {
      dispatch(deleteCard(card.id));
    }
  };

  const handleAssignToMe = (e) => {
    e.stopPropagation();
    if (currentUser) {
      dispatch(updateCardDetails({
        cardId: card.id,
        data: { assigneeId: currentUser.id }
      }));
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
      {...(isDraggable ? attributes : {})}
      {...(isDraggable ? listeners : {})}
      className={`glass-card animate-slide-in rounded-[28px] p-6 relative overflow-hidden ${isDragging ? 'dragging-state' : ''}`}
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

        <div className="flex ml-2 items-center">
          {card.assignee ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1d1d1f]/5 rounded-full border border-[#1d1d1f]/10">
              <User size={12} className="opacity-50" />
              <span className="text-[10px] font-bold text-[#1d1d1f]/70 truncate max-w-[80px]">
                {card.assignee.name.split(' ')[0]}
              </span>
            </div>
          ) : (
            <button
              onClick={handleAssignToMe}
              onPointerDown={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-[#007AFF] bg-[#007AFF]/10 hover:bg-[#007AFF]/20 rounded-full transition-colors border border-[#007AFF]/20"
            >
              <UserPlus size={12} />
              Assign to me
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
