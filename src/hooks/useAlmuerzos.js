/**
 * Hook personalizado para gestión de almuerzos
 * Basado en useEventos, adaptado para la API de almuerzos
 */

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { 
  getAlmuerzos,
  getAlmuerzo,
  createAlmuerzo,
  updateAlmuerzo,
  patchAlmuerzo,
  deleteAlmuerzo,
  getAlmuerzosStatistics,
  bulkCreateWeekAlmuerzos
} from '../services/almuerzosService';

/**
 * Hook useAlmuerzos - Gestión completa del estado de almuerzos
 */
export const useAlmuerzos = () => {
  const [almuerzos, setAlmuerzos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cargar lista de almuerzos
  const loadAlmuerzos = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAlmuerzos(params);
      
      let almuerzosData = [];
      
      // Manejar diferentes estructuras de respuesta
      if (response?.results) {
        almuerzosData = response.results;
      } else if (response?.data) {
        almuerzosData = Array.isArray(response.data) ? response.data : [response.data];
      } else if (Array.isArray(response)) {
        almuerzosData = response;
      } else {
        almuerzosData = [];
      }
      
      setAlmuerzos(almuerzosData);
      
    } catch (error) {
      console.error('❌ Error loading almuerzos:', error);
      setError(error.message || 'Error al cargar almuerzos');
      toast.error('Error al cargar almuerzos');
      setAlmuerzos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar estadísticas
  const loadStatistics = useCallback(async () => {
    try {
      const response = await getAlmuerzosStatistics();
      if (response?.status === 'success') {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }, []);

  // Crear nuevo almuerzo
  const crearAlmuerzo = useCallback(async (almuerzoData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await createAlmuerzo(almuerzoData);
      
      // Verificar estructura de respuesta
      const newAlmuerzo = response?.data || response;
      
      if (newAlmuerzo) {
        setAlmuerzos(prevAlmuerzos => [newAlmuerzo, ...prevAlmuerzos]);
        toast.success('Almuerzo creado exitosamente');
        return newAlmuerzo;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
      
    } catch (error) {
      console.error('Error creating almuerzo:', error);
      
      const errorMessage = error?.data?.error?.message || 
                          error?.message || 
                          'Error al crear almuerzo';
      
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar almuerzo existente
  const actualizarAlmuerzo = useCallback(async (id, almuerzoData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await updateAlmuerzo(id, almuerzoData);
      
      // Verificar estructura de respuesta
      const updatedAlmuerzo = response?.data || response;
      
      if (updatedAlmuerzo) {
        setAlmuerzos(prevAlmuerzos =>
          prevAlmuerzos.map(almuerzo =>
            almuerzo.id === id ? updatedAlmuerzo : almuerzo
          )
        );
        toast.success('Almuerzo actualizado exitosamente');
        return updatedAlmuerzo;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
      
    } catch (error) {
      console.error('Error updating almuerzo:', error);
      
      const errorMessage = error?.data?.error?.message || 
                          error?.message || 
                          'Error al actualizar almuerzo';
      
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar almuerzo
  const eliminarAlmuerzo = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      await deleteAlmuerzo(id);
      
      setAlmuerzos(prevAlmuerzos =>
        prevAlmuerzos.filter(almuerzo => almuerzo.id !== id)
      );
      
      toast.success('Almuerzo eliminado exitosamente');
      
    } catch (error) {
      console.error('Error deleting almuerzo:', error);
      
      const errorMessage = error?.data?.error?.message || 
                          error?.message || 
                          'Error al eliminar almuerzo';
      
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Alternar estado activo
  const alternarEstado = useCallback(async (id, active) => {
    try {
      setLoading(true);
      setError(null);

      // Usar PATCH en lugar de PUT para actualización parcial
      const response = await patchAlmuerzo(id, { active });
      
      const updatedAlmuerzo = response?.data || response;
      
      if (updatedAlmuerzo) {
        setAlmuerzos(prevAlmuerzos =>
          prevAlmuerzos.map(almuerzo =>
            almuerzo.id === id ? { ...almuerzo, active: active } : almuerzo
          )
        );
        toast.success(`Almuerzo ${active ? 'activado' : 'desactivado'} exitosamente`);
        return updatedAlmuerzo;
      }
      
    } catch (error) {
      console.error('❌ Error toggling almuerzo status:', error);
      
      const errorMessage = error?.data?.error?.message || 
                          error?.message || 
                          'Error al cambiar estado del almuerzo';
      
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear semana de almuerzos
  const crearSemanaAlmuerzos = useCallback(async (weekData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await bulkCreateWeekAlmuerzos(weekData);
      
      if (response?.status === 'success') {
        // Recargar almuerzos después de crear la semana
        await loadAlmuerzos();
        
        const { created, errors } = response.data;
        
        if (errors && errors.length > 0) {
          toast.success(`Se crearon ${created} almuerzos. Algunos tuvieron errores.`);
          console.warn('Errores al crear semana:', errors);
        } else {
          toast.success(`Se crearon ${created} almuerzos para la semana`);
        }
        
        return response.data;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
      
    } catch (error) {
      console.error('Error creating week almuerzos:', error);
      
      const errorMessage = error?.data?.error?.message || 
                          error?.message || 
                          'Error al crear semana de almuerzos';
      
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadAlmuerzos]);

  return {
    // Estado
    almuerzos,
    loading,
    error,
    statistics,
    
    // Acciones básicas
    loadAlmuerzos,
    loadStatistics,
    clearError,
    
    // CRUD Operations
    crearAlmuerzo,
    actualizarAlmuerzo,
    eliminarAlmuerzo,
    
    // Acciones especiales
    alternarEstado,
    crearSemanaAlmuerzos,
  };
};

export default useAlmuerzos;
