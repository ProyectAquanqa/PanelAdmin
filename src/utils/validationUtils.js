/**
 * Utilidades de validación para formularios y datos
 * Funciones puras para validar diferentes tipos de datos
 */

/**
 * Valida que un campo sea requerido (no vacío)
 * @param {any} value - Valor a validar
 * @param {string} fieldName - Nombre del campo para el mensaje de error
 * @returns {Object} { isValid, error }
 */
export const validateRequired = (value, fieldName = 'Campo') => {
  const isValid = value !== null && value !== undefined && value !== '';
  
  return {
    isValid,
    error: isValid ? null : `${fieldName} es obligatorio`
  };
};

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {Object} { isValid, error }
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: 'Email es obligatorio' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  
  return {
    isValid,
    error: isValid ? null : 'Formato de email inválido'
  };
};

/**
 * Valida longitud mínima de un texto
 * @param {string} value - Valor a validar
 * @param {number} minLength - Longitud mínima
 * @param {string} fieldName - Nombre del campo
 * @returns {Object} { isValid, error }
 */
export const validateMinLength = (value, minLength, fieldName = 'Campo') => {
  if (!value || typeof value !== 'string') {
    return { isValid: false, error: `${fieldName} es obligatorio` };
  }
  
  const isValid = value.length >= minLength;
  
  return {
    isValid,
    error: isValid ? null : `${fieldName} debe tener al menos ${minLength} caracteres`
  };
};

/**
 * Valida longitud máxima de un texto
 * @param {string} value - Valor a validar
 * @param {number} maxLength - Longitud máxima
 * @param {string} fieldName - Nombre del campo
 * @returns {Object} { isValid, error }
 */
export const validateMaxLength = (value, maxLength, fieldName = 'Campo') => {
  if (!value) return { isValid: true, error: null };
  
  if (typeof value !== 'string') {
    return { isValid: false, error: `${fieldName} debe ser texto` };
  }
  
  const isValid = value.length <= maxLength;
  
  return {
    isValid,
    error: isValid ? null : `${fieldName} no puede exceder ${maxLength} caracteres`
  };
};

/**
 * Valida que un valor sea un número
 * @param {any} value - Valor a validar
 * @param {string} fieldName - Nombre del campo
 * @returns {Object} { isValid, error }
 */
export const validateNumber = (value, fieldName = 'Campo') => {
  const numValue = Number(value);
  const isValid = !isNaN(numValue) && isFinite(numValue);
  
  return {
    isValid,
    error: isValid ? null : `${fieldName} debe ser un número válido`
  };
};

/**
 * Valida que un número esté en un rango específico
 * @param {number} value - Valor a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @param {string} fieldName - Nombre del campo
 * @returns {Object} { isValid, error }
 */
export const validateRange = (value, min, max, fieldName = 'Campo') => {
  const numValidation = validateNumber(value, fieldName);
  if (!numValidation.isValid) return numValidation;
  
  const numValue = Number(value);
  const isValid = numValue >= min && numValue <= max;
  
  return {
    isValid,
    error: isValid ? null : `${fieldName} debe estar entre ${min} y ${max}`
  };
};

/**
 * Valida fortaleza de contraseña
 * @param {string} password - Contraseña a validar
 * @returns {Object} Objeto detallado de validación
 */
export const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      error: 'Contraseña es obligatoria',
      details: {
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumbers: false,
        hasSpecialChars: false
      }
    };
  }
  
  const details = {
    minLength: password.length >= 6,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  const isValid = details.minLength;
  
  return {
    isValid,
    error: isValid ? null : 'Contraseña debe tener al menos 6 caracteres',
    details
  };
};

/**
 * Valida formulario de conocimiento (Knowledge Base)
 * @param {Object} formData - Datos del formulario
 * @returns {Object} { isValid, errors }
 */
export const validateKnowledgeForm = (formData) => {
  const errors = {};
  let isValid = true;
  
  // Validar pregunta
  const questionValidation = validateRequired(formData.question, 'Pregunta');
  if (!questionValidation.isValid) {
    errors.question = questionValidation.error;
    isValid = false;
  } else {
    const lengthValidation = validateMinLength(formData.question, 5, 'Pregunta');
    if (!lengthValidation.isValid) {
      errors.question = lengthValidation.error;
      isValid = false;
    }
  }
  
  // Validar respuesta
  const answerValidation = validateRequired(formData.answer, 'Respuesta');
  if (!answerValidation.isValid) {
    errors.answer = answerValidation.error;
    isValid = false;
  } else {
    const lengthValidation = validateMinLength(formData.answer, 10, 'Respuesta');
    if (!lengthValidation.isValid) {
      errors.answer = lengthValidation.error;
      isValid = false;
    }
  }
  
  // Validar palabras clave (opcional pero si existe debe ser válida)
  if (formData.keywords) {
    const maxLengthValidation = validateMaxLength(formData.keywords, 500, 'Palabras clave');
    if (!maxLengthValidation.isValid) {
      errors.keywords = maxLengthValidation.error;
      isValid = false;
    }
  }
  
  return { isValid, errors };
};

/**
 * Valida formulario de categoría
 * @param {Object} formData - Datos del formulario
 * @returns {Object} { isValid, errors }
 */
export const validateCategoryForm = (formData) => {
  const errors = {};
  let isValid = true;
  
  // Validar nombre
  const nameValidation = validateRequired(formData.name, 'Nombre');
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error;
    isValid = false;
  } else {
    const lengthValidation = validateMaxLength(formData.name, 100, 'Nombre');
    if (!lengthValidation.isValid) {
      errors.name = lengthValidation.error;
      isValid = false;
    }
  }
  
  // Validar descripción (opcional)
  if (formData.description) {
    const lengthValidation = validateMaxLength(formData.description, 500, 'Descripción');
    if (!lengthValidation.isValid) {
      errors.description = lengthValidation.error;
      isValid = false;
    }
  }
  
  return { isValid, errors };
};

/**
 * Aplica múltiples validaciones a un valor
 * @param {any} value - Valor a validar
 * @param {Array} validations - Array de funciones de validación
 * @returns {Object} { isValid, errors }
 */
export const applyValidations = (value, validations) => {
  const errors = [];
  let isValid = true;
  
  for (const validation of validations) {
    const result = validation(value);
    if (!result.isValid) {
      errors.push(result.error);
      isValid = false;
    }
  }
  
  return {
    isValid,
    errors: errors.length > 0 ? errors : null,
    firstError: errors.length > 0 ? errors[0] : null
  };
};

/**
 * Valida un objeto completo basado en reglas
 * @param {Object} data - Datos a validar
 * @param {Object} rules - Reglas de validación por campo
 * @returns {Object} { isValid, errors }
 */
export const validateObject = (data, rules) => {
  const errors = {};
  let isValid = true;
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    const validation = applyValidations(value, fieldRules);
    
    if (!validation.isValid) {
      errors[field] = validation.firstError;
      isValid = false;
    }
  }
  
  return { isValid, errors };
};

/**
 * Sanitiza un string removiendo caracteres peligrosos
 * @param {string} input - String a sanitizar
 * @returns {string} String sanitizado
 */
export const sanitizeString = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remover scripts
    .replace(/<[^>]*>/g, '') // Remover HTML tags
    .trim();
};