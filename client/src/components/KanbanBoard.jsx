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

  const handleDragEnd = (event) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer !== overContainer) return;

    const items = lists.find((l) => l.id === activeContainer).cards;
    const activeIndex = items.findIndex((item) => item.id === active.id);
    const overIndex = items.findIndex((item) => item.id === overId);

    if (activeIndex !== overIndex) {
      setLists((prev) => {
        const list = prev.find((l) => l.id === activeContainer);
        const newCards = arrayMove(list.cards, activeIndex, overIndex);
        return prev.map((l) => (l.id === activeContainer ? { ...l, cards: newCards } : l));
      });

      // Dispatch to backend (Fractional Index logic simplified)
      const list = lists.find(l => l.id === activeContainer);
      const prevCard = list.cards[overIndex - 1];
      const nextCard = list.cards[overIndex + 1];
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
