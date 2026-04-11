import axiosClient from './axiosClient';

export const loginUser = (email, password) =>
  axiosClient.post('/auth/login', { email, password });

export const signupUser = (name, email, password) =>
  axiosClient.post('/auth/signup', { name, email, password });
