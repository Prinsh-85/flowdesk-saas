import React, { useState } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { useParams, Navigate } from 'react-router-dom';
import { useTasks } from '../../context/TaskContext';
import { Spinner } from '../../components/common/Spinner';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Plus, X, AlertCircle, RefreshCw } from 'lucide-react';
import { Column } from './Column';
import { TaskDetails } from './TaskDetails';
import './Board.css';

export const Board = () => {
  const { projectId } = useParams();
  const { tasks, loading, error, updateTaskStatus, addTask, refetch } = useTasks();
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', type: 'Task' });
  const [creating, setCreating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'inprogress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
  ];

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const overColumn = columns.find(col => col.id === over.id);
    if (overColumn) {
      updateTaskStatus(taskId, overColumn.id);
    } else {
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask && overTask.status) {
        updateTaskStatus(taskId, overTask.status);
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    setCreating(true);
    // Attach project association here so backend maps it correctly
    await addTask({ ...newTask, project: { id: Number(projectId) } });
    setCreating(false);
    setNewTask({ title: '', description: '', priority: 'medium', type: 'Task' });
    setShowCreateModal(false);
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="board-page animate-fade-in">
      <header className="board-header">
        <div>
          <h1>Project Board</h1>
          <p>Drag & drop tasks across columns. Changes sync to the backend in real-time.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="secondary" onClick={refetch}><RefreshCw size={16} /> Refresh</Button>
          <Button onClick={() => setShowCreateModal(true)}><Plus size={16} /> New Task</Button>
        </div>
      </header>

      {error && (
        <div className="board-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={refetch}>Retry</Button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="board-container">
          {columns.map(col => (
            <Column
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={tasks.filter(t => t.status === col.id && t.project?.id === Number(projectId))}
              onTaskClick={setSelectedTask}
            />
          ))}
        </div>
      </DndContext>

      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Task</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}><X size={24} /></button>
            </div>
            <form className="modal-body" onSubmit={handleCreateTask}>
              <Input
                label="Title"
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task title..."
                required
              />
              <Input
                label="Description"
                value={newTask.description}
                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Optional description..."
              />
              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <div className="input-group input-full">
                  <label className="input-label">Type</label>
                  <select
                    className="input-field"
                    value={newTask.type}
                    onChange={e => setNewTask({ ...newTask, type: e.target.value })}
                  >
                    <option value="Task">Task</option>
                    <option value="Bug">Bug</option>
                    <option value="Story">Story</option>
                  </select>
                </div>
                <div className="input-group input-full">
                  <label className="input-label">Priority</label>
                  <select
                    className="input-field"
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" isLoading={creating}>Create Task</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
