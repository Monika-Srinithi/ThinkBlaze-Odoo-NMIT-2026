import { api } from './client';
import type { PayrollRecord, PaginatedResponse } from '../types';

export const getMyPayroll = () => api.get<PaginatedResponse<PayrollRecord>>('/payroll/my');
export const getAllPayroll = () => api.get<PaginatedResponse<PayrollRecord>>('/payroll');
export const generatePayroll = (month: number, year: number) => api.post<any>('/payroll/generate', { month, year });
export const getPayslip = (id: string) => api.get<any>(`/payroll/${id}/payslip`);
