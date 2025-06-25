import apiClient from '../api/apiClient';
import { API_ROUTES } from '../config/api';

/**
 * Obtiene la lista de entradas de la base de conocimientos del chatbot
 * @param {Object} params - Parámetros para filtrar la lista
 * @returns {Promise} Promise con la respuesta
 */
export const getChatbotKnowledge = async (params = {}) => {
  try {
    console.log('🔍 Solicitando entradas del chatbot con parámetros:', params);
    const response = await apiClient.get(API_ROUTES.CHATBOT.KNOWLEDGE_BASE, { params });
    
    // Asegurarse de que siempre devolvemos un formato consistente
    const normalizedData = {
      results: response.data?.results || response.data || [],
      count: response.data?.count || (Array.isArray(response.data) ? response.data.length : 0),
      next: response.data?.next || null,
      previous: response.data?.previous || null
    };
    
    // Asegurarse de que results siempre sea un array
    if (!Array.isArray(normalizedData.results)) {
      normalizedData.results = [];
    }
    
    console.log('✅ Datos del chatbot obtenidos:', normalizedData);
    return normalizedData;
  } catch (error) {
    console.error('💥 Error al obtener entradas del chatbot:', error);
    throw error;
  }
};

/**
 * Obtiene una entrada específica de la base de conocimientos
 * @param {number} id - ID de la entrada
 * @returns {Promise} Promise con la respuesta
 */
export const getChatbotKnowledgeById = async (id) => {
  try {
    console.log(`🔍 Solicitando entrada del chatbot con ID: ${id}`);
    const response = await apiClient.get(`${API_ROUTES.CHATBOT.KNOWLEDGE_BASE}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`💥 Error al obtener entrada del chatbot con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva entrada en la base de conocimientos
 * @param {Object} data - Datos de la entrada
 * @returns {Promise} Promise con la respuesta
 */
export const createChatbotKnowledge = async (data) => {
  try {
    console.log('📝 Creando entrada del chatbot:', data);
    const response = await apiClient.post(API_ROUTES.CHATBOT.KNOWLEDGE_BASE, data);
    return response.data;
  } catch (error) {
    console.error('💥 Error al crear entrada del chatbot:', error);
    throw error;
  }
};

/**
 * Actualiza una entrada existente
 * @param {number} id - ID de la entrada
 * @param {Object} data - Datos actualizados
 * @returns {Promise} Promise con la respuesta
 */
export const updateChatbotKnowledge = async (id, data) => {
  try {
    console.log(`🔄 Actualizando entrada del chatbot ${id}:`, data);
    const response = await apiClient.put(`${API_ROUTES.CHATBOT.KNOWLEDGE_BASE}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`💥 Error al actualizar entrada del chatbot ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una entrada
 * @param {number} id - ID de la entrada
 * @returns {Promise} Promise con la respuesta
 */
export const deleteChatbotKnowledge = async (id) => {
  try {
    console.log(`🗑️ Eliminando entrada del chatbot con ID: ${id}`);
    const response = await apiClient.delete(`${API_ROUTES.CHATBOT.KNOWLEDGE_BASE}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`💥 Error al eliminar entrada del chatbot ${id}:`, error);
    throw error;
  }
}; 