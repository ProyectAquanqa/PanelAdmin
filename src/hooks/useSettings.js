import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getSettings, 
  getSettingByKey,
  getSettingsByCategory,
  getPublicSettings,
  updateSetting,
  bulkUpdateSettings,
  initializeDefaultSettings
} from '../services/settingsService';
import { toast } from 'react-hot-toast';

// Clave para la cache
const SETTINGS_QUERY_KEY = 'settings';

/**
 * Hook para obtener todas las configuraciones
 */
export const useGetSettings = (params = {}) => {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEY, params],
    queryFn: () => getSettings(params),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Error al obtener configuraciones:', error);
      toast.error('Error al cargar las configuraciones');
    }
  });
};

/**
 * Hook para obtener una configuración específica por su clave
 */
export const useGetSettingByKey = (key) => {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEY, 'key', key],
    queryFn: () => getSettingByKey(key),
    enabled: !!key,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error(`Error al obtener configuración ${key}:`, error);
    }
  });
};

/**
 * Hook para obtener configuraciones agrupadas por categoría
 */
export const useGetSettingsByCategory = () => {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEY, 'by-category'],
    queryFn: getSettingsByCategory,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Error al obtener configuraciones por categoría:', error);
      toast.error('Error al cargar las configuraciones por categoría');
    }
  });
};

/**
 * Hook para obtener configuraciones públicas
 */
export const useGetPublicSettings = () => {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEY, 'public'],
    queryFn: getPublicSettings,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Error al obtener configuraciones públicas:', error);
      toast.error('Error al cargar las configuraciones públicas');
    }
  });
};

/**
 * Hook para actualizar una configuración
 */
export const useUpdateSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => updateSetting(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
      toast.success('Configuración actualizada exitosamente');
      return data;
    },
    onError: (error) => {
      console.error('Error al actualizar configuración:', error);
      toast.error(error.response?.data?.detail || 'Error al actualizar la configuración');
      throw error;
    }
  });
};

/**
 * Hook para actualizar múltiples configuraciones
 */
export const useBulkUpdateSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => bulkUpdateSettings(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
      
      const { updated, errors } = data;
      if (updated.length > 0) {
        toast.success(`${updated.length} configuraciones actualizadas exitosamente`);
      }
      
      if (Object.keys(errors).length > 0) {
        const errorMessage = Object.entries(errors)
          .map(([key, error]) => `${key}: ${error}`)
          .join('\n');
        toast.error(`Errores al actualizar:\n${errorMessage}`);
      }
      
      return data;
    },
    onError: (error) => {
      console.error('Error al actualizar configuraciones:', error);
      toast.error('Error al actualizar las configuraciones');
      throw error;
    }
  });
};

/**
 * Hook para inicializar configuraciones por defecto
 */
export const useInitializeDefaultSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: initializeDefaultSettings,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
      toast.success('Configuraciones inicializadas exitosamente');
      return data;
    },
    onError: (error) => {
      console.error('Error al inicializar configuraciones:', error);
      toast.error('Error al inicializar las configuraciones');
      throw error;
    }
  });
}; 