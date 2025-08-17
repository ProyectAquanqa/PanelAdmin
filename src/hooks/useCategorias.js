/**
 * Hook personalizado para gestión de categorías de eventos
 * Centraliza la lógica de estado y comunicación con la API de categorías
 */

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { 
  getCategorias, 
  createCategoria, 
  updateCategoria,
  deleteCategoria 
} from '../services/eventosService';

export const useCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Carga la lista de categorías
   * @param {Object} filters - Filtros de búsqueda
   */
  const loadCategorias = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getCategorias(filters);
      
      if (response.status === 'success') {
        setCategorias(response.data || []);
      } else {
        throw new Error(response.error?.message || 'Error al cargar categorías');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Error al cargar categorías');
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crea una nueva categoría
   * @param {Object} categoriaData - Datos de la categoría
   * @returns {Promise<Object|null>} Categoría creada o null si hay error
   */
  const crearCategoria = useCallback(async (categoriaData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createCategoria(categoriaData);
      
      if (response.status === 'success') {
        const nuevaCategoria = response.data;
        setCategorias(prev => [...prev, nuevaCategoria]);
        toast.success('Categoría creada exitosamente');
        return nuevaCategoria;
      } else {
        throw new Error(response.error?.message || 'Error al crear categoría');
      }
    } catch (err) {
      setError(err.message);
      
      if (err.status === 422 && err.data?.error?.details) {
        // Error de validación - no mostrar toast, se manejará en el formulario
        throw err;
      } else {
        toast.error(err.message || 'Error al crear categoría');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza una categoría existente
   * @param {number} id - ID de la categoría
   * @param {Object} categoriaData - Datos actualizados
   * @returns {Promise<Object|null>} Categoría actualizada o null si hay error
   */
  const actualizarCategoria = useCallback(async (id, categoriaData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateCategoria(id, categoriaData);
      
      if (response.status === 'success') {
        const categoriaActualizada = response.data;
        setCategorias(prev => 
          prev.map(categoria => 
            categoria.id === id ? categoriaActualizada : categoria
          )
        );
        toast.success('Categoría actualizada exitosamente');
        return categoriaActualizada;
      } else {
        throw new Error(response.error?.message || 'Error al actualizar categoría');
      }
    } catch (err) {
      setError(err.message);
      
      if (err.status === 422 && err.data?.error?.details) {
        // Error de validación - no mostrar toast, se manejará en el formulario
        throw err;
      } else {
        toast.error(err.message || 'Error al actualizar categoría');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Elimina una categoría
   * @param {number} id - ID de la categoría a eliminar
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  const eliminarCategoria = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await deleteCategoria(id);
      setCategorias(prev => prev.filter(categoria => categoria.id !== id));
      toast.success('Categoría eliminada exitosamente');
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Error al eliminar categoría');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categorias,
    loading,
    error,
    loadCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
  };
};