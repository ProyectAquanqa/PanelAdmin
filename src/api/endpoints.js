/**
 * Definición centralizada de endpoints de la API
 * Mantiene todas las URLs de endpoints organizadas
 */

/**
 * Endpoints de autenticación
 */
export const authEndpoints = {
  login: '/web/auth/login/',
  refresh: '/web/auth/refresh/',
  profile: '/web/auth/profile/',
  logout: '/web/auth/logout/',
};

/**
 * Endpoints de chatbot
 */
export const chatbotEndpoints = {
  // Nota: query y recommendedQuestions usan capa mobile por diseño
  query: '/mobile/chatbot/query/',
  conversations: '/web/chatbot-conversations/',
  knowledge: '/web/chatbot-knowledge/',
  categories: '/web/chatbot-categories/',
  stats: '/web/chatbot-knowledge/statistics/',
  recommendedQuestions: '/mobile/chatbot/recommended-questions/',
  regenerateEmbeddings: '/admin/maintenance/regenerate-embeddings/',
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
  list: '/web/eventos/',
  create: '/web/eventos/',
  detail: (id) => `/web/eventos/${id}/`,
  update: (id) => `/web/eventos/${id}/`,
  delete: (id) => `/web/eventos/${id}/`,
  categories: '/web/categorias/',
};

/**
 * Endpoints de comentarios
 */
export const commentEndpoints = {
  list: '/web/comentarios/',
  detail: (id) => `/web/comentarios/${id}/`,
  delete: (id) => `/web/comentarios/${id}/`,
  moderate: (id) => `/web/comentarios/${id}/moderar/`,
  statistics: '/admin/comentarios/statistics/',
};

/**
 * Endpoints de usuarios
 */
export const userEndpoints = {
  list: '/web/users/',
  create: '/web/users/',
  detail: (id) => `/web/users/${id}/`,
  update: (id) => `/web/users/${id}/`,
  delete: (id) => `/web/users/${id}/`,
  profile: '/web/auth/profile/',
};

/**
 * Endpoints de notificaciones
 */
export const notificationEndpoints = {
  list: '/web/notifications/',
  create: '/web/notifications/',
  detail: (id) => `/web/notifications/${id}/`,
  update: (id) => `/web/notifications/${id}/`,
  delete: (id) => `/web/notifications/${id}/`,
  sendBroadcast: '/web/notifications/send_broadcast/',
  sendBulk: '/web/notifications/send_bulk_notification/',
  statistics: '/web/notifications/statistics/',
  
  // Device tokens
  devices: '/web/device-tokens/',
  deviceDetail: (id) => `/web/device-tokens/${id}/`,
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
  comments: commentEndpoints,
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