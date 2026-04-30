// Data flow: Redux (boardSlice) → Board.jsx (selector) → KanbanBoard (initialData prop) → local state
// Socket events update Redux → triggers re-render chain → KanbanBoard syncs via useEffect
import { useState, useEffect } from 'react';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { updateCardPosition } from '../store/slices/boardSlice';
import ListColumn from './ListColumn';
import { generateNewRank } from '../utils/ranks';

import { Plus } from 'lucide-react';
import { Button } from '@mui/material';

const KanbanBoard = ({ initialData, isAdmin, onAddList, myTasksFilter }) => {
  const [lists, setLists] = useState(initialData);
  const [activeColumnId, setActiveColumnId] = useState(null);

  useEffect(() => {
    setLists(initialData);
  }, [initialData]);

  // Removed stack effect logic to prioritize clarity and stability
  useEffect(() => {
    // No-op - effect removed per user request
  }, []);

  const dispatch = useDispatch();

  // DND-PERM-01/02: derive permissions from Redux
  const { user } = useSelector((state) => state.auth);
  const { role } = useSelector((state) => state.board);
  const currentUserId = user?.id;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findContainer = (id) => {
    if (lists.find((l) => l.id === id)) return id;
    const list = lists.find((l) => l.cards.find((c) => c.id === id));
    return list ? list.id : null;
  };

  // DND-PERM-01: check if current user is allowed to drag a given card
  const canDragCard = (cardId) => {
    if (isAdmin) return true;
    for (const list of lists) {
      const card = list.cards?.find(c => c.id === cardId);
      if (card) return card.assigneeId === currentUserId;
    }
    return false;
  };

  const handleDragOver = ({ active, over }) => {
    const overId = over?.id;
    if (!overId || active.id === overId) return;

    const overContainer = findContainer(overId);
    const activeContainer = findContainer(active.id);

    if (!overContainer || !activeContainer) return;

    if (activeContainer !== overContainer) {
      setLists((prev) => {
        const activeItems = prev.find((l) => l.id === activeContainer).cards;
        const overItems = prev.find((l) => l.id === overContainer).cards;

        const activeIndex = activeItems.findIndex((item) => item.id === active.id);
        const overIndex = overItems.findIndex((item) => item.id === overId);

        let newIndex;
        if (overId in prev) {
          newIndex = overItems.length + 1;
        } else {
          const isBelowLastItem = over && overIndex === overItems.length - 1;
          const modifier = isBelowLastItem ? 1 : 0;
          newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length;
        }

        const newLists = [...prev].map((l) => {
          if (l.id === activeContainer) {
            return { ...l, cards: l.cards.filter((i) => i.id !== active.id) };
          }
          if (l.id === overContainer) {
            const newCards = [...l.cards];
            newCards.splice(newIndex, 0, activeItems[activeIndex]);
            return { ...l, cards: newCards };
          }
          return l;
        });

        return newLists;
      });
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) return;

    const list = lists.find((l) => l.id === activeContainer);
    const items = list.cards;
    const activeIndex = items.findIndex((item) => item.id === active.id);
    let overIndex = items.findIndex((item) => item.id === overId);

    // If dragging to an empty list, overId is the list ID
    if (overIndex === -1 && overId === overContainer) {
      overIndex = items.length;
    }

    if (activeIndex !== overIndex || overIndex === -1) {
      let finalCards = items;

      if (activeIndex !== overIndex && overId !== overContainer) {
        setLists((prev) => {
          const prevList = prev.find((l) => l.id === activeContainer);
          finalCards = arrayMove(prevList.cards, activeIndex, overIndex);
          return prev.map((l) => (l.id === activeContainer ? { ...l, cards: finalCards } : l));
        });
      }

      const targetCards = finalCards || items;
      const targetIndex = (activeIndex !== overIndex && overId !== overContainer) ? overIndex : activeIndex;

      const prevCard = targetCards[targetIndex - 1];
      const nextCard = targetCards[targetIndex + 1];
      const newRank = generateNewRank(prevCard?.rank, nextCard?.rank);

      dispatch(updateCardPosition({
        cardId: active.id,
        data: { listId: overContainer, rank: newRank }
      }));
    } else {
      const prevCard = items[activeIndex - 1];
      const nextCard = items[activeIndex + 1];
      const newRank = generateNewRank(prevCard?.rank, nextCard?.rank);

      dispatch(updateCardPosition({
        cardId: active.id,
        data: { listId: overContainer, rank: newRank }
      }));
    }
  };

  return (
    <Box 
      className="kanban-scroll"
      sx={{ 
        display: 'flex', 
        gap: 3, 
        alignItems: 'flex-start', 
        height: '100%',
        width: '100%',
        overflowX: 'auto',
        pb: 4
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        cancelDrop={({ active }) => !canDragCard(active.id)}
      >
        {lists.map((list) => (
          <ListColumn
            key={list.id}
            list={list}
            activeColumnId={activeColumnId}
            setActiveColumnId={setActiveColumnId}
            isAdmin={isAdmin}
            currentUserId={currentUserId}
          />
        ))}
      </DndContext>
      
      {isAdmin && !myTasksFilter && (
        <Box sx={{ flexShrink: 0 }}>
          <Button 
            onClick={onAddList} 
            variant="outlined" 
            startIcon={<Plus size={20} />} 
            sx={{ 
              minWidth: 280, 
              height: 64, 
              borderRadius: 3, 
              border: '2px dashed rgba(0,0,0,0.1)', 
              color: 'rgba(29,29,31,0.5)', 
              background: 'rgba(255,255,255,0.45)', 
              backdropFilter: 'blur(16px)', 
              textTransform: 'none', 
              fontSize: '1.05rem', 
              fontWeight: 700,
              boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { 
                background: 'rgba(255,255,255,0.6)', 
                borderColor: 'var(--color-primary)',
                color: 'var(--color-primary)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.1)'
              },
              '&:active': { transform: 'translateY(0)' }
            }}
          >
            Add New List
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default KanbanBoard;
