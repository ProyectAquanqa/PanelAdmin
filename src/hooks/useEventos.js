/**
 * Hook personalizado para gestión de eventos
 * Centraliza la lógica de estado y comunicación con la API de eventos
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { 
  getEventos, 
  getEvento, 
  createEvento, 
  updateEvento,
  patchEvento,
  deleteEvento 
} from '../services/eventosService';

export const useEventos = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  /**
   * Carga la lista de eventos con filtros
   * @param {Object} filters - Filtros y parámetros de paginación
   */
  const loadEventos = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getEventos(filters);
      
      if (response.status === 'success') {
        setEventos(response.data || []);
        setPagination(response.pagination || {});
      } else {
        throw new Error(response.error?.message || 'Error al cargar eventos');
      }
    } catch (err) {
      console.error('Error loading eventos:', err);
      setError(err.message);
      toast.error(err.message || 'Error al cargar eventos');
      setEventos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crea un nuevo evento
   * @param {Object|FormData} eventoData - Datos del evento
   * @returns {Promise<Object|null>} Evento creado o null si hay error
   */
  const crearEvento = useCallback(async (eventoData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createEvento(eventoData);
      
      if (response.status === 'success') {
        const nuevoEvento = response.data;
        setEventos(prev => [nuevoEvento, ...prev]);
        toast.success('Evento creado exitosamente');
        return nuevoEvento;
      } else {
        throw new Error(response.error?.message || 'Error al crear evento');
      }
    } catch (err) {
      console.error('Error creating evento:', err);
      setError(err.message);
      
      if (err.status === 422 && err.data?.error?.details) {
        // Error de validación - no mostrar toast, se manejará en el formulario
        throw err;
      } else {
        toast.error(err.message || 'Error al crear evento');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza un evento existente
   * @param {number} id - ID del evento
   * @param {Object|FormData} eventoData - Datos actualizados
   * @returns {Promise<Object|null>} Evento actualizado o null si hay error
   */
  const actualizarEvento = useCallback(async (id, eventoData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateEvento(id, eventoData);
      
      if (response.status === 'success') {
        const eventoActualizado = response.data;
        setEventos(prev => 
          prev.map(evento => 
            evento.id === id ? eventoActualizado : evento
          )
        );
        toast.success('Evento actualizado exitosamente');
        return eventoActualizado;
      } else {
        throw new Error(response.error?.message || 'Error al actualizar evento');
      }
    } catch (err) {
      console.error('Error updating evento:', err);
      setError(err.message);
      
      if (err.status === 422 && err.data?.error?.details) {
        // Error de validación - no mostrar toast, se manejará en el formulario
        throw err;
      } else {
        toast.error(err.message || 'Error al actualizar evento');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza parcialmente un evento
   * @param {number} id - ID del evento
   * @param {Object} eventoData - Datos parciales
   * @returns {Promise<Object|null>} Evento actualizado o null si hay error
   */
  const actualizarEventoParcial = useCallback(async (id, eventoData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await patchEvento(id, eventoData);
      
      if (response.status === 'success') {
        const eventoActualizado = response.data;
        setEventos(prev => 
          prev.map(evento => 
            evento.id === id ? eventoActualizado : evento
          )
        );
        return eventoActualizado;
      } else {
        throw new Error(response.error?.message || 'Error al actualizar evento');
      }
    } catch (err) {
      console.error('Error patching evento:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Elimina un evento
   * @param {number} id - ID del evento a eliminar
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  const eliminarEvento = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await deleteEvento(id);
      setEventos(prev => prev.filter(evento => evento.id !== id));
      toast.success('Evento eliminado exitosamente');
      return true;
    } catch (err) {
      console.error('Error deleting evento:', err);
      setError(err.message);
      toast.error(err.message || 'Error al eliminar evento');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Alterna el estado de publicación de un evento
   * @param {number} id - ID del evento
   * @param {boolean} publicado - Nuevo estado de publicación
   * @returns {Promise<boolean>} True si se actualizó correctamente
   */
  const alternarPublicacion = useCallback(async (id, publicado) => {
    try {
      const eventoActualizado = await actualizarEventoParcial(id, { publicado });
      if (eventoActualizado) {
        toast.success(`Evento ${publicado ? 'publicado' : 'despublicado'} exitosamente`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error(`Error al ${publicado ? 'publicar' : 'despublicar'} evento`);
      return false;
    }
  }, [actualizarEventoParcial]);



  return {
    eventos,
    loading,
    error,
    pagination,
    loadEventos,
    fetchEventos: loadEventos, // Alias for consistency with other hooks
    crearEvento,
    actualizarEvento,
    actualizarEventoParcial,
    eliminarEvento,
    alternarPublicacion,
  };
};

/**
 * Hook para gestión de un evento individual
 * @param {number} eventoId - ID del evento
 */
export const useEvento = (eventoId) => {
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadEvento = useCallback(async () => {
    if (!eventoId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getEvento(eventoId);
      
      if (response.status === 'success') {
        setEvento(response.data);
      } else {
        throw new Error(response.error?.message || 'Error al cargar evento');
      }
    } catch (err) {
      console.error('Error loading evento:', err);
      setError(err.message);
      toast.error(err.message || 'Error al cargar evento');
    } finally {
      setLoading(false);
    }
  }, [eventoId]);

  useEffect(() => {
    loadEvento();
  }, [loadEvento]);

  return {
    evento,
    loading,
    error,
    loadEvento,
  };
};