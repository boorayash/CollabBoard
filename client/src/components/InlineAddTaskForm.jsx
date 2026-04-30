import { useState, useEffect, useRef } from 'react';
import { X, UserPlus, Plus, Check } from 'lucide-react';
import { Menu, MenuItem, Checkbox, ListItemText } from '@mui/material';
import { useDispatch } from 'react-redux';
import { updateBoard } from '../store/slices/boardSlice';

const PRIORITIES = ['Low', 'Medium', 'High'];
const PRIORITY_COLORS = { Low: '#34C759', Medium: '#FFCC00', High: '#FF3B30' };

// Deterministic color for avatar and category
const stringToColor = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 55%)`;
};

// TASK-ASSIGN-01/02: all members can create; admins can assign to others
const InlineAddTaskForm = ({ onSubmit, onCancel, isAdmin, currentUserId, teamMembers = [], board }) => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('');
  const [assigneeIds, setAssigneeIds] = useState([]); // Array for multi-assignment
  const [assigneeMenuAnchor, setAssigneeMenuAnchor] = useState(null);
  
  // Category management
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const openAssignMenu = Boolean(assigneeMenuAnchor);
  const boardCategories = board?.categories || ["Design", "Development", "Bug", "Feature"];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Click-outside to cancel
  useEffect(() => {
    const handler = (e) => {
      if (openAssignMenu) return;
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onCancel();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onCancel, openAssignMenu]);

  const handleSave = () => {
    if (!title.trim()) {
      setError('Task title is required.');
      inputRef.current?.focus();
      return;
    }
    try {
      // Pass assigneeIds array; if empty, backend defaults to creator
      onSubmit(title.trim(), priority, assigneeIds, category || undefined);
      setError('');
    } catch {
      setError('Failed to save. Try again.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
    if (e.key === 'Escape') { onCancel(); }
  };

  const handleOpenAssignMenu = (e) => {
    setAssigneeMenuAnchor(e.currentTarget);
  };

  const handleCloseAssignMenu = () => {
    setAssigneeMenuAnchor(null);
  };

  const toggleAssignee = (userId) => {
    setAssigneeIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const updatedCategories = [...boardCategories, newCategoryName.trim()];
      dispatch(updateBoard({ boardId: board.id, categories: updatedCategories }));
      setCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  // Only show accepted members in the picker
  const acceptedMembers = teamMembers.filter(m => m.status === 'ACCEPTED');
  
  return (
    <div
      ref={containerRef}
      className="rounded-[20px] p-4 flex flex-col gap-4 animate-slide-in"
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
      }}
    >
      {/* Title input */}
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => { setTitle(e.target.value); setError(''); }}
        onKeyDown={handleKeyDown}
        placeholder="Task title…"
        className="w-full bg-transparent text-[14px] font-semibold text-[#1d1d1f] placeholder-[#1d1d1f]/30 outline-none border-b border-[#1d1d1f]/10 pb-2 focus:border-[#007AFF]/50 transition-colors"
      />

      {/* Category selector with Color Notation */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] text-[#1d1d1f]/40 font-medium">Category:</span>
        <div className="flex flex-wrap gap-1.5 items-center">
          {boardCategories.map((cat) => {
            const catColor = stringToColor(cat);
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(isSelected ? '' : cat)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border flex items-center gap-1.5 ${
                  isSelected 
                    ? 'text-white shadow-md scale-105' 
                    : 'bg-white/40 border-white/40 text-[#1d1d1f]/60 hover:bg-white/60'
                }`}
                style={{
                  backgroundColor: isSelected ? catColor : undefined,
                  borderColor: isSelected ? catColor : undefined,
                }}
              >
                {!isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                )}
                {cat}
              </button>
            );
          })}
          
          {isAdmin && (
            isAddingCategory ? (
              <div className="flex items-center gap-1 bg-white/40 border border-white/60 rounded-full px-2 py-0.5">
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  placeholder="New…"
                  className="bg-transparent text-[10px] font-bold outline-none w-16 text-[#1d1d1f]"
                  autoFocus
                />
                <button onClick={handleAddCategory} className="text-green-600 hover:scale-110 transition-transform">
                  <Check size={12} />
                </button>
                <button onClick={() => setIsAddingCategory(false)} className="text-gray-400 hover:scale-110 transition-transform">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingCategory(true)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 text-[#1d1d1f]/40 hover:text-[#1d1d1f] transition-all"
                title="Add Category"
              >
                <Plus size={12} />
              </button>
            )
          )}
        </div>
      </div>

      {/* Row: Priority + Assignee */}
      <div className="flex flex-col gap-3 pt-1 border-t border-white/10">
        {/* Priority selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#1d1d1f]/40 font-medium mr-1">Priority:</span>
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all"
              style={{
                backgroundColor: priority === p ? `${PRIORITY_COLORS[p]}22` : 'rgba(0,0,0,0.04)',
                color: priority === p ? PRIORITY_COLORS[p] : 'rgba(29,29,31,0.4)',
                border: priority === p ? `1px solid ${PRIORITY_COLORS[p]}55` : '1px solid transparent',
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* TASK-ASSIGN-02: multi-assignee picker for admin */}
        {isAdmin && acceptedMembers.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#1d1d1f]/40 font-medium mr-1">Assign to:</span>
            <button
              onClick={handleOpenAssignMenu}
              className="flex-1 flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold text-[#1d1d1f] bg-white/50 border border-[#1d1d1f]/10 rounded-[10px] hover:bg-white/80 transition-all outline-none overflow-hidden"
            >
              <div className="flex -space-x-1.5 overflow-hidden">
                {assigneeIds.length > 0 ? (
                  assigneeIds.slice(0, 3).map(id => {
                    const member = acceptedMembers.find(m => m.userId === id);
                    return (
                      <div 
                        key={id}
                        className="w-5 h-5 rounded-full border border-white flex items-center justify-center text-[8px] text-white shrink-0"
                        style={{ backgroundColor: stringToColor(id) }}
                      >
                        {(member?.user?.name || '?').charAt(0).toUpperCase()}
                      </div>
                    );
                  })
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[8px] text-gray-500 border border-white">M</div>
                )}
                {assigneeIds.length > 3 && (
                  <div className="w-5 h-5 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[8px] text-gray-400">
                    +{assigneeIds.length - 3}
                  </div>
                )}
              </div>
              <span className="truncate flex-1 text-left text-[11px]">
                {assigneeIds.length === 0 ? 'Me (auto)' : `${assigneeIds.length} users selected`}
              </span>
            </button>

            <Menu
              anchorEl={assigneeMenuAnchor}
              open={openAssignMenu}
              onClose={handleCloseAssignMenu}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
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
              {acceptedMembers.map(m => (
                <MenuItem key={m.userId} onClick={() => toggleAssignee(m.userId)}>
                  <Checkbox 
                    checked={assigneeIds.includes(m.userId)} 
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
                    secondary={m.userId === currentUserId ? 'You' : ''}
                    primaryTypographyProps={{ fontSize: '12px', fontWeight: 600 }}
                  />
                </MenuItem>
              ))}
            </Menu>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-[11px] text-red-500 font-medium -mt-1">{error}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="flex-1 py-2 rounded-[14px] text-[13px] font-semibold transition-all"
          style={{
            background: title.trim() ? 'var(--color-primary)' : 'rgba(29,29,31,0.08)',
            color: title.trim() ? 'white' : 'rgba(29,29,31,0.3)',
            boxShadow: title.trim() ? '0 4px 12px rgba(0,122,255,0.25)' : 'none',
          }}
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="w-9 h-9 flex items-center justify-center rounded-[14px] bg-black/5 hover:bg-black/10 text-[#1d1d1f]/50 hover:text-[#1d1d1f] transition-all"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};

export default InlineAddTaskForm;
