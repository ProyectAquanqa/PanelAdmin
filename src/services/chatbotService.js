/**
 * Servicio para comunicación con la API del Chatbot
 * Basado en los endpoints de AquanQ/aquanq_noticias/api_urls.py
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Configuración base para fetch
const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem('access_token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${BASE_URL}${url}`, config);
    
    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch (parseError) {
        // Si no se puede parsear como JSON, crear un error básico
        error = { message: `HTTP ${response.status}` };
      }
      throw new Error(error.detail || error.message || `HTTP ${response.status}`);
    }
    
    // Verificar si la respuesta tiene contenido antes de parsear JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } else {
      // Si no es JSON, devolver respuesta vacía exitosa
      return { success: true };
    }
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

const chatbotService = {
  // 🤖 Consultar el chatbot
  query: async (question, sessionId = 'admin-panel') => {
    return await apiCall('/chatbot/query/', {
      method: 'POST',
      body: JSON.stringify({ 
        question,
        session_id: sessionId 
      }),
    });
  },

  // 📊 Obtener estadísticas del chatbot (usando el endpoint correcto)
  getStats: async () => {
    return await apiCall('/chatbot-knowledge/statistics/');
  },

  // 💬 Gestión de conversaciones
  conversations: {
    list: async (page = 1, limit = 10) => {
      return await apiCall(`/chatbot-conversations/?page=${page}&limit=${limit}`);
    },
    
    get: async (id) => {
      return await apiCall(`/chatbot-conversations/${id}/`);
    },
    
    delete: async (id) => {
      return await apiCall(`/chatbot-conversations/${id}/`, {
        method: 'DELETE',
      });
    },
  },

  // 🧠 Gestión de base de conocimientos
  knowledge: {
    list: async (page = 1, limit = 10, search = '') => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });
      return await apiCall(`/chatbot-knowledge/?${params}`);
    },
    
    get: async (id) => {
      return await apiCall(`/chatbot-knowledge/${id}/`);
    },
    
    create: async (data) => {
      return await apiCall('/chatbot-knowledge/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    
    update: async (id, data) => {
      return await apiCall(`/chatbot-knowledge/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    
    delete: async (id) => {
      return await apiCall(`/chatbot-knowledge/${id}/`, {
        method: 'DELETE',
      });
    },
    
    // Importar datos masivos
    bulkImport: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('access_token'); // Usar access_token
      
      const response = await fetch(`${BASE_URL}/chatbot-knowledge/bulk-import/`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });
      
      if (!response.ok) {
        let error;
        try {
          error = await response.json();
        } catch (parseError) {
          error = { message: 'Error en importación masiva' };
        }
        throw new Error(error.detail || error.message || 'Error en importación masiva');
      }
      
      return await response.json();
    },
  },

  // 📂 Gestión de categorías
  categories: {
    list: async () => {
      return await apiCall('/chatbot-categories/');
    },
    
    create: async (data) => {
      return await apiCall('/chatbot-categories/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    
    update: async (id, data) => {
      return await apiCall(`/chatbot-categories/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    
    delete: async (id) => {
      return await apiCall(`/chatbot-categories/${id}/`, {
        method: 'DELETE',
      });
    },
  },

  // 📋 Preguntas recomendadas
  getRecommendedQuestions: async () => {
    return await apiCall('/chatbot/recommended-questions/');
  },

  // 🔄 Regenerar embeddings (endpoint personalizado si existe)
  regenerateEmbeddings: async () => {
    return await apiCall('/chatbot/regenerate-embeddings/', {
      method: 'POST',
    });
  },
};

export default chatbotService; 