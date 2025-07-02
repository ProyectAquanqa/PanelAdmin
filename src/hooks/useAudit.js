import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import auditService from '../services/auditService';
import { toast } from 'react-hot-toast';

/**
 * Hook for fetching audit logs with optional filtering
 */
export const useGetAuditLogs = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['auditLogs', params],
    queryFn: () => auditService.getAuditLogs(params),
    ...options
  });
};

/**
 * Hook for fetching a specific audit log by ID
 */
export const useGetAuditLog = (id, options = {}) => {
  return useQuery({
    queryKey: ['auditLogs', id],
    queryFn: () => auditService.getAuditLogById(id),
    enabled: !!id,
    ...options
  });
};

/**
 * Hook for deleting an audit log
 */
export const useDeleteAuditLog = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => auditService.deleteAuditLog(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
      toast.success('Registro de auditoría eliminado exitosamente');
      if (options.onSuccess) options.onSuccess(data);
    },
    onError: (error) => {
      toast.error(`Error al eliminar el registro de auditoría: ${error.message}`);
      if (options.onError) options.onError(error);
    },
    ...options
  });
};

/**
 * Hook for fetching recent audit logs
 */
export const useGetRecentAuditLogs = (options = {}) => {
  return useQuery({
    queryKey: ['auditLogs', 'recent'],
    queryFn: () => auditService.getRecentAuditLogs(),
    ...options
  });
};

/**
 * Hook for fetching audit statistics
 */
export const useGetAuditStats = (options = {}) => {
  return useQuery({
    queryKey: ['auditLogs', 'stats'],
    queryFn: () => auditService.getAuditStats(),
    ...options
  });
}; 