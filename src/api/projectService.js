import axiosClient from './axiosClient';

export const getAllProjects = () => axiosClient.get('/projects');
export const createProject = (data) => axiosClient.post('/projects', data);
export const getProjectById = (id) => axiosClient.get(`/projects/${id}`);

export const getAllUsers = () => axiosClient.get('/users');
