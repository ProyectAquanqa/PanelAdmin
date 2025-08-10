/**
 * Hook personalizado para la gestión de grupos (perfiles)
 * Maneja el estado y las operaciones CRUD de grupos
 */

import { useState, useCallback } from 'react';
import groupService from '../services/groupService';

export const useGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Obtener todos los grupos con paginación y filtros
   * @param {number} page - Página actual
   * @param {number} limit - Elementos por página
   * @param {Object} filters - Filtros opcionales
   */
  const fetchGroups = useCallback(async (page = 1, limit = 10, filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await groupService.list(page, limit, filters);
      setGroups(result.results || result || []);
      return result;
    } catch (err) {
      console.error('Error al cargar grupos:', err);
      setError('Error al cargar grupos: ' + err.message);
      setGroups([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear un nuevo grupo
   * @param {Object} groupData - Datos del grupo
   */
  const createGroup = useCallback(async (groupData) => {
    setLoading(true);
    setError(null);

    try {
      const newGroup = await groupService.create(groupData);
      setGroups(prev => [...prev, newGroup]);
      return newGroup;
    } catch (err) {
      console.error('Error al crear grupo:', err);
      const errorMsg = 'Error al crear grupo: ' + err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar un grupo existente
   * @param {number} groupId - ID del grupo
   * @param {Object} groupData - Datos a actualizar
   */
  const updateGroup = useCallback(async (groupId, groupData) => {
    setLoading(true);
    setError(null);

    try {
      const updatedGroup = await groupService.update(groupId, groupData);
      setGroups(prev => 
        prev.map(group => 
          group.id === groupId ? updatedGroup : group
        )
      );
      return updatedGroup;
    } catch (err) {
      console.error('Error al actualizar grupo:', err);
      const errorMsg = 'Error al actualizar grupo: ' + err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar un grupo
   * @param {number} groupId - ID del grupo
   */
  const deleteGroup = useCallback(async (groupId) => {
    setLoading(true);
    setError(null);

    try {
      await groupService.delete(groupId);
      setGroups(prev => prev.filter(group => group.id !== groupId));
    } catch (err) {
      console.error('Error al eliminar grupo:', err);
      const errorMsg = 'Error al eliminar grupo: ' + err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener un grupo específico por ID
   * @param {number} groupId - ID del grupo
   */
  const getGroupById = useCallback(async (groupId) => {
    setLoading(true);
    setError(null);

    try {
      const group = await groupService.get(groupId);
      return group;
    } catch (err) {
      console.error('Error al obtener grupo:', err);
      const errorMsg = 'Error al obtener grupo: ' + err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Alternar estado activo/inactivo de un grupo
   * @param {number} groupId - ID del grupo
   */
  const toggleGroupActive = useCallback(async (groupId) => {
    setLoading(true);
    setError(null);

    try {
      const updatedGroup = await groupService.toggleActiveStatus(groupId);
      setGroups(prev => 
        prev.map(group => 
          group.id === groupId ? updatedGroup : group
        )
      );
      return updatedGroup;
    } catch (err) {
      console.error('Error al cambiar estado del grupo:', err);
      const errorMsg = 'Error al cambiar estado del grupo: ' + err.message;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener grupos disponibles filtrados por tipo
   * @param {string} tipoUsuario - 'ADMIN' o 'TRABAJADOR'
   */
  const fetchGroupsDisponibles = useCallback(async (tipoUsuario = null) => {
    setLoading(true);
    setError(null);

    try {
      const result = await groupService.getGroupsDisponibles(tipoUsuario);
      return result.results || result || [];
    } catch (err) {
      console.error('Error al cargar grupos disponibles:', err);
      setError('Error al cargar grupos disponibles: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener opciones de permisos
   */
  const fetchPermisosOptions = useCallback(async () => {
    try {
      return await groupService.getPermisosOptions();
    } catch (err) {
      console.error('Error al cargar opciones de permisos:', err);
      setError('Error al cargar opciones de permisos: ' + err.message);
      throw err;
    }
  }, []);

  /**
   * Obtener opciones de tipos de acceso
   */
  const fetchTipoAccesoOptions = useCallback(async () => {
    try {
      return await groupService.getTipoAccesoOptions();
    } catch (err) {
      console.error('Error al cargar opciones de tipos de acceso:', err);
      setError('Error al cargar opciones de tipos de acceso: ' + err.message);
      throw err;
    }
  }, []);

  return {
    // Estado
    groups,
    loading,
    error,

    // Acciones CRUD
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    getGroupById,
    toggleGroupActive,

    // Utilidades
    fetchGroupsDisponibles,
    fetchPermisosOptions,
    fetchTipoAccesoOptions,
    clearError: () => setError(null)
  };
};