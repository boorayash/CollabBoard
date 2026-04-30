import React, { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Tooltip } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Trash2, Inbox } from 'lucide-react';
import { createCard, deleteList } from '../store/slices/boardSlice';
import TaskCard from './TaskCard';
import InlineAddTaskForm from './InlineAddTaskForm';
import ConfirmDialog from './ConfirmDialog';
import { getInitialRank } from '../utils/ranks';

// CB-005 — column accent colors
const COLUMN_ACCENT = {
  todo:       '#85B7EB',
  inprogress: '#EF9F27',
  done:       '#97C459',
};

function getAccentColor(name) {
  const n = name.toLowerCase().replace(/\s+/g, '');
  if (n.includes('todo') || n.includes('backlog'))                         return COLUMN_ACCENT.todo;
  if (n.includes('inprogress') || n.includes('progress'))                  return COLUMN_ACCENT.inprogress;
  if (n.includes('done') || n.includes('review') || n.includes('complete')) return COLUMN_ACCENT.done;
  return 'transparent';
}

const ListColumn = ({ list, activeColumnId, setActiveColumnId, isAdmin, currentUserId }) => {
  const dispatch = useDispatch();
  const { teamMembers } = useSelector((state) => state.team);
  const { board } = useSelector((state) => state.board);

  const isFormOpen = activeColumnId === list.id;
  const { setNodeRef, isOver } = useDroppable({ id: list.id });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // TASK-ASSIGN-01: any member can create; assigneeId passed from form (admin pick) or undefined (auto = creator)
  const handleCreateTask = (title, priority, assigneeIds, category) => {
    dispatch(createCard({
      title,
      priority,
      category,
      listId: list.id,
      rank: getInitialRank(list.cards?.length || 0),
      assigneeIds: assigneeIds || [],  // Pass the array directly
    }));
    setActiveColumnId(null);
  };

  const onDeleteList = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteList(list.id));
    setDeleteDialogOpen(false);
  };

  const accentColor = getAccentColor(list.name);

  return (
    <div
      className="glass-column rounded-[24px] px-4 pb-4 pt-0 flex flex-col gap-3 min-w-[300px] w-[300px] h-full shrink-0 overflow-hidden"
      style={{ 
        borderTop: `2px solid ${accentColor}`,
        scrollSnapAlign: 'start'
      }}
    >
      {/* Column Header */}
      <div className="flex justify-between items-center px-1 pt-5 border-b border-white/10 pb-4 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <span className="font-display uppercase text-[11px] tracking-[1.5px] font-bold opacity-70">
            {list.name}
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${accentColor}22`, color: accentColor }}
          >
            {list.cards?.length ?? 0}
          </span>
        </div>

        <div className="flex items-center gap-[2px] h-3">
          {[0, 0.2, 0.4].map((delay, i) => (
            <div
              key={i}
              className="wave-bar"
              style={{
                backgroundColor: accentColor !== 'transparent' ? accentColor : '#cbd5e1',
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </div>

        {isAdmin && getAccentColor(list.name) === 'transparent' && (
          <Tooltip title="Delete List">
            <button
              onClick={onDeleteList}
              className="text-gray-400 hover:text-red-500 transition-colors bg-black/5 hover:bg-black/10 rounded-full p-1.5 ml-2"
            >
              <Trash2 size={14} />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Scrollable Cards Area */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-3 flex-1 overflow-y-auto kanban-scroll px-1 pt-4 pb-4 transition-colors duration-300 ${isOver ? 'drop-target' : ''}`}
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, black 16px, black calc(100% - 16px), transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 16px, black calc(100% - 16px), transparent)'
        }}
      >
        <SortableContext items={list.cards?.map((c) => c.id) || []} strategy={verticalListSortingStrategy}>
          {(!list.cards || list.cards.length === 0) ? (
            /* Premium Empty State - Centered within scroll area */
            <div className="flex flex-col items-center justify-center flex-1 h-full min-h-[150px] gap-3 select-none pointer-events-none opacity-60">
              <div
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/5"
                style={{ border: '1.5px dashed rgba(29,29,31,0.15)' }}
              >
                <Inbox size={20} className="text-[#1d1d1f]/50" />
              </div>
              <span className="text-[13px] font-bold text-[#1d1d1f]/40 tracking-tight">No tasks yet</span>
            </div>
          ) : (
            list.cards.map((card) => (
              <TaskCard
                key={card.id}
                card={card}
                listName={list.name}
                isAdmin={isAdmin}
                currentUserId={currentUserId}
                teamMembers={teamMembers}
              />
            ))
          )}
        </SortableContext>
      </div>

      {/* Fixed Footer (Add Task) */}
      <div className="shrink-0 pt-3 mt-auto z-10">
        {getAccentColor(list.name) === COLUMN_ACCENT.todo && (
          isFormOpen ? (
            <InlineAddTaskForm
              onSubmit={handleCreateTask}
              onCancel={() => setActiveColumnId(null)}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
              teamMembers={teamMembers}
              board={board}
            />
          ) : (
            <button
              onClick={() => setActiveColumnId(list.id)}
              className="flex items-center justify-center gap-2 text-[#1d1d1f] bg-white/40 border border-white/60 hover:bg-white/60 py-3.5 rounded-[20px] transition-all duration-300 w-full font-bold shadow-sm hover:shadow-md text-[13px]"
              style={{ borderStyle: 'dashed' }}
            >
              <Plus size={16} /> Add Task
            </button>
          )
        )}
      </div>

      <ConfirmDialog 
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete List?"
        message={`Are you sure you want to delete "${list.name}"? This will permanently remove all tasks in this column.`}
        confirmText="Delete List"
        type="danger"
      />
    </div>
  );
};

export default ListColumn;
