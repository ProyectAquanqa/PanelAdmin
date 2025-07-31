/**
 * Utilidades para manejo de fechas
 * Funciones puras para formatear y manipular fechas
 */

/**
 * Formatea una fecha en formato legible en español
 * @param {string|Date} date - Fecha a formatear
 * @param {Object} options - Opciones de formateo
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return dateObj.toLocaleDateString('es-ES', defaultOptions);
};

/**
 * Formatea una fecha en formato corto (dd/mm/yyyy)
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha en formato corto
 */
export const formatDateShort = (date) => {
  return formatDate(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Formatea una fecha con hora
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha con hora formateada
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatea tiempo relativo (hace X minutos, hace X horas, etc.)
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Tiempo relativo
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  if (diffInSeconds < 60) {
    return 'hace unos segundos';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `hace ${diffInYears} año${diffInYears > 1 ? 's' : ''}`;
};

/**
 * Verifica si una fecha es válida
 * @param {any} date - Fecha a validar
 * @returns {boolean} True si es válida
 */
export const isValidDate = (date) => {
  if (!date) return false;
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

/**
 * Obtiene el inicio del día para una fecha
 * @param {string|Date} date - Fecha
 * @returns {Date} Inicio del día
 */
export const getStartOfDay = (date) => {
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
};

/**
 * Obtiene el final del día para una fecha
 * @param {string|Date} date - Fecha
 * @returns {Date} Final del día
 */
export const getEndOfDay = (date) => {
  const dateObj = new Date(date);
  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
};

/**
 * Calcula la diferencia en días entre dos fechas
 * @param {string|Date} date1 - Primera fecha
 * @param {string|Date} date2 - Segunda fecha
 * @returns {number} Diferencia en días
 */
export const getDaysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  if (!isValidDate(d1) || !isValidDate(d2)) return 0;
  
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Verifica si una fecha está en el pasado
 * @param {string|Date} date - Fecha a verificar
 * @returns {boolean} True si está en el pasado
 */
export const isPastDate = (date) => {
  if (!isValidDate(date)) return false;
  return new Date(date) < new Date();
};

/**
 * Verifica si una fecha está en el futuro
 * @param {string|Date} date - Fecha a verificar
 * @returns {boolean} True si está en el futuro
 */
export const isFutureDate = (date) => {
  if (!isValidDate(date)) return false;
  return new Date(date) > new Date();
};

/**
 * Verifica si una fecha es hoy
 * @param {string|Date} date - Fecha a verificar
 * @returns {boolean} True si es hoy
 */
export const isToday = (date) => {
  if (!isValidDate(date)) return false;
  
  const today = new Date();
  const dateObj = new Date(date);
  
  return dateObj.getDate() === today.getDate() &&
         dateObj.getMonth() === today.getMonth() &&
         dateObj.getFullYear() === today.getFullYear();
};

/**
 * Obtiene el rango de fechas para un período
 * @param {string} period - Período ('today', 'week', 'month', 'year')
 * @returns {Object} { start, end }
 */
export const getDateRange = (period) => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  
  switch (period) {
    case 'today':
      return {
        start: getStartOfDay(start),
        end: getEndOfDay(end)
      };
      
    case 'week':
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      end.setDate(start.getDate() + 6);
      return {
        start: getStartOfDay(start),
        end: getEndOfDay(end)
      };
      
    case 'month':
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0);
      return {
        start: getStartOfDay(start),
        end: getEndOfDay(end)
      };
      
    case 'year':
      start.setMonth(0, 1);
      end.setMonth(11, 31);
      return {
        start: getStartOfDay(start),
        end: getEndOfDay(end)
      };
      
    default:
      return {
        start: getStartOfDay(now),
        end: getEndOfDay(now)
      };
  }
};

/**
 * Convierte una fecha a formato ISO string
 * @param {string|Date} date - Fecha a convertir
 * @returns {string} Fecha en formato ISO
 */
export const toISOString = (date) => {
  if (!isValidDate(date)) return '';
  return new Date(date).toISOString();
};

/**
 * Parsea una fecha desde diferentes formatos
 * @param {string} dateString - String de fecha
 * @returns {Date|null} Fecha parseada o null
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  // Intentar parsear diferentes formatos
  const formats = [
    // ISO format
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    // Date only
    /^\d{4}-\d{2}-\d{2}$/,
    // DD/MM/YYYY
    /^\d{2}\/\d{2}\/\d{4}$/,
    // MM/DD/YYYY
    /^\d{2}\/\d{2}\/\d{4}$/,
  ];
  
  const date = new Date(dateString);
  if (isValidDate(date)) {
    return date;
  }
  
  return null;
};