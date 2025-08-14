import { useState, useEffect, useCallback } from 'react';
import devicesService from '../services/devicesService';
import toast from 'react-hot-toast';

/**
 * Hook personalizado para gestión de dispositivos registrados
 * Proporciona todas las funciones necesarias para CRUD y manejo de estado
 */
const useDevices = () => {
  // Estados principales
  const [devices, setDevices] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Estados para filtros y paginación
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    page: 1,
    limit: 10
  });

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    hasNext: false,
    hasPrev: false
  });

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  /**
   * Cargar lista de dispositivos
   */
  const loadDevices = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const response = await devicesService.devices.list(
        filters.page,
        filters.limit,
        filters.search,
        filters.type,
        filters.status
      );

      setDevices(response.results || []);
      setPagination({
        total: response.count || 0,
        totalPages: Math.ceil((response.count || 0) / filters.limit),
        currentPage: filters.page,
        hasNext: !!response.next,
        hasPrev: !!response.previous
      });

    } catch (error) {
      console.error('Error cargando dispositivos:', error);
      setError(error.message || 'Error al cargar dispositivos');
      toast.error('Error al cargar dispositivos');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [filters]);

  /**
   * Cargar tipos de dispositivos
   */
  const loadDeviceTypes = useCallback(async () => {
    try {
      const response = await devicesService.deviceTypes.list();
      setDeviceTypes(response.results || response || []);
    } catch (error) {
      console.error('Error cargando tipos de dispositivos:', error);
    }
  }, []);

  /**
   * Cargar usuarios para asignación
   */
  const loadUsers = useCallback(async () => {
    try {
      // Aquí deberías usar el servicio de usuarios
      // const response = await userService.list();
      // setUsers(response.results || response || []);
      setUsers([]); // Por ahora vacío hasta implementar el servicio de usuarios
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  }, []);

  /**
   * Cargar estadísticas
   */
  const loadStats = useCallback(async () => {
    try {
      const response = await devicesService.devices.getStats();
      setStats(response);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }, []);

  /**
   * Crear nuevo dispositivo
   */
  const createDevice = async (deviceData) => {
    try {
      setModalLoading(true);
      const newDevice = await devicesService.devices.create(deviceData);
      
      // Actualizar lista local
      setDevices(prev => [newDevice, ...prev]);
      
      toast.success('Dispositivo registrado exitosamente');
      setIsCreateModalOpen(false);
      
      // Recargar datos
      await loadDevices(false);
      await loadStats();
      
      return newDevice;
    } catch (error) {
      console.error('Error creando dispositivo:', error);
      toast.error(error.message || 'Error al registrar dispositivo');
      throw error;
    } finally {
      setModalLoading(false);
    }
  };

  /**
   * Actualizar dispositivo existente
   */
  const updateDevice = async (id, deviceData) => {
    try {
      setModalLoading(true);
      const updatedDevice = await devicesService.devices.update(id, deviceData);
      
      // Actualizar lista local
      setDevices(prev => 
        prev.map(device => 
          device.id === id ? updatedDevice : device
        )
      );
      
      toast.success('Dispositivo actualizado exitosamente');
      setIsEditModalOpen(false);
      setSelectedDevice(null);
      
      return updatedDevice;
    } catch (error) {
      console.error('Error actualizando dispositivo:', error);
      toast.error(error.message || 'Error al actualizar dispositivo');
      throw error;
    } finally {
      setModalLoading(false);
    }
  };

  /**
   * Eliminar dispositivo
   */
  const deleteDevice = async (id) => {
    try {
      const result = await devicesService.devices.delete(id);
      
      // Remover de lista local
      setDevices(prev => prev.filter(device => device.id !== id));
      
      toast.success(result.message || 'Token de dispositivo eliminado exitosamente');
      
      // Recargar estadísticas
      await loadStats();
      
      return result;
    } catch (error) {
      console.error('Error eliminando dispositivo:', error);
      
      // Mostrar error específico al usuario
      const errorMessage = error.message || 'Error al eliminar token del dispositivo';
      toast.error(errorMessage);
      
      throw error;
    }
  };

  /**
   * Cambiar estado activo/inactivo
   */
  const toggleDeviceStatus = async (id, isActive) => {
    try {
      const updatedDevice = await devicesService.devices.toggleStatus(id, isActive);
      
      // Actualizar lista local
      setDevices(prev => 
        prev.map(device => 
          device.id === id ? { ...device, is_active: isActive } : device
        )
      );
      
      toast.success(`Dispositivo ${isActive ? 'activado' : 'desactivado'} exitosamente`);
      
      return updatedDevice;
    } catch (error) {
      console.error('Error cambiando estado del dispositivo:', error);
      toast.error(error.message || 'Error al cambiar estado del dispositivo');
      throw error;
    }
  };

  /**
   * Importación masiva
   */
  const bulkImportDevices = async (file) => {
    try {
      setLoading(true);
      const response = await devicesService.devices.bulkImport(file);
      
      toast.success(`${response.imported_count || 0} dispositivos importados exitosamente`);
      
      // Recargar datos
      await loadDevices(false);
      await loadStats();
      
      return response;
    } catch (error) {
      console.error('Error en importación masiva:', error);
      toast.error(error.message || 'Error en la importación masiva');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar filtros
   */
  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.search !== prev.search ? 1 : prev.page // Reset page si cambia búsqueda
    }));
  };

  /**
   * Cambiar página
   */
  const changePage = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  /**
   * Limpiar filtros
   */
  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      status: '',
      page: 1,
      limit: 10
    });
  };

  // Funciones para manejo de modales
  const openCreateModal = () => {
    setSelectedDevice(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (device) => {
    setSelectedDevice(device);
    setIsEditModalOpen(true);
  };

  const openDetailModal = (device) => {
    setSelectedDevice(device);
    setIsDetailModalOpen(true);
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedDevice(null);
  };

  // Efectos
  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  useEffect(() => {
    loadDeviceTypes();
    loadUsers();
    loadStats();
  }, [loadDeviceTypes, loadUsers, loadStats]);

  // Datos calculados
  const totalDevices = pagination.total;
  const activeDevices = devices.filter(device => device.is_active).length;
  const inactiveDevices = devices.filter(device => !device.is_active).length;

  return {
    // Estados principales
    devices,
    deviceTypes,
    users,
    loading,
    error,
    stats,

    // Filtros y paginación
    filters,
    pagination,
    updateFilters,
    changePage,
    clearFilters,

    // CRUD operations
    createDevice,
    updateDevice,
    deleteDevice,
    toggleDeviceStatus,
    bulkImportDevices,

    // Funciones de carga
    loadDevices,
    loadDeviceTypes,
    loadUsers,
    loadStats,

    // Estados y funciones de modales
    isCreateModalOpen,
    isEditModalOpen,
    isDetailModalOpen,
    selectedDevice,
    modalLoading,
    openCreateModal,
    openEditModal,
    openDetailModal,
    closeModals,

    // Datos calculados
    totalDevices,
    activeDevices,
    inactiveDevices,

    // Función de refresco general
    refresh: () => {
      loadDevices();
      loadStats();
    }
  };
};

export default useDevices;
