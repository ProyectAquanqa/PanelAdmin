/**
 * Configuración de rutas de la API
 * ✅ CORREGIDO: Usar URLs exactas que coincidan con Django
 */

export const API_ROUTES = {
  // Autenticación
  AUTH: {
    LOGIN: `/api/auth/login`,
    REFRESH: `/api/auth/refresh-token`,
    PROFILE: `/api/auth/profile`,
  },
  
  // Doctores
  DOCTORS: `/api/doctors/doctors`,
  
  // Usuarios
  USERS: `/api/users/users`,
  
  // Pacientes
  PATIENTS: `/api/users/patients`,
  
  // Especialidades - URL sin barra final
  SPECIALTIES: `/api/catalogs/specialties`,
  
  // Catálogos
  CATALOGS: {
    DOCUMENT_TYPES: `/api/catalogs/document-types`,
    SPECIALTIES: `/api/catalogs/specialties`,
    PAYMENT_METHODS: `/api/catalogs/payment-methods`,
  },
  
  // Citas - Corregido para coincidir con la estructura de Django
  APPOINTMENTS: `/api/appointments/api/appointments`,
};
