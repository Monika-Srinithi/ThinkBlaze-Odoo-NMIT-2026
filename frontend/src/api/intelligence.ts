import { api } from './client';
import type { WorkforceHealthScore, RiskAlert } from '../types';

export const getHealthScore = () => api.get<WorkforceHealthScore>('/intelligence/health-score');
export const getRiskAlerts = () => api.get<RiskAlert[]>('/intelligence/risk-alerts');
export const getAnomalies = () => api.get<any>('/intelligence/anomalies');
export const getInsights = () => api.get<any>('/intelligence/insights');
export const getPredictions = () => api.get<any>('/intelligence/predictions');
