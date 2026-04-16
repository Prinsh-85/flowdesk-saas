import axiosClient from './axiosClient';

export const getAllProjects = () => axiosClient.get('/projects');
export const createProject = (data) => axiosClient.post('/projects', data);
export const getProjectById = (id) => axiosClient.get(`/projects/${id}`);
export const updateProject = (id, data) => axiosClient.put(`/projects/${id}`, data);
export const deleteProject = (id) => axiosClient.delete(`/projects/${id}`);

export const getAllUsers = () => axiosClient.get('/users');
