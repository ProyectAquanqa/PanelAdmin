/**
 * Hook personalizado para gestión de comentarios
 * Centraliza la lógica de estado y comunicación con la API de comentarios
 * Basado en useEventos
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { 
  getComentarios, 
  getComentario, 
  deleteComentario,
  moderateComentario,
  getComentariosStatistics
} from '../services/comentariosService';

export const useComentarios = () => {
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  /**
   * Carga la lista de comentarios con filtros
   * @param {Object} filters - Filtros y parámetros de paginación
   */
  const loadComentarios = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getComentarios(filters);
      
      if (response.status === 'success') {
        setComentarios(response.data || []);
        setPagination(response.pagination || {});
      } else {
        throw new Error(response.error?.message || 'Error al cargar comentarios');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Error al cargar comentarios');
      setComentarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Elimina un comentario
   * @param {number} id - ID del comentario a eliminar
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  const eliminarComentario = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await deleteComentario(id);
      setComentarios(prev => prev.filter(comentario => comentario.id !== id));
      toast.success('Comentario eliminado exitosamente');
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Error al eliminar comentario');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Modera un comentario (activar/desactivar)
   * @param {number} id - ID del comentario
   * @param {boolean} isActive - Nuevo estado del comentario
   * @returns {Promise<boolean>} True si se moderó correctamente
   */
  const moderarComentario = useCallback(async (id, isActive) => {
    try {
      setLoading(true);
      setError(null);

      const response = await moderateComentario(id, isActive);
      
      if (response.status === 'success') {
        // Actualizar el comentario en el estado local
        setComentarios(prev => 
          prev.map(comentario => 
            comentario.id === id 
              ? { ...comentario, is_active: isActive } 
              : comentario
          )
        );
        
        const accion = isActive ? 'activado' : 'desactivado';
        toast.success(`Comentario ${accion} exitosamente`);
        return true;
      } else {
        throw new Error(response.error?.message || 'Error al moderar comentario');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Error al moderar comentario');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene estadísticas de comentarios
   * @returns {Promise<Object|null>} Estadísticas o null si hay error
   */
  const obtenerEstadisticas = useCallback(async () => {
    try {
      const response = await getComentariosStatistics();
      
      if (response.status === 'success') {
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Error al obtener estadísticas');
      }
    } catch (err) {
      toast.error(err.message || 'Error al obtener estadísticas');
      return null;
    }
  }, []);

  return {
    comentarios,
    loading,
    error,
    pagination,
    loadComentarios,
    fetchComentarios: loadComentarios, // Alias para consistencia con otros hooks
    eliminarComentario,
    moderarComentario,
    obtenerEstadisticas,
  };
};

/**
 * Hook para gestión de un comentario individual
 * @param {number} comentarioId - ID del comentario
 */
export const useComentario = (comentarioId) => {
  const [comentario, setComentario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadComentario = useCallback(async () => {
    if (!comentarioId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getComentario(comentarioId);
      
      if (response.status === 'success') {
        setComentario(response.data);
      } else {
        throw new Error(response.error?.message || 'Error al cargar comentario');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Error al cargar comentario');
    } finally {
      setLoading(false);
    }
  }, [comentarioId]);

  useEffect(() => {
    loadComentario();
  }, [loadComentario]);

  return {
    comentario,
    loading,
    error,
    loadComentario,
  };
};
