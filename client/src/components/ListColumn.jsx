import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Tooltip } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Trash2, Inbox } from 'lucide-react';
import { useState } from 'react';
import { createCard, deleteList } from '../store/slices/boardSlice';
import TaskCard from './TaskCard';
import InlineAddTaskForm from './InlineAddTaskForm';
import { getInitialRank } from '../utils/ranks';

// CB-005 — column accent colors
const COLUMN_ACCENT = {
  todo:       '#85B7EB',
  inprogress: '#EF9F27',
  done:       '#97C459',
};

function getAccentColor(name) {
  const n = name.toLowerCase().replace(/\s+/g, '');
  if (n.includes('todo') || n.includes('backlog'))                return COLUMN_ACCENT.todo;
  if (n.includes('inprogress') || n.includes('progress'))         return COLUMN_ACCENT.inprogress;
  if (n.includes('done') || n.includes('review') || n.includes('complete')) return COLUMN_ACCENT.done;
  return 'transparent';
}

const ListColumn = ({ list, activeColumnId, setActiveColumnId, isMyTasksFilter }) => {
  const dispatch = useDispatch();
  const { role } = useSelector((state) => state.board);
  const currentUser = useSelector((state) => state.auth.user);
  const isAdmin = role === 'ADMIN';

  const isFormOpen = activeColumnId === list.id;

  const { setNodeRef, isOver } = useDroppable({ id: list.id });

  const handleCreateTask = (title, priority) => {
    dispatch(createCard({
      title,
      priority,
      listId: list.id,
      rank: getInitialRank(list.cards?.length || 0),
      assigneeId: isMyTasksFilter && currentUser ? currentUser.id : null,
    }));
    setActiveColumnId(null);
  };

  const onDeleteList = () => {
    if (window.confirm(`Delete list "${list.name}"? This will also delete all tasks in it.`)) {
      dispatch(deleteList(list.id));
    }
  };

  const accentColor = getAccentColor(list.name);

  return (
    <div
      className="glass-column rounded-[24px] px-4 pb-4 pt-0 flex flex-col gap-3 min-w-[300px] w-[300px] h-full shrink-0 overflow-hidden"
      style={{ borderTop: `2px solid ${accentColor}` }}
    >
      {/* Column Header */}
      <div className="flex justify-between items-center px-1 pt-5 border-b border-white/10 pb-4">
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
      </div>

      {/* Cards area */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-3 flex-1 pb-2 transition-colors duration-300 rounded-[28px] ${isOver ? 'drop-target p-2 -m-2' : ''}`}
      >
        <SortableContext items={list.cards?.map((c) => c.id) || []} strategy={verticalListSortingStrategy}>
          {(!list.cards || list.cards.length === 0) ? (
            /* CB-002 — styled empty placeholder */
            <div className="flex flex-col items-center justify-center py-8 gap-2 select-none pointer-events-none">
              <div
                className="w-9 h-9 flex items-center justify-center rounded-xl"
                style={{ border: '1.5px dashed rgba(29,29,31,0.15)' }}
              >
                <Inbox size={18} className="text-[#1d1d1f]/25" />
              </div>
              <span className="text-[12px] font-medium text-[#1d1d1f]/30">No tasks yet</span>
            </div>
          ) : (
            list.cards.map((card) => (
              /* Pass isDraggable to TaskCard based on role and filter */
              <TaskCard 
                key={card.id} 
                card={card} 
                listName={list.name} 
                isDraggable={isAdmin || isMyTasksFilter} 
              />
            ))
          )}
        </SortableContext>

        {/* CB-007 — inline form or Add Task button */}
        {isFormOpen ? (
          <InlineAddTaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setActiveColumnId(null)}
          />
        ) : (
          /* Show Add Task ONLY to Admins on the ToDo list */
          isAdmin && getAccentColor(list.name) === COLUMN_ACCENT.todo && (
            <button
              onClick={() => setActiveColumnId(list.id)}
              className="mt-1 flex items-center justify-center gap-2 text-[#1d1d1f] bg-white/30 border border-white/40 hover:bg-white/50 py-3 rounded-[20px] transition-all duration-300 w-full font-semibold shadow-sm hover:shadow-md text-sm"
              style={{ borderStyle: 'dashed' }}
            >
              <Plus size={15} /> Add Task
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default ListColumn;
