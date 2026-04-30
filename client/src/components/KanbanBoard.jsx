// Data flow: Redux (boardSlice) → Board.jsx (selector) → KanbanBoard (initialData prop) → local state
// Socket events update Redux → triggers re-render chain → KanbanBoard syncs via useEffect
import React, { useState, useEffect, Fragment } from 'react';
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
      className="kanban-board-scroll"
      sx={{
        display: 'flex',
        gap: 3,
        alignItems: 'stretch',
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
        {lists.map((list, index) => (
          <Fragment key={list.id}>
            <ListColumn
              list={list}
              activeColumnId={activeColumnId}
              setActiveColumnId={setActiveColumnId}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
            />

            {/* Subtle Divider after the 3rd core column - Always show if we have at least 3 lists */}
            {index === 2 && (
              <Box
                sx={{
                  flexShrink: 0,
                  width: '2px',
                  backgroundColor: 'rgba(0,0,0,0.06)',
                  alignSelf: 'stretch',
                  my: 2,
                  mx: 1,
                  borderRadius: 1
                }}
              />
            )}
          </Fragment>
        ))}
      </DndContext>

      {isAdmin && !myTasksFilter && (
        <Box
          className="glass-column rounded-[24px]"
          sx={{
            flexShrink: 0,
            width: 320,
            px: 2,
            pt: 5, // Matches the pt-5 on ListColumn headers
            pb: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            borderTop: '2px solid transparent',
            minHeight: '100%' // Stretch full height
          }}
        >
          <Button
            onClick={onAddList}
            variant="outlined"
            startIcon={<Plus size={24} />}
            sx={{
              width: '100%',
              py: 2.5,
              borderRadius: '16px',
              border: '2px dashed rgba(0,0,0,0.15)',
              color: 'var(--color-primary)',
              background: 'rgba(255,255,255,0.3)',
              backdropFilter: 'blur(8px)',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 700,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'rgba(255,255,255,0.5)',
                borderColor: 'var(--color-primary)',
                transform: 'translateY(-2px)'
              }
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
