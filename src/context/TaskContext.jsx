import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAllTasks, createTask, updateTask, deleteTask } from '../api/taskService';

const TaskContext = createContext(null);

// Split into separate file to fix Vite HMR incompatibility
export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllTasks();
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Could not connect to backend. Make sure the server is running on port 8080.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const updateTaskStatus = async (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try { await updateTask(taskId, { status: newStatus }); }
    catch { fetchTasks(); }
  };

  const addTask = async (taskData) => {
    try {
      const res = await createTask({ ...taskData, status: taskData.status || 'todo' });
      setTasks(prev => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      setError('Failed to create task.');
      throw err;
    }
  };

  const editTask = async (taskId, updates) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    try { await updateTask(taskId, updates); }
    catch { fetchTasks(); }
  };

  const removeTask = async (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try { await deleteTask(taskId); }
    catch { fetchTasks(); }
  };

  const handleRealtimeTaskUpdate = (event) => {
    if (!event?.data) return;
    const updatedTask = event.data;
    if (event.message?.includes('DELETED')) {
      setTasks(prev => prev.filter(t => t.id !== updatedTask));
    } else {
      setTasks(prev => {
        const exists = prev.find(t => t.id === updatedTask.id);
        return exists
          ? prev.map(t => t.id === updatedTask.id ? updatedTask : t)
          : [updatedTask, ...prev];
      });
    }
  };

  return (
    <TaskContext.Provider value={{
      tasks, loading, error,
      updateTaskStatus, addTask, editTask,
      deleteTask: removeTask,
      handleRealtimeTaskUpdate,
      refetch: fetchTasks,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  return useContext(TaskContext);
}
