import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as leaveApi from '../api/leave';

export const useLeaveRequests = (params?: any) => {
  return useQuery({
    queryKey: ['leaveRequests', params],
    queryFn: () => leaveApi.getLeaveRequests(params),
  });
};

export const useLeaveBalance = () => {
  return useQuery({
    queryKey: ['leaveBalance'],
    queryFn: () => leaveApi.getLeaveBalance(),
  });
};

export const useSubmitLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveApi.submitLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalance'] });
    },
  });
};

export const useApproveLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveApi.approveLeave,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaveRequests'] }),
  });
};

export const useRejectLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => leaveApi.rejectLeave(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaveRequests'] }),
  });
};
