/**
 * Utilidades de formateo para datos y presentación
 * Funciones puras para formatear diferentes tipos de datos
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
 * Trunca un texto a una longitud específica
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @param {string} suffix - Sufijo a agregar (por defecto '...')
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitaliza la primera letra de un texto
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
export const capitalize = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Convierte texto a formato título (Primera Letra De Cada Palabra)
 * @param {string} text - Texto a convertir
 * @returns {string} Texto en formato título
 */
export const toTitleCase = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Formatea un número con separadores de miles
 * @param {number} number - Número a formatear
 * @param {string} locale - Locale para formateo (por defecto 'es-ES')
 * @returns {string} Número formateado
 */
export const formatNumber = (number, locale = 'es-ES') => {
  if (number === null || number === undefined || isNaN(number)) return '0';
  
  return new Intl.NumberFormat(locale).format(number);
};

/**
 * Formatea un número como porcentaje
 * @param {number} value - Valor a formatear (0-1 o 0-100)
 * @param {boolean} isDecimal - Si el valor está en formato decimal (0-1)
 * @returns {string} Porcentaje formateado
 */
export const formatPercentage = (value, isDecimal = true) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  
  const percentage = isDecimal ? value * 100 : value;
  return `${Math.round(percentage)}%`;
};

/**
 * Formatea palabras clave como array de strings
 * @param {string|Array} keywords - Palabras clave
 * @returns {Array} Array de palabras clave
 */
export const formatKeywords = (keywords) => {
  if (!keywords) return [];
  
  if (Array.isArray(keywords)) {
    return keywords.filter(keyword => keyword && keyword.trim());
  }
  
  if (typeof keywords === 'string') {
    return keywords
      .split(',')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword);
  }
  
  return [];
};

/**
 * Formatea palabras clave para mostrar con límite
 * @param {string|Array} keywords - Palabras clave
 * @param {number} maxVisible - Máximo de palabras visibles
 * @returns {Object} { visible, remaining }
 */
export const formatKeywordsDisplay = (keywords, maxVisible = 3) => {
  const keywordArray = formatKeywords(keywords);
  
  return {
    visible: keywordArray.slice(0, maxVisible),
    remaining: Math.max(0, keywordArray.length - maxVisible),
    total: keywordArray.length
  };
};

/**
 * Formatea el tamaño de archivo en formato legible
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Formatea un nombre de usuario para mostrar
 * @param {Object} user - Objeto de usuario
 * @returns {string} Nombre formateado
 */
export const formatUserName = (user) => {
  if (!user) return 'Usuario';
  
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  
  if (user.username) {
    return user.username;
  }
  
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'Usuario';
};

/**
 * Formatea las iniciales de un usuario
 * @param {Object} user - Objeto de usuario
 * @returns {string} Iniciales
 */
export const formatUserInitials = (user) => {
  if (!user) return 'U';
  
  if (user.first_name && user.last_name) {
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  }
  
  if (user.username) {
    return user.username.charAt(0).toUpperCase();
  }
  
  return 'U';
};

/**
 * Formatea un estado booleano como texto
 * @param {boolean} status - Estado booleano
 * @param {Object} labels - Etiquetas personalizadas
 * @returns {string} Estado formateado
 */
export const formatStatus = (status, labels = { true: 'Activo', false: 'Inactivo' }) => {
  return status ? labels.true : labels.false;
};