/**
 * Hook para gestión de perfiles híbridos (Django Groups + GroupProfile)
 * Reutiliza el groupService creado anteriormente
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import groupService from '../services/groupService';

const useProfiles = () => {
  // Estados principales
  const [profiles, setProfiles] = useState([]);
  
  // Estados de carga
  const [loading, setLoading] = useState({
    profiles: false,
    create: false,
    update: false,
    delete: false,
    export: false,
  });

  // Función para obtener perfiles
  const fetchProfiles = useCallback(async () => {
    setLoading(prev => ({ ...prev, profiles: true }));
    try {
      const result = await groupService.list(1, 100); // Obtener todos los perfiles
      console.log('🔍 Resultado groupService.list (perfiles):', result);
      
      // Manejar diferentes formatos de respuesta
      let perfiles = [];
      if (Array.isArray(result)) {
        perfiles = result;
      } else if (result && Array.isArray(result.data)) {
        // Formato del GroupProfileViewSet: {success: true, data: [...], count: ...}
        perfiles = result.data;
      } else if (result && Array.isArray(result.results)) {
        // Formato DRF paginado: {results: [...], count: ...}
        perfiles = result.results;
      } else {
        console.warn('⚠️ Formato inesperado de perfiles:', result);
        perfiles = [];
      }
      
      setProfiles(perfiles);
    } catch (error) {
      console.error('❌ Error al obtener perfiles:', error);
      toast.error('Error al cargar perfiles');
      setProfiles([]); // Asegurar que profiles sea siempre un array
    } finally {
      setLoading(prev => ({ ...prev, profiles: false }));
    }
  }, []);

  // Función para crear perfil
  const createProfile = useCallback(async (profileData) => {
    if (!profileData || !profileData.name) {
      console.error('❌ Nombre del grupo requerido');
      toast.error('El nombre del grupo es requerido');
      return false;
    }

    setLoading(prev => ({ ...prev, create: true }));
    try {
      console.log('📝 Creando grupo:', profileData);
      
      const result = await groupService.create({
        name: profileData.name,
        permissions: profileData.permissions || []
      });
      
      console.log('✅ Grupo creado exitosamente:', result);
      toast.success('Grupo creado exitosamente');
      
      // Recargar lista de perfiles
      await fetchProfiles();
      return true;
    } catch (error) {
      console.error('❌ Error al crear grupo:', error);
      
      // Manejar errores específicos del backend
      if (error.message && error.message.includes('already exists')) {
        toast.error('Ya existe un grupo con ese nombre');
      } else {
        toast.error('Error al crear grupo');
      }
      return false;
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  }, [fetchProfiles]);

  // Función para actualizar perfil
  const updateProfile = useCallback(async (id, profileData) => {
    setLoading(prev => ({ ...prev, update: true }));
    try {
      await groupService.update(id, profileData);
      toast.success('Perfil actualizado exitosamente');
      
      // Recargar lista de perfiles
      await fetchProfiles();
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error);
      toast.error('Error al actualizar perfil');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  }, [fetchProfiles]);

  // Función para eliminar perfil
  const deleteProfile = useCallback(async (id) => {
    setLoading(prev => ({ ...prev, delete: true }));
    try {
      await groupService.delete(id);
      toast.success('Perfil eliminado exitosamente');
      
      // Recargar lista de perfiles
      await fetchProfiles();
    } catch (error) {
      console.error('❌ Error al eliminar perfil:', error);
      toast.error('Error al eliminar perfil');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  }, [fetchProfiles]);

  // Función para exportar perfiles
  const exportProfiles = useCallback(async () => {
    setLoading(prev => ({ ...prev, export: true }));
    try {
      // Implementar exportación cuando esté disponible en groupService
      console.log('📄 Exportando perfiles...');
      toast.success('Exportación iniciada');
    } catch (error) {
      console.error('❌ Error al exportar perfiles:', error);
      toast.error('Error al exportar perfiles');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, export: false }));
    }
  }, []);

  // Función para obtener opciones de permisos
  const getPermissionOptions = useCallback(async () => {
    try {
      // Estructura jerárquica de permisos desde endpoint nativo (si existe)
      if (groupService.getPermissionsStructure) {
        return await groupService.getPermissionsStructure();
      }
      return [];
    } catch (error) {
      console.error('❌ Error al obtener opciones de permisos:', error);
      return [];
    }
  }, []);

  // Función para obtener opciones de tipo de acceso
  const getAccessTypeOptions = useCallback(async () => {
    // Tipo de acceso quedó obsoleto (se deduce por convención _Web/_Movil)
    return [];
  }, []);

  // Funciones de utilidad
  const getProfileById = useCallback((id) => {
    return profiles.find(profile => profile.id === id);
  }, [profiles]);

  const getActiveProfiles = useCallback(() => {
    return profiles.filter(profile => profile.is_active);
  }, [profiles]);

  const getAdminProfiles = useCallback(() => {
    return profiles.filter(profile => profile.is_admin_group);
  }, [profiles]);

  const getWorkerProfiles = useCallback(() => {
    return profiles.filter(profile => profile.is_worker_group);
  }, [profiles]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Retornar estado y funciones
  return {
    // Estados principales
    profiles,
    loading,
    
    // Funciones de datos
    fetchProfiles,
    
    // Funciones CRUD
    createProfile,
    updateProfile,
    deleteProfile,
    
    // Funciones de utilidades
    exportProfiles,
    getPermissionOptions,
    getAccessTypeOptions,
    
    // Funciones de filtro
    getProfileById,
    getActiveProfiles,
    getAdminProfiles,
    getWorkerProfiles,
  };
};

export default useProfiles;