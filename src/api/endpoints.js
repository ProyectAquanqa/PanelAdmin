/**
 * Definición centralizada de endpoints de la API
 * Mantiene todas las URLs de endpoints organizadas
 */

/**
 * Endpoints de autenticación
 */
export const authEndpoints = {
  login: '/token/',
  refresh: '/token/refresh/',
  profile: '/profile/',
  logout: '/logout/',
};

/**
 * Endpoints de chatbot
 */
export const chatbotEndpoints = {
  query: '/chatbot/query/',
  conversations: '/chatbot/conversations/',
  knowledge: '/chatbot/knowledge/',
  categories: '/chatbot/categories/',
  stats: '/chatbot/stats/',
  recommendedQuestions: '/chatbot/recommended-questions/',
  regenerateEmbeddings: '/chatbot/regenerate-embeddings/',
};

/**
 * Endpoints externos
 */
export const externalEndpoints = {
  dniConsultation: '/consulta-dni/',
};

/**
 * Endpoints de eventos
 */
export const eventEndpoints = {
  list: '/eventos/',
  create: '/eventos/',
  detail: (id) => `/eventos/${id}/`,
  update: (id) => `/eventos/${id}/`,
  delete: (id) => `/eventos/${id}/`,
  categories: '/categorias/',
};

/**
 * Endpoints de usuarios
 */
export const userEndpoints = {
  list: '/users/',
  create: '/users/',
  detail: (id) => `/users/${id}/`,
  update: (id) => `/users/${id}/`,
  delete: (id) => `/users/${id}/`,
  profile: '/users/profile/',
};

/**
 * Endpoints de notificaciones
 */
export const notificationEndpoints = {
  list: '/notifications/',
  create: '/notifications/',
  markAsRead: (id) => `/notifications/${id}/read/`,
  markAllAsRead: '/notifications/mark-all-read/',
  delete: (id) => `/notifications/${id}/`,
};

/**
 * Endpoints de configuración
 */
export const configEndpoints = {
  general: '/config/general/',
  api: '/config/api/',
  theme: '/config/theme/',
};

/**
 * Todos los endpoints organizados
 */
export const endpoints = {
  auth: authEndpoints,
  chatbot: chatbotEndpoints,
  events: eventEndpoints,
  users: userEndpoints,
  notifications: notificationEndpoints,
  config: configEndpoints,
};

/**
 * Función helper para construir URLs con parámetros
 * @param {string} endpoint - Endpoint base
 * @param {Object} params - Parámetros para la URL
 * @returns {string} URL construida
 */
export const buildUrl = (endpoint, params = {}) => {
  let url = endpoint;
  
  // Reemplazar parámetros en la URL
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, value);
  });
  
  return url;
};

/**
 * Función helper para construir query strings
 * @param {Object} params - Parámetros de query
 * @returns {string} Query string
 */
export const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export default endpoints;