import { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';
import toast from 'react-hot-toast';

/**
 * Hook personalizado para manejar toda la lógica de gestión de usuarios
 * Sigue las directrices de separar lógica de UI
 */
export const useUsers = () => {
  // Estados principales
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [groups, setGroups] = useState([]);
  
  // Estados de carga
  const [loading, setLoading] = useState({
    users: false,
    userStats: false,
    create: false,
    update: false,
    delete: false,
    export: false,
    import: false,
  });
  
  // Estados de paginación
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    limit: 10,
    totalPages: 0
  });

  // 🔄 Funciones para obtener datos
  const fetchUsers = useCallback(async (page = 1, filters = {}) => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const response = await userService.users.list(page, pagination.limit, filters);
      
      // Manejar formato de respuesta según directrices: {status: "success", data: {...}}
      if (response.status === 'success') {
        const data = response.data;
        setUsers(data.results || data);
        setPagination(prev => ({
          ...prev,
          current: page,
          total: data.count || data.length || 0,
          totalPages: Math.ceil((data.count || data.length || 0) / prev.limit)
        }));
      } else {
        // Fallback para respuestas directas del DRF ViewSet
        setUsers(response.results || response);
        setPagination(prev => ({
          ...prev,
          current: page,
          total: response.count || response.length || 0,
          totalPages: Math.ceil((response.count || response.length || 0) / prev.limit)
        }));
      }
    } catch (error) {
      console.error('❌ Error en fetchUsers:', error);
      toast.error(`Error al cargar usuarios: ${error.message}`);
      setUsers([]);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, [pagination.limit]);

  const fetchUserStats = useCallback(async () => {
    setLoading(prev => ({ ...prev, userStats: true }));
    try {
      const response = await userService.users.getStatistics();
      
      if (response.status === 'success') {
        setUserStats(response.data);
      } else {
        setUserStats(response);
      }
    } catch (error) {
      console.error('❌ Error en fetchUserStats:', error);
      toast.error(`Error al cargar estadísticas: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, userStats: false }));
    }
  }, []);

  // 👥 Función para obtener grupos disponibles
  const fetchGroups = useCallback(async () => {
    try {
      const response = await userService.users.getAvailableGroups();
      
      if (response.status === 'success') {
        setGroups(response.data);
      } else {
        setGroups(response.data || []);
      }
    } catch (error) {
      console.error('Error al cargar grupos:', error);
      toast.error(`Error al cargar grupos: ${error.message}`);
      setGroups([]);
    }
  }, []);

  // 👤 Funciones CRUD de usuarios
  const createUser = useCallback(async (userData) => {
    setLoading(prev => ({ ...prev, create: true }));
    try {
      const response = await userService.users.create(userData);
      
      if (response.status === 'success') {
        toast.success(response.message || 'Usuario creado exitosamente');
        // Actualizar lista después de crear
        await fetchUsers(pagination.current);
        return true;
      } else {
        // Fallback para respuestas directas
        toast.success('Usuario creado exitosamente');
        await fetchUsers(pagination.current);
        return true;
      }
    } catch (error) {
      console.error('❌ Error en createUser:', error);
      toast.error(`Error al crear usuario: ${error.message}`);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  }, [fetchUsers, pagination.current]);

  const updateUser = useCallback(async (id, userData) => {
    setLoading(prev => ({ ...prev, update: true }));
    try {
      const response = await userService.users.update(id, userData);
      
      if (response.status === 'success') {
        toast.success(response.message || 'Usuario actualizado exitosamente');
        // Actualizar el usuario en la lista local
        setUsers(prev => prev.map(user => 
          user.id === id ? { ...user, ...response.data } : user
        ));
        return true;
      } else {
        // Fallback para respuestas directas
        toast.success('Usuario actualizado exitosamente');
        setUsers(prev => prev.map(user => 
          user.id === id ? { ...user, ...response } : user
        ));
        return true;
      }
    } catch (error) {
      console.error('❌ Error en updateUser:', error);
      toast.error(`Error al actualizar usuario: ${error.message}`);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  }, []);

  const patchUser = useCallback(async (id, userData) => {
    setLoading(prev => ({ ...prev, update: true }));
    try {
      const response = await userService.users.patch(id, userData);
      
      if (response.status === 'success') {
        toast.success(response.message || 'Usuario actualizado exitosamente');
        // Actualizar el usuario en la lista local
        setUsers(prev => prev.map(user => 
          user.id === id ? { ...user, ...response.data } : user
        ));
        return true;
      } else {
        // Fallback para respuestas directas
        toast.success('Usuario actualizado exitosamente');
        setUsers(prev => prev.map(user => 
          user.id === id ? { ...user, ...response } : user
        ));
        return true;
      }
    } catch (error) {
      console.error('❌ Error en patchUser:', error);
      toast.error(`Error al actualizar usuario: ${error.message}`);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  }, []);

  const deleteUser = useCallback(async (id) => {
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      const response = await userService.users.delete(id);
      
      if (response.status === 'success') {
        toast.success(response.message || 'Usuario desactivado exitosamente');
        // Actualizar el estado local (desactivar en lugar de eliminar)
        setUsers(prev => prev.map(user => 
          user.id === id ? { ...user, is_active: false } : user
        ));
        return true;
      } else {
        toast.success('Usuario desactivado exitosamente');
        setUsers(prev => prev.map(user => 
          user.id === id ? { ...user, is_active: false } : user
        ));
        return true;
      }
    } catch (error) {
      console.error('❌ Error en deleteUser:', error);
      toast.error(`Error al desactivar usuario: ${error.message}`);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  }, []);

  const toggleUserActiveStatus = useCallback(async (id) => {
    setLoading(prev => ({ ...prev, update: true }));
    try {
      const response = await userService.users.toggleActiveStatus(id);
      
      if (response.status === 'success') {
        toast.success(response.message || 'Estado actualizado exitosamente');
        // Actualizar el estado local
        setUsers(prev => prev.map(user => 
          user.id === id ? { ...user, is_active: response.data.is_active } : user
        ));
        return true;
      } else {
        toast.success('Estado actualizado exitosamente');
        // Fallback: alternar el estado actual
        setUsers(prev => prev.map(user => 
          user.id === id ? { ...user, is_active: !user.is_active } : user
        ));
        return true;
      }
    } catch (error) {
      console.error('❌ Error en toggleUserActiveStatus:', error);
      toast.error(`Error al cambiar estado: ${error.message}`);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  }, []);

  // 🔐 Funciones de autenticación y perfil
  const registerUser = useCallback(async (registrationData) => {
    setLoading(prev => ({ ...prev, create: true }));
    try {
      const response = await userService.auth.register(registrationData);
      toast.success('Usuario registrado exitosamente');
      // Actualizar lista después de registrar
      await fetchUsers(pagination.current);
      return true;
    } catch (error) {
      console.error('❌ Error en registerUser:', error);
      toast.error(`Error al registrar usuario: ${error.message}`);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  }, [fetchUsers, pagination.current]);

  // 📊 Funciones de utilidades
  const exportUsers = useCallback(async (filters = {}) => {
    setLoading(prev => ({ ...prev, export: true }));
    try {
      const blob = await userService.utils.exportToCsv(filters);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Usuarios exportados exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error en exportUsers:', error);
      toast.error(`Error al exportar usuarios: ${error.message}`);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, export: false }));
    }
  }, []);

  const uploadUserImage = useCallback(async (userId, file, type = 'foto_perfil') => {
    setLoading(prev => ({ ...prev, update: true }));
    try {
      const response = await userService.utils.uploadImage(userId, file, type);
      
      toast.success('Imagen subida exitosamente');
      // Actualizar el usuario en la lista local
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, [type]: response[type] } : user
      ));
      return true;
    } catch (error) {
      console.error('❌ Error en uploadUserImage:', error);
      toast.error(`Error al subir imagen: ${error.message}`);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  }, []);

  const validateUsername = useCallback(async (username) => {
    try {
      return await userService.utils.validateUsername(username);
    } catch (error) {
      console.error('❌ Error en validateUsername:', error);
      return false;
    }
  }, []);

  // 📦 Importación masiva de usuarios
  const bulkImportUsers = useCallback(async (usersData) => {
    setLoading(prev => ({ ...prev, import: true }));
    try {
      const response = await userService.users.bulkImport(usersData);
      
      if (response.status === 'success') {
        const result = response.data;
        
        // Refrescar lista de usuarios después de importación exitosa
        await fetchUsers(1);
        
        // Mostrar notificación de éxito
        const successMessage = `✅ Importación completada: ${result.imported || 0} usuarios importados`;
        if (result.skipped > 0) {
          toast.success(`${successMessage}. ${result.skipped} omitidos.`);
        } else {
          toast.success(successMessage);
        }
        
        return {
          success: true,
          imported: result.imported || 0,
          skipped: result.skipped || 0,
          errors: result.errors || []
        };
      } else {
        throw new Error(response.message || 'Error en la importación');
      }
      
    } catch (error) {
      console.error('❌ Error en bulkImportUsers:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Error al importar usuarios';
      toast.error(`❌ ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage,
        details: error.response?.data
      };
    } finally {
      setLoading(prev => ({ ...prev, import: false }));
    }
  }, [fetchUsers]);

  // 🎯 Funciones de utilidad
  const getUserById = useCallback((id) => {
    return users.find(user => user.id === id);
  }, [users]);

  const getActiveUsers = useCallback(() => {
    return users.filter(user => user.is_active);
  }, [users]);

  const getInactiveUsers = useCallback(() => {
    return users.filter(user => !user.is_active);
  }, [users]);

  const refreshUsers = useCallback(() => {
    fetchUsers(pagination.current);
  }, [fetchUsers, pagination.current]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchUsers();
    fetchUserStats();
    fetchGroups();
  }, [fetchUsers, fetchUserStats, fetchGroups]);

  // Retornar estado y funciones
  return {
    // Estados principales
    users,
    userStats,
    groups,
    loading,
    pagination,
    
    // Funciones de datos
    fetchUsers,
    fetchUserStats,
    fetchGroups,
    refreshUsers,
    
    // Funciones CRUD
    createUser,
    updateUser,
    patchUser,
    deleteUser,
    toggleUserActiveStatus,
    
    // Funciones de autenticación
    registerUser,
    
    // Funciones de utilidades
    exportUsers,
    bulkImportUsers,
    uploadUserImage,
    validateUsername,
    
    // Funciones de utilidad
    getUserById,
    getActiveUsers,
    getInactiveUsers,
  };
};

export default useUsers;