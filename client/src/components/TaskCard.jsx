import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tooltip, Menu, MenuItem, Checkbox, ListItemText } from '@mui/material';
import { Trash2, CheckCircle2, UserPlus, Plus } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { deleteCard, updateCardDetails } from '../store/slices/boardSlice';
import ProgressBar from './ProgressBar';
import ConfirmDialog from './ConfirmDialog';

// DND-PERM-01/02: deterministic color for assignee avatar and category
const stringToColor = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 55%)`;
};

// TASK-ASSIGN-01/02/03 — accept isAdmin + currentUserId for permission-aware DnD
const TaskCard = ({ card, listName, isAdmin, currentUserId, teamMembers = [] }) => {
  const dispatch = useDispatch();
  const [assignMenuAnchor, setAssignMenuAnchor] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const openAssignMenu = Boolean(assignMenuAnchor);

  const handleOpenAssignMenu = (e) => {
    e.stopPropagation();
    setAssignMenuAnchor(e.currentTarget);
  };

  const handleCloseAssignMenu = (e) => {
    if (e) e.stopPropagation();
    setAssignMenuAnchor(null);
  };

  const handleToggleAssignee = (userId) => {
    const currentIds = card.assignees?.map(a => a.id) || [];
    const newIds = currentIds.includes(userId)
      ? currentIds.filter(id => id !== userId)
      : [...currentIds, userId];
    
    dispatch(updateCardDetails({ cardId: card.id, data: { assigneeIds: newIds } }));
  };

  // DND-PERM-01: member can only drag their own assigned cards; admin can drag all
  const isAssignee = card.assignees?.some(a => a.id === currentUserId);
  const canDrag = isAdmin || isAssignee;

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: card.id, disabled: !canDrag });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    marginBottom: 8,
    cursor: canDrag ? 'grab' : 'default',
  };

  // CB-006 — detect Done column
  const isDone = listName?.toLowerCase().replace(/\s+/g, '').includes('done');

  const onDeleteTask = (e) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteCard(card.id));
    setDeleteDialogOpen(false);
  };

  const handleAssignToMe = (e) => {
    e.stopPropagation();
    if (currentUserId) {
      handleToggleAssignee(currentUserId);
    }
  };

  // Priority
  const priorityColors = { HIGH: '#FF3B30', MEDIUM: '#FFCC00', LOW: '#34C759' };
  const priorityLabels = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' };
  const resolvedPriority = (card.priority || 'LOW').toUpperCase();

  // CB-006 overrides for Done column
  const displayPriorityColor = isDone ? '#9ca3af' : (priorityColors[resolvedPriority] ?? '#9ca3af');
  const hash = card.id ? card.id.length + card.title.length : 1;
  const progressValue = isDone ? 100 : (hash * 13) % 100;
  const progressColor = isDone ? '#97C459' : (priorityColors[resolvedPriority] ?? '#9ca3af');

  const acceptedMembers = teamMembers.filter(m => m.status === 'ACCEPTED');
  const catColor = card.category ? stringToColor(card.category) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`glass-card group animate-slide-in rounded-[28px] p-6 relative overflow-hidden
        ${isDragging ? 'dragging-state' : ''}
        ${!canDrag ? 'opacity-80' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-wrap gap-2">
          {/* Category badge with Color Notation */}
          {card.category && (
            <span
              className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5"
              style={{
                backgroundColor: `${catColor}18`,
                color: catColor,
                border: `1px solid ${catColor}33`
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
              {card.category}
            </span>
          )}
          {isDone && (
             <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#97C459]18 text-[#97C459] border border-[#97C459]33">
               Done
             </span>
          )}
        </div>

        {isDone ? (
          <Tooltip title="Completed">
            <span className="text-[#97C459] bg-[#97C459]/10 rounded-full p-1.5 flex items-center">
              <CheckCircle2 size={14} />
            </span>
          </Tooltip>
        ) : (isAdmin || isAssignee) ? (
          <Tooltip title="Delete Task">
            <button
              onClick={onDeleteTask}
              onPointerDown={(e) => e.stopPropagation()}
              className="text-gray-400 hover:text-red-500 transition-colors bg-black/5 hover:bg-black/10 rounded-full p-1.5"
            >
              <Trash2 size={14} />
            </button>
          </Tooltip>
        ) : null}
      </div>

      <h3 className="text-[17px] font-semibold leading-snug mb-3">
        {card.title}
      </h3>

      <ProgressBar progress={progressValue} color={progressColor} />

      <div className="mt-5 flex justify-between items-center">
        {/* Priority dot + label (moved here only) */}
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: displayPriorityColor }}
          />
          <span className={`text-[11px] font-medium ${isDone ? 'opacity-40' : 'opacity-60'}`}>
            {isDone ? 'Completed' : (priorityLabels[resolvedPriority] ?? 'Low')}
          </span>
        </div>

        {/* Multi-user Avatar stack or Assign logic */}
        <div className="flex ml-2 items-center">
          {card.assignees && card.assignees.length > 0 ? (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {card.assignees.map((assignee) => (
                  <Tooltip key={assignee.id} title={assignee.name}>
                    <div
                      className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white select-none shrink-0"
                      style={{ backgroundColor: stringToColor(assignee.id) }}
                    >
                      {assignee.name?.charAt(0).toUpperCase()}
                    </div>
                  </Tooltip>
                ))}
              </div>
              
              {isAdmin && (
                <button
                  onClick={handleOpenAssignMenu}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-6 h-6 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#1d1d1f]/40 transition-all ml-1"
                >
                  <Plus size={12} />
                </button>
              )}
            </div>
          ) : (
            isAdmin ? (
              /* Admin: Custom Styled "Assign to..." Menu */
              <div className="flex items-center">
                <button
                  onClick={handleOpenAssignMenu}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-[#007AFF] bg-[#007AFF]/10 hover:bg-[#007AFF]/20 rounded-full transition-colors border border-[#007AFF]/20"
                >
                  <UserPlus size={12} />
                  Assign to...
                </button>
              </div>
            ) : (
              /* Member: "Assign to me" button */
              <button
                onClick={handleAssignToMe}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-[#007AFF] bg-[#007AFF]/10 hover:bg-[#007AFF]/20 rounded-full transition-colors border border-[#007AFF]/20"
              >
                <UserPlus size={12} />
                Assign to me
              </button>
            )
          )}

          {/* Shared Admin Assignment Menu (Multi-select) */}
          <Menu
            anchorEl={assignMenuAnchor}
            open={openAssignMenu}
            onClose={handleCloseAssignMenu}
            onClick={(e) => e.stopPropagation()}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 180,
                bgcolor: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
                color: '#1d1d1f',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                borderRadius: '16px',
                '& .MuiMenuItem-root': {
                  py: 1,
                  px: 1.5,
                  fontSize: '12px',
                  '&:hover': { bgcolor: 'rgba(0, 122, 255, 0.1)' }
                }
              }
            }}
          >
            {acceptedMembers.map(m => {
              const isSelected = card.assignees?.some(a => a.id === m.userId);
              return (
                <MenuItem key={m.userId} onClick={() => handleToggleAssignee(m.userId)}>
                  <Checkbox 
                    checked={isSelected} 
                    size="small"
                    sx={{ p: 0.5, color: '#007AFF', '&.Mui-checked': { color: '#007AFF' } }}
                  />
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white mx-2"
                    style={{ backgroundColor: stringToColor(m.userId) }}
                  >
                    {(m.user?.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <ListItemText 
                    primary={m.user?.name || m.userId} 
                    primaryTypographyProps={{ fontSize: '12px', fontWeight: 600 }}
                  />
                </MenuItem>
              );
            })}
          </Menu>
        </div>
      </div>

      <ConfirmDialog 
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Task?"
        message={`Are you sure you want to delete "${card.title}"? This action cannot be undone.`}
        confirmText="Delete Task"
        type="danger"
      />
    </div>
  );
};

export default TaskCard;
