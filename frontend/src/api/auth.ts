import { api } from './client';
import type { User } from '../types';

export const login = (data: any) => api.post<{access_token: string; user: User}>('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const refreshToken = () => api.post('/auth/refresh');
export const getMe = () => api.get<User>('/auth/me');
export const changePassword = (data: any) => api.post('/auth/change-password', data);
