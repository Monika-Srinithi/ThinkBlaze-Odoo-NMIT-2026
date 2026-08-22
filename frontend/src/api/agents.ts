import { api } from './client';
import type { AgentMessage } from '../types';

export const sendQuery = (message: string, context?: any) => api.post<AgentMessage>('/agents/query', { message, context });
export const getTraces = () => api.get<any>('/agents/traces');
export const getTrace = (id: string) => api.get<any>(`/agents/traces/${id}`);
