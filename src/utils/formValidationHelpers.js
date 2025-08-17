/**
 * Helpers adicionales para validación de formularios
 * Funciones específicas para diferentes tipos de campos y validaciones complejas
 */

import { VALIDATION_MESSAGES } from '../constants/errorMessages';

/**
 * Valida formato de fecha
 * @param {string} dateString - Fecha en formato string
 * @param {string} format - Formato esperado ('YYYY-MM-DD', 'DD/MM/YYYY', etc.)
 * @returns {Object} { isValid, error }
 */
export const validateDate = (dateString, format = 'YYYY-MM-DD') => {
  if (!dateString) {
    return { isValid: false, error: 'La fecha es obligatoria' };
  }

  const date = new Date(dateString);
  const isValid = !isNaN(date.getTime());

  return {
    isValid,
    error: isValid ? null : 'Formato de fecha inválido'
  };
};

/**
 * Valida que una fecha sea futura
 * @param {string} dateString - Fecha a validar
 * @returns {Object} { isValid, error }
 */
export const validateFutureDate = (dateString) => {
  const dateValidation = validateDate(dateString);
  if (!dateValidation.isValid) return dateValidation;

  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isValid = inputDate >= today;

  return {
    isValid,
    error: isValid ? null : 'La fecha debe ser futura'
  };
};

/**
 * Valida que una fecha sea pasada
 * @param {string} dateString - Fecha a validar
 * @returns {Object} { isValid, error }
 */
export const validatePastDate = (dateString) => {
  const dateValidation = validateDate(dateString);
  if (!dateValidation.isValid) return dateValidation;

  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const isValid = inputDate <= today;

  return {
    isValid,
    error: isValid ? null : 'La fecha debe ser pasada'
  };
};

/**
 * Valida rango de fechas
 * @param {string} startDate - Fecha de inicio
 * @param {string} endDate - Fecha de fin
 * @returns {Object} { isValid, error }
 */
export const validateDateRange = (startDate, endDate) => {
  const startValidation = validateDate(startDate);
  if (!startValidation.isValid) {
    return { isValid: false, error: 'Fecha de inicio inválida' };
  }

  const endValidation = validateDate(endDate);
  if (!endValidation.isValid) {
    return { isValid: false, error: 'Fecha de fin inválida' };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const isValid = start <= end;

  return {
    isValid,
    error: isValid ? null : 'La fecha de inicio debe ser anterior a la fecha de fin'
  };
};

/**
 * Valida formato de URL
 * @param {string} url - URL a validar
 * @returns {Object} { isValid, error }
 */
export const validateURL = (url) => {
  if (!url) {
    return { isValid: false, error: 'La URL es obligatoria' };
  }

  try {
    new URL(url);
    return { isValid: true, error: null };
  } catch {
    return { isValid: false, error: 'Formato de URL inválido' };
  }
};

/**
 * Valida tamaño de archivo
 * @param {File} file - Archivo a validar
 * @param {number} maxSizeInMB - Tamaño máximo en MB
 * @returns {Object} { isValid, error }
 */
export const validateFileSize = (file, maxSizeInMB = 5) => {
  if (!file) {
    return { isValid: false, error: 'Debe seleccionar un archivo' };
  }

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  const isValid = file.size <= maxSizeInBytes;

  return {
    isValid,
    error: isValid ? null : `El archivo no puede exceder ${maxSizeInMB}MB`
  };
};

/**
 * Valida tipo de archivo
 * @param {File} file - Archivo a validar
 * @param {Array} allowedTypes - Tipos permitidos (ej: ['image/jpeg', 'image/png'])
 * @returns {Object} { isValid, error }
 */
export const validateFileType = (file, allowedTypes = []) => {
  if (!file) {
    return { isValid: false, error: 'Debe seleccionar un archivo' };
  }

  if (allowedTypes.length === 0) {
    return { isValid: true, error: null };
  }

  const isValid = allowedTypes.includes(file.type);

  return {
    isValid,
    error: isValid ? null : 'Tipo de archivo no permitido'
  };
};

/**
 * Valida múltiples archivos
 * @param {FileList|Array} files - Lista de archivos
 * @param {Object} options - Opciones de validación
 * @returns {Object} { isValid, errors }
 */
export const validateMultipleFiles = (files, options = {}) => {
  const {
    maxFiles = 10,
    maxSizeInMB = 5,
    allowedTypes = []
  } = options;

  const errors = [];
  
  if (!files || files.length === 0) {
    return { isValid: false, errors: ['Debe seleccionar al menos un archivo'] };
  }

  if (files.length > maxFiles) {
    errors.push(`No puede seleccionar más de ${maxFiles} archivos`);
  }

  Array.from(files).forEach((file, index) => {
    const sizeValidation = validateFileSize(file, maxSizeInMB);
    if (!sizeValidation.isValid) {
      errors.push(`Archivo ${index + 1}: ${sizeValidation.error}`);
    }

    const typeValidation = validateFileType(file, allowedTypes);
    if (!typeValidation.isValid) {
      errors.push(`Archivo ${index + 1}: ${typeValidation.error}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : null
  };
};

/**
 * Valida código postal peruano
 * @param {string} postalCode - Código postal
 * @returns {Object} { isValid, error }
 */
export const validatePostalCode = (postalCode) => {
  if (!postalCode) {
    return { isValid: false, error: 'El código postal es obligatorio' };
  }

  const postalCodeRegex = /^\d{5}$/;
  const isValid = postalCodeRegex.test(postalCode);

  return {
    isValid,
    error: isValid ? null : 'El código postal debe tener 5 dígitos'
  };
};

/**
 * Valida número de teléfono peruano
 * @param {string} phone - Número de teléfono
 * @returns {Object} { isValid, error }
 */
export const validatePeruvianPhone = (phone) => {
  if (!phone) {
    return { isValid: false, error: 'El teléfono es obligatorio' };
  }

  // Remover espacios y caracteres especiales para validación
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Validar teléfono móvil (9 dígitos empezando con 9) o fijo (7-8 dígitos)
  const mobileRegex = /^9\d{8}$/;
  const landlineRegex = /^\d{7,8}$/;
  
  const isValid = mobileRegex.test(cleanPhone) || landlineRegex.test(cleanPhone);

  return {
    isValid,
    error: isValid ? null : 'Formato de teléfono inválido'
  };
};

/**
 * Valida RUC peruano
 * @param {string} ruc - RUC a validar
 * @returns {Object} { isValid, error }
 */
export const validateRUC = (ruc) => {
  if (!ruc) {
    return { isValid: false, error: 'El RUC es obligatorio' };
  }

  const rucRegex = /^\d{11}$/;
  const isValid = rucRegex.test(ruc);

  return {
    isValid,
    error: isValid ? null : 'El RUC debe tener exactamente 11 dígitos'
  };
};

/**
 * Valida que un array no esté vacío
 * @param {Array} array - Array a validar
 * @param {string} fieldName - Nombre del campo
 * @returns {Object} { isValid, error }
 */
export const validateNonEmptyArray = (array, fieldName = 'Campo') => {
  const isValid = Array.isArray(array) && array.length > 0;

  return {
    isValid,
    error: isValid ? null : `Debe seleccionar al menos un ${fieldName.toLowerCase()}`
  };
};

/**
 * Valida longitud de un array
 * @param {Array} array - Array a validar
 * @param {number} minLength - Longitud mínima
 * @param {number} maxLength - Longitud máxima
 * @param {string} fieldName - Nombre del campo
 * @returns {Object} { isValid, error }
 */
export const validateArrayLength = (array, minLength = 0, maxLength = Infinity, fieldName = 'elementos') => {
  if (!Array.isArray(array)) {
    return { isValid: false, error: 'Debe ser una lista válida' };
  }

  if (array.length < minLength) {
    return { 
      isValid: false, 
      error: `Debe seleccionar al menos ${minLength} ${fieldName}` 
    };
  }

  if (array.length > maxLength) {
    return { 
      isValid: false, 
      error: `No puede seleccionar más de ${maxLength} ${fieldName}` 
    };
  }

  return { isValid: true, error: null };
};

/**
 * Valida formato de hora (HH:MM)
 * @param {string} time - Hora en formato HH:MM
 * @returns {Object} { isValid, error }
 */
export const validateTime = (time) => {
  if (!time) {
    return { isValid: false, error: 'La hora es obligatoria' };
  }

  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  const isValid = timeRegex.test(time);

  return {
    isValid,
    error: isValid ? null : 'Formato de hora inválido (HH:MM)'
  };
};

/**
 * Valida rango de horas
 * @param {string} startTime - Hora de inicio
 * @param {string} endTime - Hora de fin
 * @returns {Object} { isValid, error }
 */
export const validateTimeRange = (startTime, endTime) => {
  const startValidation = validateTime(startTime);
  if (!startValidation.isValid) {
    return { isValid: false, error: 'Hora de inicio inválida' };
  }

  const endValidation = validateTime(endTime);
  if (!endValidation.isValid) {
    return { isValid: false, error: 'Hora de fin inválida' };
  }

  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  const isValid = start < end;

  return {
    isValid,
    error: isValid ? null : 'La hora de inicio debe ser anterior a la hora de fin'
  };
};

/**
 * Valida que un valor esté en una lista de opciones válidas
 * @param {any} value - Valor a validar
 * @param {Array} validOptions - Lista de opciones válidas
 * @param {string} fieldName - Nombre del campo
 * @returns {Object} { isValid, error }
 */
export const validateInOptions = (value, validOptions = [], fieldName = 'Campo') => {
  if (!value) {
    return { isValid: false, error: `${fieldName} es obligatorio` };
  }

  const isValid = validOptions.includes(value);

  return {
    isValid,
    error: isValid ? null : `${fieldName} no es una opción válida`
  };
};

/**
 * Valida formato de color hexadecimal
 * @param {string} color - Color en formato hex
 * @returns {Object} { isValid, error }
 */
export const validateHexColor = (color) => {
  if (!color) {
    return { isValid: false, error: 'El color es obligatorio' };
  }

  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const isValid = hexColorRegex.test(color);

  return {
    isValid,
    error: isValid ? null : 'Formato de color inválido (ej: #FF0000)'
  };
};

/**
 * Crea una función de validación personalizada que combina múltiples validaciones
 * @param {Array} validators - Array de funciones de validación
 * @returns {Function} Función de validación combinada
 */
export const combineValidators = (validators) => {
  return (value, allValues = {}) => {
    for (const validator of validators) {
      const result = validator(value, allValues);
      if (result !== true) {
        return result;
      }
    }
    return true;
  };
};

/**
 * Crea una función de validación condicional
 * @param {Function} condition - Función que determina si aplicar la validación
 * @param {Function} validator - Función de validación a aplicar
 * @returns {Function} Función de validación condicional
 */
export const conditionalValidator = (condition, validator) => {
  return (value, allValues = {}) => {
    if (condition(value, allValues)) {
      return validator(value, allValues);
    }
    return true;
  };
};

export default {
  validateDate,
  validateFutureDate,
  validatePastDate,
  validateDateRange,
  validateURL,
  validateFileSize,
  validateFileType,
  validateMultipleFiles,
  validatePostalCode,
  validatePeruvianPhone,
  validateRUC,
  validateNonEmptyArray,
  validateArrayLength,
  validateTime,
  validateTimeRange,
  validateInOptions,
  validateHexColor,
  combineValidators,
  conditionalValidator
};