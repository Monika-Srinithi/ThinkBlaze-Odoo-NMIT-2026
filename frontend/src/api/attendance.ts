import { api } from './client';
import type { AttendanceRecord, PaginatedResponse } from '../types';

export const checkIn = () => api.post<AttendanceRecord>('/attendance/check-in');
export const checkOut = () => api.post<AttendanceRecord>('/attendance/check-out');
export const getAttendance = (params?: any) => api.get<PaginatedResponse<AttendanceRecord>>('/attendance', params);
export const getMyAttendance = (params?: any) => api.get<PaginatedResponse<AttendanceRecord>>('/attendance/my', params);
export const getTodayAttendance = () => api.get<AttendanceRecord>('/attendance/today');
export const getAttendanceSummary = () => api.get<any>('/attendance/summary');
