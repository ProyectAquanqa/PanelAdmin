import { useQuery } from '@tanstack/react-query';
import { adminApiClient } from '../api';
import { API_ROUTES } from '../config/api';

const getPaymentMethods = async () => {
  try {
    const response = await adminApiClient.get(API_ROUTES.CATALOGS.PAYMENT_METHODS.LIST);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
};

export const useGetPaymentMethods = (options = {}) => {
  return useQuery({
    queryKey: ['paymentMethods'],
    queryFn: getPaymentMethods,
    ...options,
  });
}; 