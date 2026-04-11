import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const TaskItem = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="task-item"
      onClick={(e) => {
        // Prevent click if we're dragging, though sortable handles this usually
        onClick();
      }}
    >
      <h4 className="task-title">{task.title}</h4>
      <div className="task-footer">
        <span className={`priority-badge priority-${task.priority}`}>
          {task.priority || 'Medium'}
        </span>
      </div>
    </div>
  );
};
