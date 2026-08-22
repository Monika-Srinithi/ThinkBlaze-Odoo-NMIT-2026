import { useQuery } from '@tanstack/react-query';
import * as intelligenceApi from '../api/intelligence';

export const useHealthScore = () => {
  return useQuery({
    queryKey: ['healthScore'],
    queryFn: () => intelligenceApi.getHealthScore(),
  });
};

export const useRiskAlerts = () => {
  return useQuery({
    queryKey: ['riskAlerts'],
    queryFn: () => intelligenceApi.getRiskAlerts(),
  });
};

export const useAnomalies = () => {
  return useQuery({
    queryKey: ['anomalies'],
    queryFn: () => intelligenceApi.getAnomalies(),
  });
};

export const useInsights = () => {
  return useQuery({
    queryKey: ['insights'],
    queryFn: () => intelligenceApi.getInsights(),
  });
};
