/**
 * Hook mejorado para gestión de permisos dinámicos
 * Integra el nuevo dynamicPermissionsService con la funcionalidad existente
 * Proporciona una interfaz unificada para el manejo de permisos y perfiles
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamicPermissionsService from '../services/dynamicPermissionsService';
import groupService from '../services/groupService';
import { toast } from 'react-hot-toast';

const useDynamicPermissions = () => {
  // Estados principales
  const [permissionsStructure, setPermissionsStructure] = useState(null);
  const [moduleStructure, setModuleStructure] = useState(null);
  const [loading, setLoading] = useState({
    permissions: false,
    modules: false,
    saving: false
  });
  const [error, setError] = useState(null);

  // Cargar estructura de permisos dinámicamente
  const loadPermissionsStructure = useCallback(async (forProfileManagement = false) => {
    setLoading(prev => ({ ...prev, permissions: true }));
    setError(null);

    try {
      console.log('🔄 Cargando estructura de permisos...', forProfileManagement ? 'PARA GESTIÓN DE PERFILES' : 'NORMAL');
      
      const [permissions, modules] = await Promise.all([
        dynamicPermissionsService.getPermissionsStructure(),
        forProfileManagement 
          ? dynamicPermissionsService.getCompleteModuleStructureForProfiles()
          : dynamicPermissionsService.getModulePermissionsStructure()
      ]);

      setPermissionsStructure(permissions);
      setModuleStructure(modules);
      
      console.log('✅ Estructura de permisos cargada:', { 
        permissions, 
        modules, 
        isForProfiles: forProfileManagement,
        moduleCount: Object.keys(modules).length 
      });
      
    } catch (error) {
      console.error('❌ Error cargando permisos:', error);
      setError(error.message || 'Error cargando permisos');
      toast.error('Error al cargar la estructura de permisos');
    } finally {
      setLoading(prev => ({ ...prev, permissions: false }));
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadPermissionsStructure();
  }, [loadPermissionsStructure]);

  // Obtener permisos para un submódulo específico
  const getPermissionsForSubmodule = useCallback(async (submoduleId) => {
    try {
      return await dynamicPermissionsService.getPermissionsForSubmodule(submoduleId);
    } catch (error) {
      console.error(`Error obteniendo permisos para ${submoduleId}:`, error);
      return [];
    }
  }, []);

  // Convertir selecciones simplificadas a IDs de permisos
  const convertSelectionsToPermissionIds = useCallback(async (simplifiedSelections) => {
    try {
      return await dynamicPermissionsService.convertSimplifiedSelectionsToPermissionIds(simplifiedSelections);
    } catch (error) {
      console.error('Error convirtiendo selecciones:', error);
      return [];
    }
  }, []);

  // Convertir IDs de permisos a selecciones simplificadas
  const convertPermissionIdsToSelections = useCallback(async (permissionIds) => {
    try {
      return await dynamicPermissionsService.convertPermissionIdsToSimplifiedSelections(permissionIds);
    } catch (error) {
      console.error('Error convirtiendo IDs de permisos:', error);
      return {};
    }
  }, []);

  // Crear un perfil con permisos
  const createProfileWithPermissions = useCallback(async (profileData) => {
    setLoading(prev => ({ ...prev, saving: true }));
    
    try {
      console.log('📝 Creando perfil con permisos:', profileData);
      
      // Validar datos básicos
      if (!profileData.name || !profileData.name.trim()) {
        throw new Error('El nombre del perfil es requerido');
      }

      // Preparar datos para el backend
      const dataForBackend = {
        name: profileData.name.trim(),
        permissions: profileData.permissions || []
      };

      // Crear usando groupService
      const result = await groupService.create(dataForBackend);
      
      console.log('✅ Perfil creado exitosamente:', result);
      toast.success(`Perfil "${profileData.name}" creado exitosamente`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Error creando perfil:', error);
      toast.error(error.message || 'Error al crear perfil');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  }, []);

  // Actualizar un perfil con permisos
  const updateProfileWithPermissions = useCallback(async (profileId, profileData) => {
    setLoading(prev => ({ ...prev, saving: true }));
    
    try {
      console.log('📝 Actualizando perfil con permisos:', { profileId, profileData });
      
      // Preparar datos para el backend
      const dataForBackend = {
        name: profileData.name.trim(),
        permissions: profileData.permissions || []
      };

      // Actualizar usando groupService
      const result = await groupService.update(profileId, dataForBackend);
      
      console.log('✅ Perfil actualizado exitosamente:', result);
      toast.success(`Perfil "${profileData.name}" actualizado exitosamente`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      toast.error(error.message || 'Error al actualizar perfil');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  }, []);

  // Obtener resumen de un perfil con conteo de permisos por módulo
  const getProfileSummary = useCallback((profile) => {
    if (!profile || !profile.permissions || !moduleStructure) {
      return {
        name: profile?.name || 'Sin nombre',
        totalPermissions: 0,
        moduleBreakdown: {}
      };
    }

    const permissionIds = profile.permissions.map(p => p.id || p);
    const moduleBreakdown = {};
    let totalPermissions = 0;

    // Contar permisos por módulo
    Object.entries(moduleStructure).forEach(([moduleKey, moduleData]) => {
      let modulePermissions = 0;
      
      if (moduleData.submodules) {
        moduleData.submodules.forEach(submodule => {
          if (submodule.permissions) {
            const submodulePermissions = submodule.permissions.filter(p => 
              permissionIds.includes(p.id)
            ).length;
            modulePermissions += submodulePermissions;
          }
        });
      }

      if (modulePermissions > 0) {
        moduleBreakdown[moduleKey] = {
          count: modulePermissions,
          title: moduleData.title
        };
        totalPermissions += modulePermissions;
      }
    });

    return {
      name: profile.name,
      totalPermissions,
      moduleBreakdown
    };
  }, [moduleStructure]);

  // Verificar si los permisos están cargados
  const isReady = useMemo(() => {
    return permissionsStructure !== null && moduleStructure !== null && !loading.permissions;
  }, [permissionsStructure, moduleStructure, loading.permissions]);

  // Obtener estadísticas de la estructura de permisos
  const getPermissionsStats = useMemo(() => {
    if (!permissionsStructure) return null;

    const stats = {
      totalApps: Object.keys(permissionsStructure.apps || {}).length,
      totalModels: Object.keys(permissionsStructure.byModel || {}).length,
      totalPermissions: (permissionsStructure.allPermissions || []).length,
      modules: {}
    };

    if (moduleStructure) {
      Object.entries(moduleStructure).forEach(([moduleKey, moduleData]) => {
        stats.modules[moduleKey] = {
          title: moduleData.title,
          submodules: moduleData.submodules?.length || 0,
          totalPermissions: moduleData.submodules?.reduce((total, sub) => 
            total + (sub.permissions?.length || 0), 0) || 0
        };
      });
    }

    return stats;
  }, [permissionsStructure, moduleStructure]);

  // Función específica para cargar estructura completa para gestión de perfiles
  const loadCompleteStructureForProfiles = useCallback(async () => {
    console.log('🎯 HOOK: Cargando estructura COMPLETA para gestión de perfiles...');
    await loadPermissionsStructure(true);
  }, [loadPermissionsStructure]);

  // Función para limpiar cache
  const clearCache = useCallback(() => {
    dynamicPermissionsService.clearCache();
    setPermissionsStructure(null);
    setModuleStructure(null);
  }, []);

  // Función para recargar datos
  const reload = useCallback(() => {
    clearCache();
    loadPermissionsStructure();
  }, [clearCache, loadPermissionsStructure]);

  return {
    // Estados principales
    permissionsStructure,
    moduleStructure,
    loading,
    error,
    isReady,

    // Funciones de carga
    loadPermissionsStructure,
    loadCompleteStructureForProfiles, // ⭐ NUEVA FUNCIÓN
    reload,
    clearCache,

    // Funciones de permisos
    getPermissionsForSubmodule,
    convertSelectionsToPermissionIds,
    convertPermissionIdsToSelections,

    // Funciones de perfiles
    createProfileWithPermissions,
    updateProfileWithPermissions,
    getProfileSummary,

    // Estadísticas y utilidades
    getPermissionsStats
  };
};

export default useDynamicPermissions;
