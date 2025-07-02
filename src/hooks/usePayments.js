import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import paymentService from '../services/paymentService';
import { toast } from 'react-hot-toast';

/**
 * Hook for fetching payments with optional filtering and infinite scroll
 */
export const useGetPayments = (filters = {}, options = {}) => {
  return useInfiniteQuery({
    queryKey: ['payments', filters],
    queryFn: ({ pageParam = 1 }) => paymentService.getPayments({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.next) {
        const url = new URL(lastPage.next);
        return url.searchParams.get('page');
      }
      return undefined;
    },
    initialPageParam: 1,
    ...options,
  });
};

/**
 * Hook for fetching a specific payment by ID
 */
export const useGetPayment = (id, options = {}) => {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: () => paymentService.getPaymentById(id),
    enabled: !!id,
    ...options
  });
};

/**
 * Hook for creating a new payment
 */
export const useCreatePayment = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (paymentData) => paymentService.createPayment(paymentData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Pago creado exitosamente');
      if (options.onSuccess) options.onSuccess(data);
    },
    onError: (error) => {
      toast.error(`Error al crear el pago: ${error.message}`);
      if (options.onError) options.onError(error);
    },
    ...options
  });
};

/**
 * Hook for updating an existing payment
 */
export const useUpdatePayment = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, paymentData }) => paymentService.updatePayment(id, paymentData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Pago actualizado exitosamente');
      if (options.onSuccess) options.onSuccess(data);
    },
    onError: (error) => {
      toast.error(`Error al actualizar el pago: ${error.message}`);
      if (options.onError) options.onError(error);
    },
    ...options
  });
};

/**
 * Hook for deleting a payment
 */
export const useDeletePayment = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => paymentService.deletePayment(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Pago eliminado exitosamente');
      if (options.onSuccess) options.onSuccess(data);
    },
    onError: (error) => {
      toast.error(`Error al eliminar el pago: ${error.message}`);
      if (options.onError) options.onError(error);
    },
    ...options
  });
};

/**
 * Hook for fetching completed payments
 */
export const useGetCompletedPayments = (options = {}) => {
  return useQuery({
    queryKey: ['payments', 'completed'],
    queryFn: () => paymentService.getCompletedPayments(),
    ...options
  });
};

/**
 * Hook for fetching processing payments
 */
export const useGetProcessingPayments = (options = {}) => {
  return useQuery({
    queryKey: ['payments', 'processing'],
    queryFn: () => paymentService.getProcessingPayments(),
    ...options
  });
};

/**
 * Hook for refunding a payment
 */
export const useRefundPayment = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => paymentService.refundPayment(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Reembolso procesado exitosamente');
      if (options.onSuccess) options.onSuccess(data);
    },
    onError: (error) => {
      toast.error(`Error al procesar el reembolso: ${error.message}`);
      if (options.onError) options.onError(error);
    },
    ...options
  });
}; 