import axiosClient from './axiosClient';

const getBasePath = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.role === 'USER' ? '/user' : '/org';
  } catch(e) {
    return '/org';
  }
};

export const getAllProjects = () => axiosClient.get(`${getBasePath()}/projects`);
export const createProject = (data) => axiosClient.post('/org/projects', data);
export const getProjectById = (id) => axiosClient.get(`${getBasePath()}/projects/${id}`);
export const updateProject = (id, data) => axiosClient.put(`/org/projects/${id}`, data);
export const deleteProject = (id) => axiosClient.delete(`/org/projects/${id}`);

export const getAllUsers = () => axiosClient.get('/users');
