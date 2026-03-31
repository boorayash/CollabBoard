import { useState } from 'react';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Box } from '@mui/material';
import ListColumn from './ListColumn';

const KanbanBoard = ({ initialData }) => {
  const [lists, setLists] = useState(initialData);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
       // Handle complex reordering logic between lists/within lists
       // For MVP baseline, we'll implement simple single-list reordering first
       // Full cross-list reordering will be added in Step 01-04
       console.log('Drag end:', active.id, over.id);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', height: '100%' }}>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
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
