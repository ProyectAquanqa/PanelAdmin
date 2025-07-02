/**
 * Configuración de rutas de la API
 */

export const API_BASE_URL_ADMIN = 'http://localhost:8000';
export const API_BASE_URL_MAIN = 'http://localhost:8080';

export const API_ROUTES = {
  // Autenticación
  AUTH: {
    LOGIN: '/api/auth/login/',
    LOGOUT: '/api/auth/logout/',
    REFRESH: '/api/auth/refresh-token/',
    PROFILE: '/api/auth/profile/',
  },
  
  // Usuarios
  USERS: {
    LIST: '/api/users/users/',
    CREATE: '/api/users/users/',
    BY_ID: (id) => `/api/users/users/${id}/`,
    STATS: '/api/users/users/stats/',
    TOGGLE_ACTIVE: (id) => `/api/users/users/${id}/toggle_active/`,
  },
  
  // Doctores
  DOCTORS: {
    LIST: '/api/doctors/doctors/',
    CREATE: '/api/doctors/doctors/',
    BY_ID: (id) => `/api/doctors/doctors/${id}/`,
    BY_SPECIALTY: '/api/doctors/doctors/by_specialty/',
    BY_CMP: '/api/doctors/doctors/by_cmp/',
    BY_TYPE: '/api/doctors/doctors/by_type/',
    CAN_REFER: '/api/doctors/doctors/can_refer_doctors/',
    AVAILABILITY: '/api/doctors/availability/',
    AVAILABILITY_BY_ID: (id) => `/api/doctors/availability/${id}/`,
    AVAILABILITY_BY_DAY: '/api/doctors/availability/by_day/',
    AVAILABILITY_BY_DOCTOR: '/api/doctors/availability/by_doctor/',
    SPECIALTIES: {
      LIST: '/api/doctors/specialties/',
      BY_ID: (id) => `/api/doctors/specialties/${id}/`,
      BY_DOCTOR: '/api/doctors/specialties/by_doctor/'
    },
    STATS: '/api/doctors/doctors/stats/',
    SPECIALTIES_BY_DOCTOR: (id) => `/api/doctors/doctors/${id}/specialties/`,
  },
  
  // Pacientes
  PATIENTS: {
    LIST: '/api/users/patients/',
    CREATE: '/api/users/patients/',
    BY_ID: (id) => `/api/users/patients/${id}/`,
    SEARCH: '/api/users/patients/search/',
    BY_DOCUMENT: '/api/users/patients/by_document/',
    STATS: '/api/users/patients/stats/',
  },
  
  // Especialidades
  SPECIALTIES: {
    LIST: '/api/catalogs/specialties/',
    CREATE: '/api/catalogs/specialties/',
    BY_ID: (id) => `/api/catalogs/specialties/${id}/`,
  },
  
  // Citas
  APPOINTMENTS: {
    LIST: '/api/appointments/',
    CREATE: '/api/appointments/',
    BY_ID: (id) => `/api/appointments/${id}/`,
    CANCEL: (id) => `/api/appointments/${id}/cancel/`,
    RESCHEDULE: (id) => `/api/appointments/${id}/reschedule/`,
    AVAILABLE_SLOTS: '/api/appointments/available-slots/',
    AVAILABLE_TIME_BLOCKS: '/api/appointments/available-time-blocks/',
    DOCTORS_BY_SPECIALTY: '/api/appointments/doctors-by-specialty/',
    TODAY: '/api/appointments/today/',
    UPCOMING: '/api/appointments/upcoming/',
    STATS: '/api/appointments/stats/',
    PENDING_VALIDATION: '/api/appointments/pending_validation/',
    BY_PATIENT: (patientId) => `/api/appointments/patient/${patientId}/`,
  },
  
  // Dashboard
  DASHBOARD: {
    LIST: '/api/dashboard/',
    STATS: '/api/dashboard/stats/',
    RECENT_ACTIVITY: '/api/dashboard/recent-activity/',
    CHART_DATA: (type) => `/api/dashboard/chart-data/${type}/`
  },

  // Chatbot
  CHATBOT: {
    KNOWLEDGE_BASE: '/api/chatbot/api/knowledge-base/',
    CHAT: '/api/chatbot/api/chat/',
    FEEDBACK: (id) => `/api/chatbot/api/feedback/${id}/`,
    ANALYTICS: '/api/chatbot/api/analytics/',
    HISTORY: '/api/chatbot/api/history/',
    SEARCH: '/api/chatbot/api/knowledge/search/',
    CATEGORIES: '/api/chatbot/api/knowledge/categories/',
    ACTIVE: '/api/chatbot/api/knowledge/active/'
  },
  
  // Pagos
  PAYMENTS: {
    LIST: '/api/payments/',
    CREATE: '/api/payments/',
    BY_ID: (id) => `/api/payments/${id}/`,
    COMPLETED: '/api/payments/completed/',
    PROCESSING: '/api/payments/processing/',
    WEBHOOKS: {
      MERCADOPAGO: '/api/payments/webhooks/mercadopago/',
      PAGOEFECTIVO: '/api/payments/webhooks/pagoefectivo/'
    }
  },
  
  // Configuraciones
  SETTINGS: {
    LIST: '/api/settings/hospital-settings/',
    CREATE: '/api/settings/hospital-settings/',
    BY_ID: (id) => `/api/settings/hospital-settings/${id}/`,
    PUBLIC: '/api/settings/hospital-settings/public_settings/',
    BY_CATEGORY: '/api/settings/hospital-settings/by_category/',
    BULK_UPDATE: '/api/settings/hospital-settings/bulk_update/'
  },

  // Analíticas y Dashboard
  ANALYTICS: {
    SUMMARY: '/api/analytics/summary/',
  },

  // --- Spring Boot API (mainApiClient) ---
  AVAILABILITY: {
    LIST: '/api/doctors/availability/',
    CREATE: '/api/doctors/availability/',
    BY_ID: (id) => `/api/doctors/availability/${id}/`,
    BY_DAY: '/api/doctors/availability/by_day/',
    BY_DOCTOR: '/api/doctors/availability/by_doctor/',
  },
  
  CATALOGS: {
    SPECIALTIES: {
      LIST: '/api/catalogs/specialties/',
      CREATE: '/api/catalogs/specialties/',
      BY_ID: (id) => `/api/catalogs/specialties/${id}/`,
    },
    PAYMENT_METHODS: {
      LIST: '/api/catalogs/payment-methods/',
      CREATE: '/api/catalogs/payment-methods/',
      BY_ID: (id) => `/api/catalogs/payment-methods/${id}/`,
    }
  },

  AUDIT: {
    LIST: '/api/audit/',
    BY_ID: (id) => `/api/audit/${id}/`,
    RECENT: '/api/audit/recent/',
  },
};
