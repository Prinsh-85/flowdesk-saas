import axiosClient from './axiosClient';

// ─── Tasks ───────────────────────────────────────────────────────────────────
export const getAllTasks = () => axiosClient.get('/tasks');

export const createTask = (taskData) => axiosClient.post('/tasks', taskData);

export const updateTask = (id, taskData) => axiosClient.put(`/tasks/${id}`, taskData);

export const deleteTask = (id) => axiosClient.delete(`/tasks/${id}`);
