import { useState, useEffect, useCallback } from 'react';
import chatbotService from '../services/chatbotService';
import toast from 'react-hot-toast';

/**
 * Hook personalizado para manejar toda la lógica del chatbot
 * Sigue las directrices de separar lógica de UI
 */
export const useChatbot = () => {
  // Estados principales
  const [conversations, setConversations] = useState([]);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [recommendedQuestions, setRecommendedQuestions] = useState([]);
  
  // Estados de carga
  const [loading, setLoading] = useState({
    conversations: false,
    knowledge: false,
    categories: false,
    stats: false,
    query: false,
    recommended: false,
  });
  
  // Estados de paginación
  const [pagination, setPagination] = useState({
    conversations: { current: 1, total: 0, limit: 10 },
    knowledge: { current: 1, total: 0, limit: 10 },
  });

  // Funciones para obtener datos
  const fetchConversations = useCallback(async (page = 1) => {
    setLoading(prev => ({ ...prev, conversations: true }));
    try {
      const response = await chatbotService.conversations.list(page, pagination.conversations.limit);
      if (response && response.status === 'success') {
        const list = Array.isArray(response.data)
          ? response.data
          : (response.data?.results || []);
        setConversations(list);
        setPagination(prev => ({
          ...prev,
          conversations: {
            ...prev.conversations,
            current: page,
            total: response.pagination?.count || list.length || 0,
          }
        }));
      } else {
        const list = response?.results || response || [];
        setConversations(Array.isArray(list) ? list : []);
        setPagination(prev => ({
          ...prev,
          conversations: {
            ...prev.conversations,
            current: page,
            total: response?.count || (Array.isArray(list) ? list.length : 0),
          }
        }));
      }
    } catch (error) {
      toast.error(`Error al cargar conversaciones: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, conversations: false }));
    }
  }, [pagination.conversations.limit]);

  const fetchKnowledgeBase = useCallback(async (page = 1, search = '') => {
    setLoading(prev => ({ ...prev, knowledge: true }));
    try {
      const response = await chatbotService.knowledge.list(page, pagination.knowledge.limit, search);
      
      // Manejar formato de respuesta según directrices: {status: "success", data: {...}}
      if (response.status === 'success') {
        const data = response.data;
        setKnowledgeBase(data.results || data);
      setPagination(prev => ({
        ...prev,
        knowledge: {
          ...prev.knowledge,
          current: page,
            total: data.count || data.length || 0,
        }
      }));
      } else {
        throw new Error(response.error?.message || 'Error desconocido');
      }
    } catch (error) {
      toast.error(`Error al cargar base de conocimientos: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, knowledge: false }));
    }
  }, [pagination.knowledge.limit]);

  // Funciones para gestionar categorías
  const fetchCategories = useCallback(async () => {
    setLoading(prev => ({ ...prev, categories: true }));
    try {
      const response = await chatbotService.categories.list();
      
      // Manejar formato de respuesta según directrices: {status: "success", data: {...}}
      if (response.status === 'success') {
        const data = response.data;
        setCategories(data.results || data);
      } else {
        throw new Error(response.error?.message || 'Error desconocido');
      }
    } catch (error) {
      toast.error(`Error al cargar categorías: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  }, []);

  const createCategory = useCallback(async (categoryData) => {
    try {
      const response = await chatbotService.categories.create(categoryData);
      
      if (response.status === 'success') {
        toast.success('Categoría creada exitosamente');
        await fetchCategories();
        return true;
      } else {
        throw new Error(response.error?.message || 'Error desconocido');
      }
    } catch (error) {
      toast.error(`Error al crear categoría: ${error.message}`);
      return false;
    }
  }, [fetchCategories]);

  const updateCategory = useCallback(async (id, categoryData) => {
    try {
      await chatbotService.categories.update(id, categoryData);
      toast.success('Categoría actualizada exitosamente');
      await fetchCategories();
      return true;
    } catch (error) {
      toast.error(`Error al actualizar categoría: ${error.message}`);
      return false;
    }
  }, [fetchCategories]);

  const deleteCategory = useCallback(async (id) => {
    try {
      await chatbotService.categories.delete(id);
      toast.success('Categoría eliminada exitosamente');
      await fetchCategories();
      return true;
    } catch (error) {
      toast.error(`Error al eliminar categoría: ${error.message}`);
      return false;
    }
  }, [fetchCategories]);

  const fetchStats = useCallback(async () => {
    setLoading(prev => ({ ...prev, stats: true }));
    try {
      const response = await chatbotService.getStats();
      // Las estadísticas sí mantienen estructura {status: "success", data: {...}}
      setStats(response.data || response);
    } catch (error) {
      toast.error(`Error al cargar estadísticas: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, []);

  const fetchRecommendedQuestions = useCallback(async () => {
    setLoading(prev => ({ ...prev, recommended: true }));
    try {
      const response = await chatbotService.getRecommendedQuestions();
      setRecommendedQuestions(response.data?.recommended_questions || response);
    } catch (error) {
      toast.error(`Error al cargar preguntas recomendadas: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, recommended: false }));
    }
  }, []);

  /** Función para consultar el chatbot */
  const queryBot = useCallback(async (question, sessionId = 'admin-test') => {
    setLoading(prev => ({ ...prev, query: true }));
    try {
      const response = await chatbotService.query(question, sessionId);
      return response.data || response;
    } catch (error) {
      toast.error(`Error al consultar chatbot: ${error.message}`);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, query: false }));
    }
  }, []);

  // Funciones CRUD para base de conocimientos
  const createKnowledge = useCallback(async (data) => {
    try {
      const response = await chatbotService.knowledge.create(data);
      toast.success('Conocimiento creado exitosamente');
      
      // Optimización UX: Agregar elemento localmente sin recargar toda la lista
      if (response.status === 'success' && response.data) {
        setKnowledgeBase(prev => [response.data, ...prev]);
        setPagination(prev => ({
          ...prev,
          knowledge: {
            ...prev.knowledge,
            total: prev.knowledge.total + 1
          }
        }));
      } else {
        // Fallback: recargar si no tenemos los datos
        await fetchKnowledgeBase(pagination.knowledge.current);
      }
      
      return true;
    } catch (error) {
      // Manejo específico de errores comunes
      let errorMessage = 'Error al crear conocimiento';
      
      if (error.message.includes('HTTP 400') || error.message.includes('duplicate') || error.message.includes('already exists')) {
        errorMessage = 'Esta pregunta ya existe en la base de conocimientos';
      } else if (error.message.includes('HTTP 500')) {
        errorMessage = 'Error del servidor. La pregunta podría ya existir o hay un problema técnico';
      } else if (error.message.includes('HTTP 413')) {
        errorMessage = 'El contenido es demasiado largo';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Error de conexión. Revisa tu internet';
      }
      
      toast.error(errorMessage);
      return false;
    }
  }, [fetchKnowledgeBase, pagination.knowledge.current]);

  const updateKnowledge = useCallback(async (id, data) => {
    try {
      const response = await chatbotService.knowledge.update(id, data);
      toast.success('Conocimiento actualizado exitosamente');
      
      // Optimización UX: Actualizar elemento localmente sin recargar toda la lista
      if (response.status === 'success' && response.data) {
        setKnowledgeBase(prev => 
          prev.map(item => item.id === id ? response.data : item)
        );
      } else {
        // Fallback: recargar si no tenemos los datos
        await fetchKnowledgeBase(pagination.knowledge.current);
      }
      
      return true;
    } catch (error) {
      // Manejo específico de errores comunes
      let errorMessage = 'Error al actualizar conocimiento';
      
      if (error.message.includes('HTTP 400') || error.message.includes('duplicate') || error.message.includes('already exists')) {
        errorMessage = 'Esta pregunta ya existe en la base de conocimientos';
      } else if (error.message.includes('HTTP 404')) {
        errorMessage = 'El conocimiento no existe o fue eliminado';
      } else if (error.message.includes('HTTP 500')) {
        errorMessage = 'Error del servidor. Revisa los datos o intenta más tarde';
      } else if (error.message.includes('HTTP 413')) {
        errorMessage = 'El contenido es demasiado largo';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Error de conexión. Revisa tu internet';
      }
      
      toast.error(errorMessage);
      return false;
    }
  }, [fetchKnowledgeBase, pagination.knowledge.current]);

  const deleteKnowledge = useCallback(async (id) => {
    try {
      await chatbotService.knowledge.delete(id);
      toast.success('Conocimiento eliminado exitosamente');
      
      // Optimización UX: Eliminar elemento localmente sin recargar toda la lista
      setKnowledgeBase(prev => prev.filter(item => item.id !== id));
      setPagination(prev => ({
        ...prev,
        knowledge: {
          ...prev.knowledge,
          total: Math.max(0, prev.knowledge.total - 1)
        }
      }));
      
      return true;
    } catch (error) {
      toast.error(`Error al eliminar conocimiento: ${error.message}`);
      return false;
    }
  }, []);

  /** Importación masiva */
  const bulkImportKnowledge = useCallback(async (file) => {
    try {
      const response = await chatbotService.knowledge.bulkImport(file);
      toast.success(`Importación exitosa: ${response.imported || 'varios'} elementos`);
      await fetchKnowledgeBase(1); // Volver a la primera página
      return true;
    } catch (error) {
      toast.error(`Error en importación masiva: ${error.message}`);
      return false;
    }
  }, [fetchKnowledgeBase]);

  /** Eliminar conversación */
  const deleteConversation = useCallback(async (id) => {
    try {
      await chatbotService.conversations.delete(id);
      toast.success('Conversación eliminada exitosamente');
      await fetchConversations(pagination.conversations.current);
      return true;
    } catch (error) {
      toast.error(`Error al eliminar conversación: ${error.message}`);
      return false;
    }
  }, [fetchConversations, pagination.conversations.current]);

  // Regenerar embeddings
  const regenerateEmbeddings = useCallback(async () => {
    try {
      const response = await chatbotService.regenerateEmbeddings();
      toast.success('Embeddings regenerados exitosamente');
      
      // Refrescar la lista de conocimientos para mostrar los embeddings actualizados
      await fetchKnowledgeBase(pagination.knowledge.current);
      
      return response;
    } catch (error) {
      toast.error(`Error al regenerar embeddings: ${error.message}`);
      return false;
    }
  }, [fetchKnowledgeBase, pagination.knowledge.current]);

  // Función para marcar respuesta como relevante/fallida
  const markResponse = useCallback(async (questionId, isRelevant) => {
    try {
      // Esta función se puede implementar cuando esté disponible en el backend
      const action = isRelevant ? 'relevante' : 'fallida';
      toast.success(`Respuesta marcada como ${action}`);
      return true;
    } catch (error) {
      toast.error(`Error al marcar respuesta: ${error.message}`);
      return false;
    }
  }, []);

  // Inicialización
  useEffect(() => {
    fetchStats();
    fetchRecommendedQuestions();
  }, [fetchStats, fetchRecommendedQuestions]);

  return {
    // Estados
    conversations,
    knowledgeBase,
    categories,
    stats,
    recommendedQuestions,
    loading,
    pagination,
    
    // Funciones de datos
    fetchConversations,
    fetchKnowledgeBase,
    fetchCategories,
    fetchStats,
    fetchRecommendedQuestions,
    
    // Funciones del chatbot
    queryBot,
    
    // Funciones CRUD
    createKnowledge,
    updateKnowledge,
    deleteKnowledge,
    createCategory,
    updateCategory,
    deleteCategory,
    bulkImportKnowledge,
    deleteConversation,
    
    // Funciones especiales
    regenerateEmbeddings,
    markResponse,
  };
};

export default useChatbot; 