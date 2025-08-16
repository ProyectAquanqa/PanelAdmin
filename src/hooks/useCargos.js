import { useState, useEffect, useCallback } from 'react';
import areasService from '../services/areasService';
import toast from 'react-hot-toast';

/**
 * Hook personalizado para manejar toda la lógica de gestión de cargos
 * Siguiendo el patrón del useAreas para consistencia
 */
export const useCargos = () => {
  // Estados principales
  const [cargos, setCargos] = useState([]);
  const [areas, setAreas] = useState([]);
  const [cargoStats, setCargoStats] = useState(null);
  
  // Estados de carga
  const [loading, setLoading] = useState({
    cargos: false,
    areas: false,
    cargoStats: false,
    create: false,
    update: false,
    delete: false,
    export: false,
    error: null
  });
  
  // Estados de paginación
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    limit: 10,
    totalPages: 0
  });

  // 🔄 Funciones para obtener datos
  
  // Función para obtener cargos
  const fetchCargos = useCallback(async (page = 1, filters = {}) => {
    try {
      setLoading(prev => ({ ...prev, cargos: true, error: null }));
      
      const result = await areasService.cargos.list(page, 50, filters); // Usar límite mayor para módulo simple
      console.log('👔 Resultado areasService.cargos.list:', result);
      
      // Manejar diferentes formatos de respuesta
      let cargosData = [];
      let totalCount = 0;
      
      if (result.status === 'success' && result.data) {
        // Formato: { status: 'success', data: [...], pagination: {...} }
        cargosData = Array.isArray(result.data) ? result.data : [];
        totalCount = result.pagination?.count || result.count || cargosData.length;
      } else if (result.results) {
        // Formato paginado estándar: { results: [...], count: ..., next: ..., previous: ... }
        cargosData = result.results;
        totalCount = result.count || cargosData.length;
      } else if (Array.isArray(result)) {
        // Formato array directo
        cargosData = result;
        totalCount = cargosData.length;
      }

      setCargos(cargosData);
      setPagination(prev => ({
        ...prev,
        current: page,
        total: totalCount,
        totalPages: Math.ceil(totalCount / 50)
      }));

      console.log('✅ Cargos cargados:', cargosData.length);
      
    } catch (error) {
      console.error('❌ Error fetching cargos:', error);
      toast.error(`Error al cargar cargos: ${error.message}`);
      setCargos([]);
      setLoading(prev => ({ ...prev, error: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, cargos: false }));
    }
  }, []);

  // Función para obtener áreas (para dropdowns)
  const fetchAreas = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, areas: true }));
      
      const result = await areasService.areas.simple();
      console.log('🏢 Resultado areasService.areas.simple:', result);
      
      // Manejar diferentes formatos de respuesta
      let areasData = [];
      
      if (result.status === 'success' && result.data) {
        areasData = Array.isArray(result.data) ? result.data : [];
      } else if (result.results) {
        areasData = result.results;
      } else if (Array.isArray(result)) {
        areasData = result;
      }

      setAreas(areasData);
      console.log('✅ Áreas cargadas para cargos:', areasData.length);
      
    } catch (error) {
      console.error('❌ Error fetching areas for cargos:', error);
      toast.error(`Error al cargar áreas: ${error.message}`);
      setAreas([]);
    } finally {
      setLoading(prev => ({ ...prev, areas: false }));
    }
  }, []);

  // Función para crear cargo
  const createCargo = useCallback(async (cargoData) => {
    try {
      setLoading(prev => ({ ...prev, create: true }));
      
      const result = await areasService.cargos.create(cargoData);
      console.log('✅ Cargo creado:', result);
      
      toast.success('Cargo creado exitosamente');
      
      // Recargar cargos
      await fetchCargos();
      
      return result;
    } catch (error) {
      console.error('❌ Error creating cargo:', error);
      
      // Manejo específico de errores de validación
      if (error.message.includes('ya existe') || error.message.includes('unique')) {
        toast.error('Ya existe un cargo con ese nombre en esta área');
      } else if (error.message.includes('área inactiva')) {
        toast.error('No se puede crear un cargo en un área inactiva');
      } else {
        toast.error(`Error al crear cargo: ${error.message}`);
      }
      
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  }, [fetchCargos]);

  // Función para actualizar cargo
  const updateCargo = useCallback(async (id, cargoData) => {
    try {
      setLoading(prev => ({ ...prev, update: true }));
      
      const result = await areasService.cargos.update(id, cargoData);
      console.log('✅ Cargo actualizado:', result);
      
      toast.success('Cargo actualizado exitosamente');
      
      // Recargar cargos
      await fetchCargos();
      
      return result;
    } catch (error) {
      console.error('❌ Error updating cargo:', error);
      
      if (error.message.includes('ya existe') || error.message.includes('unique')) {
        toast.error('Ya existe un cargo con ese nombre en esta área');
      } else if (error.message.includes('área inactiva')) {
        toast.error('No se puede asignar un cargo a un área inactiva');
      } else {
        toast.error(`Error al actualizar cargo: ${error.message}`);
      }
      
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  }, [fetchCargos]);

  // Función para eliminar cargo
  const deleteCargo = useCallback(async (id) => {
    try {
      setLoading(prev => ({ ...prev, delete: true }));
      
      await areasService.cargos.delete(id);
      console.log('✅ Cargo eliminado:', id);
      
      toast.success('Cargo eliminado exitosamente');
      
      // Recargar cargos
      await fetchCargos();
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting cargo:', error);
      
      if (error.message.includes('usuarios')) {
        toast.error('No se puede eliminar el cargo porque tiene usuarios asignados');
      } else {
        toast.error(`Error al eliminar cargo: ${error.message}`);
      }
      
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  }, [fetchCargos]);

  // Función para obtener usuarios de un cargo
  const getCargoUsuarios = useCallback(async (cargoId) => {
    try {
      const result = await areasService.cargos.getUsuarios(cargoId);
      console.log(`👥 Usuarios del cargo ${cargoId}:`, result);
      
      return result;
    } catch (error) {
      console.error('❌ Error fetching cargo usuarios:', error);
      toast.error(`Error al cargar usuarios del cargo: ${error.message}`);
      throw error;
    }
  }, []);

  // Función para validar nombre de cargo (verificar unicidad en el área)
  const validateCargoName = useCallback(async (nombre, areaId, excludeId = null) => {
    try {
      // Verificar localmente primero
      const existingCargo = cargos.find(cargo => 
        cargo.nombre.toLowerCase().trim() === nombre.toLowerCase().trim() &&
        cargo.area === parseInt(areaId) &&
        cargo.id !== excludeId
      );
      
      return { 
        exists: !!existingCargo, 
        cargo: existingCargo 
      };
    } catch (error) {
      console.error('❌ Error validating cargo name:', error);
      return { exists: false, cargo: null };
    }
  }, [cargos]);

  // Función para obtener cargos simples (para dropdowns)
  const fetchCargosSimple = useCallback(async () => {
    try {
      const result = await areasService.cargos.simple();
      
      let cargosData = [];
      if (result.status === 'success' && result.data) {
        cargosData = Array.isArray(result.data) ? result.data : [];
      } else if (result.results) {
        cargosData = result.results;
      } else if (Array.isArray(result)) {
        cargosData = result;
      }
      
      return cargosData;
    } catch (error) {
      console.error('❌ Error fetching simple cargos:', error);
      return [];
    }
  }, []);

  // Función para obtener estadísticas de cargos
  const fetchCargoStats = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, cargoStats: true }));
      
      // Calcular estadísticas basadas en los datos actuales
      const stats = {
        total: cargos.length,
        conUsuarios: cargos.filter(cargo => (cargo.total_usuarios || 0) > 0).length,
        sinUsuarios: cargos.filter(cargo => (cargo.total_usuarios || 0) === 0).length,
        areasActivas: cargos.filter(cargo => cargo.area_detail?.is_active).length,
        areasInactivas: cargos.filter(cargo => !cargo.area_detail?.is_active).length,
        totalUsuarios: cargos.reduce((sum, cargo) => sum + (cargo.total_usuarios || 0), 0)
      };
      
      setCargoStats(stats);
      console.log('📊 Estadísticas de cargos calculadas:', stats);
      
      return stats;
    } catch (error) {
      console.error('❌ Error calculating cargo stats:', error);
      setCargoStats(null);
    } finally {
      setLoading(prev => ({ ...prev, cargoStats: false }));
    }
  }, [cargos]);

  // Calcular estadísticas automáticamente cuando cambien los cargos
  useEffect(() => {
    if (cargos.length > 0) {
      fetchCargoStats();
    }
  }, [cargos, fetchCargoStats]);

  // Retornar toda la funcionalidad
  return {
    // Estados
    cargos,
    areas,
    cargoStats,
    loading,
    pagination,
    
    // Funciones de cargos
    fetchCargos,
    createCargo,
    updateCargo,
    deleteCargo,
    getCargoUsuarios,
    validateCargoName,
    fetchCargosSimple,
    fetchCargoStats,
    
    // Funciones de áreas
    fetchAreas,
    
    // Utilidades
    refreshData: useCallback(() => {
      fetchCargos();
      fetchAreas();
    }, [fetchCargos, fetchAreas])
  };
};
