/**
 * Configuración de rutas de la API
 * ✅ CORREGIDO: Rutas específicas para la API de Django (Admin)
 */

export const API_ROUTES = {
  // Autenticación - Coincide con las URLs definidas en Django
  AUTH: {
    LOGIN: `/api/auth/login/`,
    LOGOUT: `/api/auth/logout/`,
    REFRESH: `/api/auth/refresh-token/`,
    PROFILE: `/api/auth/profile/`,
  },
  
  // Doctores
  DOCTORS: {
    BASE: `/api/doctors/doctors/`,
    BY_ID: (id) => `/api/doctors/doctors/${id}/`,
    BY_TYPE: (type) => `/api/doctors/doctors/by_type/?doctor_type=${type}`,
    CAN_REFER: `/api/doctors/doctors/can_refer_doctors/`,
    AVAILABILITY: `/api/doctors/availability/`,
    SPECIALTIES: `/api/doctors/specialties/`,
  },
  
  // Usuarios
  USERS: `/api/users/users/`,
  
  // Pacientes
  PATIENTS: {
    BASE: `/api/users/patients/`,
    BY_ID: (id) => `/api/users/patients/${id}/`,
    SEARCH: (query) => `/api/users/patients/search/?q=${query}`,
  },
  
  // Especialidades
  SPECIALTIES: `/api/catalogs/specialties/`,
  
  // Catálogos
  CATALOGS: {
    DOCUMENT_TYPES: `/api/catalogs/document-types/`,
    SPECIALTIES: `/api/catalogs/specialties/`,
    PAYMENT_METHODS: `/api/catalogs/payment-methods/`,
  },
  
  // Citas
  APPOINTMENTS: `/api/appointments/appointments/`,
  
  // Endpoints específicos para citas
  APPOINTMENT_ENDPOINTS: {
    DOCTORS_BY_SPECIALTY: `/api/appointments/doctors-by-specialty/`,
    AVAILABLE_TIME_BLOCKS: `/api/appointments/available-time-blocks/`,
    TODAY: `/api/appointments/today/`,
    UPCOMING: `/api/appointments/upcoming/`,
    STATS: `/api/appointments/stats/`,
    CANCEL: (id) => `/api/appointments/appointments/${id}/cancel/`,
    COMPLETE: (id) => `/api/appointments/appointments/${id}/mark-completed/`,
    NO_SHOW: (id) => `/api/appointments/appointments/${id}/mark-no-show/`,
  },
  
  // Dashboard
  DASHBOARD: `/api/v1/dashboard/`,

  // Chatbot
  CHATBOT: {
    KNOWLEDGE_BASE: `/api/chatbot/api/knowledge-base/`,
    CHAT: `/api/chatbot/api/chat/`,
    FEEDBACK: (id) => `/api/chatbot/api/feedback/${id}/`,
    ANALYTICS: `/api/chatbot/api/analytics/`,
    HISTORY: `/api/chatbot/api/history/`,
    SEARCH: `/api/chatbot/api/knowledge/search/`,
    CATEGORIES: `/api/chatbot/api/knowledge/categories/`,
    ACTIVE: `/api/chatbot/api/knowledge/active/`,
  },
};
