import { api } from './client';
import type { LeaveRequest, LeaveBalance, PaginatedResponse } from '../types';

export const submitLeaveRequest = (data: any) => api.post<LeaveRequest>('/leave', data);
export const getLeaveRequests = (params?: any) => api.get<PaginatedResponse<LeaveRequest>>('/leave', params);
export const approveLeave = (id: string) => api.post<LeaveRequest>(`/leave/${id}/approve`);
export const rejectLeave = (id: string, reason: string) => api.post<LeaveRequest>(`/leave/${id}/reject`, { reason });
export const cancelLeave = (id: string) => api.post<LeaveRequest>(`/leave/${id}/cancel`);
export const getLeaveBalance = () => api.get<LeaveBalance[]>('/leave/balance');
export const getLeaveCalendar = (year: number, month: number) => api.get<any>(`/leave/calendar?year=${year}&month=${month}`);
