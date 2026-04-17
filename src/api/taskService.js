import axiosClient from './axiosClient';

const getBasePath = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.role === 'USER' ? '/user' : '/org';
  } catch(e) {
    return '/org';
  }
};

// ─── Tasks ───────────────────────────────────────────────────────────────────
export const getAllTasks = () => axiosClient.get(`${getBasePath()}/tasks`);

export const createTask = (taskData) => axiosClient.post('/org/tasks', taskData);

export const updateTask = (id, taskData) => axiosClient.put(`${getBasePath()}/tasks/${id}`, taskData);

export const deleteTask = (id) => axiosClient.delete(`/org/tasks/${id}`);
