import { useState, useCallback } from 'react';
import auditService from '../services/auditService';
import { toast } from 'react-hot-toast';

const useAudit = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAuditLogs = useCallback(async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      // Limpiar filtros vacíos antes de enviar
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== null && value !== '' && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const data = await auditService.getAuditLogs(cleanFilters);
      setAuditLogs(data.results || []);
      setPagination({
        count: data.count,
        next: data.next,
        previous: data.previous,
      });
    } catch (err) {
      setError(err);
      toast.error('Error al cargar los registros de auditoría.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    auditLogs,
    pagination,
    isLoading,
    error,
    fetchAuditLogs,
  };
};

export default useAudit;

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