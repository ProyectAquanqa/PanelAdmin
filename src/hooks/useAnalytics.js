import { useQuery } from '@tanstack/react-query';
import analyticsService from '../services/analyticsService';

/**
 * Hook for fetching analytics summary data
 */
export const useGetAnalyticsSummary = (options = {}) => {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => analyticsService.getAnalyticsSummary(),
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 0,
    cacheTime: 0,
    ...options
  });
};

/**
 * Hook for fetching appointment analytics data
 */
export const useGetAppointmentAnalytics = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['analytics', 'appointments', params],
    queryFn: () => analyticsService.getAppointmentAnalytics(params),
    ...options
  });
};

/**
 * Hook for fetching revenue analytics data
 */
export const useGetRevenueAnalytics = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['analytics', 'revenue', params],
    queryFn: () => analyticsService.getRevenueAnalytics(params),
    ...options
  });
};

/**
 * Hook for fetching doctor performance data
 */
export const useGetDoctorPerformance = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['analytics', 'doctors', params],
    queryFn: () => analyticsService.getDoctorPerformance(params),
    ...options
  });
};

/**
 * Hook for fetching patient demographics data
 */
export const useGetPatientDemographics = (options = {}) => {
  return useQuery({
    queryKey: ['analytics', 'patients', 'demographics'],
    queryFn: () => analyticsService.getPatientDemographics(),
    ...options
  });
};

/**
 * Hook for fetching specialty demand data
 */
export const useGetSpecialtyDemand = (options = {}) => {
  return useQuery({
    queryKey: ['analytics', 'specialties', 'demand'],
    queryFn: () => analyticsService.getSpecialtyDemand(),
    ...options
  });
}; 