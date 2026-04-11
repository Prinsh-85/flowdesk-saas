import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskItem } from './TaskItem';

export const Column = ({ id, title, tasks, onTaskClick }) => {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div className="kanban-column">
      <div className={`column-header column-${id}`}>
        {title} <span>{tasks.length}</span>
      </div>
      <div className="column-content" ref={setNodeRef}>
        <SortableContext 
          items={tasks.map(t => t.id)} 
          strategy={verticalListSortingStrategy}
        >
          {tasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onClick={() => onTaskClick(task)} 
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};
