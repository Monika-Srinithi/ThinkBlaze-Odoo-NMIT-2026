import { api } from './client';
import type { WhatIfScenario } from '../types';

export const createScenario = (data: any) => api.post<WhatIfScenario>('/simulator/scenarios', data);
export const getScenarios = () => api.get<WhatIfScenario[]>('/simulator/scenarios');
export const runSimulation = (data: any) => api.post<WhatIfScenario>('/simulator/run', data);
export const getBottlenecks = () => api.get<any>('/simulator/bottlenecks');
export const applyRecommendation = (id: string) => api.post<any>(`/simulator/recommendations/${id}/apply`);
