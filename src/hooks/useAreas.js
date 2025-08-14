import { useState, useEffect, useCallback } from 'react';
import areasService from '../services/areasService';
import toast from 'react-hot-toast';

/**
 * Hook personalizado para manejar toda la lógica de gestión de areas
 * Siguiendo el patrón del useUsers para consistencia
 */
export const useAreas = () => {
  // Estados principales
  const [areas, setAreas] = useState([]);
  const [areaStats, setAreaStats] = useState(null);
  const [cargos, setCargos] = useState([]);
  
  // Estados de carga
  const [loading, setLoading] = useState({
    areas: false,
    areaStats: false,
    cargos: false,
    create: false,
    update: false,
    delete: false,
    export: false,
  });
  
  // Estados de paginación
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    limit: 10,
    totalPages: 0
  });

  // 🔄 Funciones para obtener datos
  
  // Función para obtener areas
  const fetchAreas = useCallback(async (page = 1, filters = {}) => {
    try {
      setLoading(prev => ({ ...prev, areas: true }));
      
      const result = await areasService.areas.list(page, 10, filters);
      console.log('🏢 Resultado areasService.areas.list:', result);
      
      // Manejar diferentes formatos de respuesta
      let areasData = [];
      let totalCount = 0;
      
      if (result.status === 'success' && result.data) {
        // Formato: { status: 'success', data: [...], pagination: {...} }
        areasData = Array.isArray(result.data) ? result.data : [];
        totalCount = result.pagination?.count || result.count || areasData.length;
      } else if (result.results) {
        // Formato paginado estándar: { results: [...], count: ..., next: ..., previous: ... }
        areasData = result.results;
        totalCount = result.count || areasData.length;
      } else if (Array.isArray(result)) {
        // Formato array directo
        areasData = result;
        totalCount = areasData.length;
      }

      setAreas(areasData);
      setPagination(prev => ({
        ...prev,
        current: page,
        total: totalCount,
        totalPages: Math.ceil(totalCount / 10)
      }));

      console.log('✅ Areas cargadas:', areasData.length);
      
    } catch (error) {
      console.error('❌ Error fetching areas:', error);
      toast.error(`Error al cargar areas: ${error.message}`);
      setAreas([]);
    } finally {
      setLoading(prev => ({ ...prev, areas: false }));
    }
  }, []);

  // Función para obtener cargos
  const fetchCargos = useCallback(async (filters = {}) => {
    try {
      setLoading(prev => ({ ...prev, cargos: true }));
      
      const result = await areasService.cargos.simple(); // Usar simple en lugar de list
      console.log('👔 Resultado areasService.cargos.simple:', result);
      
      // Manejar diferentes formatos de respuesta
      let cargosData = [];
      
      if (result.status === 'success' && result.data) {
        cargosData = Array.isArray(result.data) ? result.data : [];
      } else if (result.results) {
        cargosData = result.results;
      } else if (Array.isArray(result)) {
        cargosData = result;
      }

      setCargos(cargosData);
      console.log('✅ Cargos cargados:', cargosData.length);
      
    } catch (error) {
      console.error('❌ Error fetching cargos:', error);
      toast.error(`Error al cargar cargos: ${error.message}`);
      setCargos([]);
    } finally {
      setLoading(prev => ({ ...prev, cargos: false }));
    }
  }, []);

  // Función para crear area
  const createArea = useCallback(async (areaData) => {
    try {
      setLoading(prev => ({ ...prev, create: true }));
      
      const result = await areasService.areas.create(areaData);
      console.log('✅ Area creada:', result);
      
      toast.success('Área creada exitosamente');
      
      // Recargar areas
      await fetchAreas();
      
      return result;
    } catch (error) {
      console.error('❌ Error creating area:', error);
      
      // Manejo específico de errores de validación
      if (error.message.includes('ya existe') || error.message.includes('unique')) {
        toast.error('Ya existe un área con ese nombre');
      } else {
        toast.error(`Error al crear área: ${error.message}`);
      }
      
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  }, []);

  // Función para actualizar area
  const updateArea = useCallback(async (id, areaData) => {
    try {
      setLoading(prev => ({ ...prev, update: true }));
      
      const result = await areasService.areas.update(id, areaData);
      console.log('✅ Area actualizada:', result);
      
      toast.success('Área actualizada exitosamente');
      
      // Recargar areas
      await fetchAreas();
      
      return result;
    } catch (error) {
      console.error('❌ Error updating area:', error);
      
      if (error.message.includes('ya existe') || error.message.includes('unique')) {
        toast.error('Ya existe un área con ese nombre');
      } else {
        toast.error(`Error al actualizar área: ${error.message}`);
      }
      
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  }, []);

  // Función para eliminar area
  const deleteArea = useCallback(async (id) => {
    try {
      setLoading(prev => ({ ...prev, delete: true }));
      
      await areasService.areas.delete(id);
      console.log('✅ Area eliminada:', id);
      
      toast.success('Área eliminada exitosamente');
      
      // Recargar areas
      await fetchAreas();
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting area:', error);
      
      if (error.message.includes('cargos') || error.message.includes('usuarios')) {
        toast.error('No se puede eliminar el área porque tiene cargos o usuarios asignados');
      } else {
        toast.error(`Error al eliminar área: ${error.message}`);
      }
      
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  }, []);

  // Función para alternar estado activo
  const toggleAreaActiveStatus = useCallback(async (id) => {
    try {
      // Encontrar el area actual
      const area = areas.find(a => a.id === id);
      if (!area) return;
      
      const response = await areasService.areas.toggleActiveStatus(id);
      console.log('✅ Estado del area cambiado:', response);
      
      if (response.status === 'success') {
        toast.success(response.message);
        
        // Actualizar estado local con los datos del servidor
        if (response.data) {
          setAreas(prev => prev.map(a => 
            a.id === id ? { ...a, ...response.data } : a
          ));
        } else {
          // Fallback: actualizar solo el estado
          setAreas(prev => prev.map(a => 
            a.id === id ? { ...a, is_active: !a.is_active } : a
          ));
        }
      }
      
    } catch (error) {
      console.error('❌ Error toggling area status:', error);
      toast.error(`Error al cambiar estado del área: ${error.message}`);
      throw error;
    }
  }, [areas]);

  // Función para obtener areas con cargos
  const fetchAreasWithCargos = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, areas: true }));
      
      const result = await areasService.areas.withCargos();
      console.log('🏢👔 Areas con cargos:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error fetching areas with cargos:', error);
      toast.error(`Error al cargar areas con cargos: ${error.message}`);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, areas: false }));
    }
  }, []);

  // Función para obtener usuarios de un area
  const getAreaUsuarios = useCallback(async (areaId) => {
    try {
      const result = await areasService.areas.getUsuarios(areaId);
      console.log(`👥 Usuarios del area ${areaId}:`, result);
      
      return result;
    } catch (error) {
      console.error('❌ Error fetching area usuarios:', error);
      toast.error(`Error al cargar usuarios del área: ${error.message}`);
      throw error;
    }
  }, []);

  // Función para obtener cargos de un area
  const getAreaCargos = useCallback(async (areaId) => {
    try {
      const result = await areasService.areas.getCargos(areaId);
      console.log(`👔 Cargos del area ${areaId}:`, result);
      
      return result;
    } catch (error) {
      console.error('❌ Error fetching area cargos:', error);
      toast.error(`Error al cargar cargos del área: ${error.message}`);
      throw error;
    }
  }, []);

  // Función para validar nombre de area
  const validateAreaName = useCallback(async (nombre, excludeId = null) => {
    try {
      const result = await areasService.utils.validateAreaName(nombre, excludeId);
      return result;
    } catch (error) {
      console.error('❌ Error validating area name:', error);
      return { exists: false, areas: [] };
    }
  }, []);

  // Función para obtener areas simples (para dropdowns)
  const fetchAreasSimple = useCallback(async () => {
    try {
      const result = await areasService.areas.simple();
      
      let areasData = [];
      if (result.status === 'success' && result.data) {
        areasData = Array.isArray(result.data) ? result.data : [];
      } else if (result.results) {
        areasData = result.results;
      } else if (Array.isArray(result)) {
        areasData = result;
      }
      
      return areasData;
    } catch (error) {
      console.error('❌ Error fetching simple areas:', error);
      return [];
    }
  }, []);

  // 📊 Funciones para cargos (CRUD básico)
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
      toast.error(`Error al crear cargo: ${error.message}`);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  }, []);

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
      toast.error(`Error al actualizar cargo: ${error.message}`);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  }, []);

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
  }, []);

  // 🔄 Efecto para cargar datos iniciales (solo una vez)
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialData = async () => {
      if (isMounted) {
        await Promise.all([
          fetchAreas(),
          fetchCargos()
        ]);
      }
    };
    
    loadInitialData();
    
    return () => {
      isMounted = false;
    };
  }, []); // Sin dependencias para ejecutar solo una vez

  // Retornar toda la funcionalidad
  return {
    // Estados
    areas,
    areaStats,
    cargos,
    loading,
    pagination,
    
    // Funciones de areas
    fetchAreas,
    createArea,
    updateArea,
    deleteArea,
    toggleAreaActiveStatus,
    fetchAreasWithCargos,
    getAreaUsuarios,
    getAreaCargos,
    validateAreaName,
    fetchAreasSimple,
    
    // Funciones de cargos
    fetchCargos,
    createCargo,
    updateCargo,
    deleteCargo,
    
    // Utilidades
    refreshData: useCallback(() => {
      fetchAreas();
      fetchCargos();
    }, [])
  };
};
