// Data flow: Redux (boardSlice) → Board.jsx (selector) → KanbanBoard (initialData prop) → local state
// Socket events update Redux → triggers re-render chain → KanbanBoard syncs via useEffect
import { useState, useEffect } from 'react';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Box } from '@mui/material';
import { useDispatch } from 'react-redux';
import { updateCardPosition, moveCardOptimistic } from '../store/slices/boardSlice';
import ListColumn from './ListColumn';
import { generateNewRank } from '../utils/ranks';

const KanbanBoard = ({ initialData }) => {
  const [lists, setLists] = useState(initialData);

  useEffect(() => {
    setLists(initialData);
  }, [initialData]);

  const dispatch = useDispatch();

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

  const handleDragStart = (event) => {
    // Optionally track active drag state
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
      overIndex = items.length; // Place at the end
    }

    // Determine if it was an intra-list reorder that actually changed positions
    // OR if it was already moved to a new list by handleDragOver
    // Note: handleDragOver modifies local state when moving across lists, 
    // so activeContainer === overContainer at this stage for cross-list moves too.
    // However, we MUST dispatch the update to the backend. We can ALWAYS dispatch
    // if a drag event completed successfully since it implies intentional displacement.

    if (activeIndex !== overIndex || overIndex === -1) {
      let finalCards = items;
      
      // If it's a re-order in the same physical local state array
      if (activeIndex !== overIndex && overId !== overContainer) {
         setLists((prev) => {
           const prevList = prev.find((l) => l.id === activeContainer);
           finalCards = arrayMove(prevList.cards, activeIndex, overIndex);
           return prev.map((l) => (l.id === activeContainer ? { ...l, cards: finalCards } : l));
         });
      }

      // Calculate rank based on the PREDICTED final array state
      // (because setLists is async, we use finalCards or items locally)
      const targetCards = finalCards || items;
      
      // We must calculate the correct target index. 
      // If arrayMove was called, the card is now at `overIndex`.
      // If arrayMove wasn't called (it was already moved by dragOver), the card is at `activeIndex`.
      const targetIndex = (activeIndex !== overIndex && overId !== overContainer) ? overIndex : activeIndex;

      const prevCard = targetCards[targetIndex - 1];
      const nextCard = targetCards[targetIndex + 1];
      const newRank = generateNewRank(prevCard?.rank, nextCard?.rank);

      dispatch(updateCardPosition({ 
        cardId: active.id, 
        data: { listId: overContainer, rank: newRank } 
      }));
    } else {
      // It was an across-list drag that happened to land at activeIndex === overIndex!
      // DragOver moved it, so it's ALREADY in the new list in local state.
      // But we skipped the arrayMove. We STILL must save the new listId to the DB!
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
    <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', height: '100%' }}>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {lists.map((list) => (
          <ListColumn key={list.id} list={list} />
        ))}
      </DndContext>
    </Box>
  );
};

export default KanbanBoard;
