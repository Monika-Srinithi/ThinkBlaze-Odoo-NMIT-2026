import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as attendanceApi from '../api/attendance';

export const useAttendance = (params?: any) => {
  return useQuery({
    queryKey: ['attendance', params],
    queryFn: () => attendanceApi.getAttendance(params),
  });
};

export const useMyAttendance = (params?: any) => {
  return useQuery({
    queryKey: ['attendance', 'my', params],
    queryFn: () => attendanceApi.getMyAttendance(params),
  });
};

export const useTodayAttendance = () => {
  return useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: () => attendanceApi.getTodayAttendance(),
  });
};

export const useCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: attendanceApi.checkIn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] }),
  });
};

export const useCheckOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: attendanceApi.checkOut,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] }),
  });
};
