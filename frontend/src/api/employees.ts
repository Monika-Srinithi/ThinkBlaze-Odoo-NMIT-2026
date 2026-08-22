import { api } from './client';
import type { Employee, PaginatedResponse } from '../types';

export const getEmployees = (params?: any) => api.get<PaginatedResponse<Employee>>('/employees', params);
export const getEmployee = (id: string) => api.get<Employee>(`/employees/${id}`);
export const createEmployee = (data: Partial<Employee>) => api.post<Employee>('/employees', data);
export const updateEmployee = (id: string, data: Partial<Employee>) => api.put<Employee>(`/employees/${id}`, data);
export const deleteEmployee = (id: string) => api.delete<{success: boolean}>(`/employees/${id}`);
export const getEmployeeSummary = (id: string) => api.get<any>(`/employees/${id}/summary`);
