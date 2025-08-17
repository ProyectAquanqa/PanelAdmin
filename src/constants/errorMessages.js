/**
 * Mensajes de error amigables para el usuario
 * Centralizados para facilitar mantenimiento y consistencia
 */

// Mensajes de validación de formularios
export const VALIDATION_MESSAGES = {
  // Campos requeridos
  REQUIRED_FIELD: 'Este campo es obligatorio',
  
  // Validaciones de email
  INVALID_EMAIL: 'Por favor ingresa un email válido',
  EMAIL_REQUIRED: 'El email es obligatorio',
  
  // Validaciones de contraseña
  PASSWORD_REQUIRED: 'La contraseña es obligatoria',
  PASSWORD_MIN_LENGTH: 'La contraseña debe tener al menos 8 caracteres',
  PASSWORD_WEAK: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número',
  PASSWORD_CONFIRMATION_MISMATCH: 'Las contraseñas no coinciden',
  
  // Validaciones de nombre
  NAME_REQUIRED: 'El nombre es obligatorio',
  NAME_MIN_LENGTH: 'El nombre debe tener al menos 2 caracteres',
  NAME_MAX_LENGTH: 'El nombre no puede tener más de 50 caracteres',
  
  // Validaciones de teléfono
  PHONE_INVALID: 'Por favor ingresa un número de teléfono válido',
  PHONE_REQUIRED: 'El teléfono es obligatorio',
  
  // Validaciones de fecha
  DATE_INVALID: 'Por favor ingresa una fecha válida',
  DATE_REQUIRED: 'La fecha es obligatoria',
  DATE_FUTURE_REQUIRED: 'La fecha debe ser futura',
  DATE_PAST_REQUIRED: 'La fecha debe ser pasada',
  
  // Validaciones de selección
  SELECTION_REQUIRED: 'Debes seleccionar una opción',
  
  // Validaciones de archivo
  FILE_REQUIRED: 'Debes seleccionar un archivo',
  FILE_SIZE_EXCEEDED: 'El archivo es demasiado grande',
  FILE_TYPE_INVALID: 'Tipo de archivo no válido',
  
  // Validaciones numéricas
  NUMBER_REQUIRED: 'Este campo debe ser un número',
  NUMBER_MIN: 'El valor debe ser mayor a {min}',
  NUMBER_MAX: 'El valor debe ser menor a {max}',
  NUMBER_POSITIVE: 'El valor debe ser positivo'
};

// Mensajes de errores de API HTTP
export const API_ERROR_MESSAGES = {
  // Errores 4xx - Cliente
  400: 'Los datos enviados no son válidos. Por favor revisa la información',
  401: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente',
  403: 'No tienes permisos para realizar esta acción',
  404: 'No pudimos encontrar lo que buscas. Verifica que la información sea correcta',
  409: 'Ya existe un registro con esta información',
  422: 'Los datos enviados contienen errores. Por favor revísalos',
  429: 'Has realizado demasiadas solicitudes. Por favor espera un momento',
  
  // Errores 5xx - Servidor
  500: 'Algo salió mal en nuestros servidores. Estamos trabajando para solucionarlo',
  502: 'Servicio temporalmente no disponible. Por favor intenta más tarde',
  503: 'El servicio está en mantenimiento. Por favor intenta más tarde',
  504: 'La operación tardó demasiado. Por favor intenta nuevamente'
};

// Mensajes de errores de red
export const NETWORK_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Problema de conexión. Por favor, verifica tu internet e intenta nuevamente',
  TIMEOUT: 'La operación tardó demasiado. Por favor intenta nuevamente',
  CONNECTION_REFUSED: 'No se pudo conectar al servidor. Por favor intenta más tarde',
  DNS_ERROR: 'Error de conexión. Verifica tu conexión a internet'
};

// Mensajes de errores de autenticación específicos
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos. Verifica tus datos e intenta nuevamente',
  SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente',
  ACCOUNT_LOCKED: 'Tu cuenta ha sido bloqueada. Contacta al administrador',
  ACCOUNT_DISABLED: 'Tu cuenta está deshabilitada. Contacta al administrador',
  TOKEN_INVALID: 'Token de acceso inválido. Por favor inicia sesión nuevamente',
  REFRESH_TOKEN_EXPIRED: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente'
};

// Mensajes de confirmación y éxito
export const SUCCESS_MESSAGES = {
  // Operaciones CRUD
  CREATED: 'Información guardada correctamente',
  UPDATED: 'Datos actualizados correctamente',
  DELETED: 'Elemento eliminado correctamente',
  
  // Operaciones específicas
  LOGIN_SUCCESS: 'Bienvenido de vuelta',
  LOGOUT_SUCCESS: 'Sesión cerrada correctamente',
  PASSWORD_CHANGED: 'Contraseña cambiada correctamente',
  EMAIL_SENT: 'Email enviado correctamente',
  FILE_UPLOADED: 'Archivo subido correctamente',
  
  // Operaciones de usuario
  USER_CREATED: 'Usuario creado correctamente',
  USER_UPDATED: 'Usuario actualizado correctamente',
  USER_DELETED: 'Usuario eliminado correctamente',
  
  // Operaciones de perfil
  PROFILE_UPDATED: 'Perfil actualizado correctamente',
  SETTINGS_SAVED: 'Configuración guardada correctamente'
};

// Mensajes de advertencia
export const WARNING_MESSAGES = {
  UNSAVED_CHANGES: 'Tienes cambios sin guardar. ¿Estás seguro de salir?',
  DELETE_CONFIRMATION: '¿Estás seguro de eliminar este elemento?',
  IRREVERSIBLE_ACTION: 'Esta acción no se puede deshacer',
  SESSION_ABOUT_TO_EXPIRE: 'Tu sesión expirará pronto. ¿Deseas extenderla?'
};

// Mensajes informativos
export const INFO_MESSAGES = {
  LOADING: 'Cargando...',
  SAVING: 'Guardando...',
  PROCESSING: 'Procesando...',
  NO_DATA: 'No hay datos disponibles',
  EMPTY_RESULTS: 'No se encontraron resultados',
  SEARCH_PLACEHOLDER: 'Buscar...'
};

// Función helper para reemplazar placeholders en mensajes
export const formatMessage = (message, params = {}) => {
  return message.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? params[key] : match;
  });
};

// Exportar todos los mensajes en un objeto para fácil acceso
export const ERROR_MESSAGES = {
  VALIDATION: VALIDATION_MESSAGES,
  API: API_ERROR_MESSAGES,
  NETWORK: NETWORK_ERROR_MESSAGES,
  AUTH: AUTH_ERROR_MESSAGES,
  SUCCESS: SUCCESS_MESSAGES,
  WARNING: WARNING_MESSAGES,
  INFO: INFO_MESSAGES
};

export default ERROR_MESSAGES;