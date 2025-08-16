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

/**
 * Valida formato de documento de identidad (DNI, Carnet de Extranjería, Pasaporte, etc.)
 * @param {string} documento - Documento a validar
 * @returns {Object} { isValid, error }
 */
export const validateDNI = (documento) => {
  if (!documento) {
    return { isValid: false, error: 'Campo obligatorio' };
  }
  
  // DEBUG: Solo logear si hay problemas
  if (documento.length > 30) {
    console.log('🔍 DNI demasiado largo:', { documento, length: documento.length });
  }
  
  // Validar longitud máxima para prevenir error 500
  if (documento.length > 30) {
    return { 
      isValid: false, 
      error: `Documento debe tener entre 3 y 30 caracteres (actual: ${documento.length})` 
    };
  }
  
  // Permitir cualquier combinación de letras y números (mínimo 3 caracteres)
  const documentoRegex = /^[a-zA-Z0-9]{3,30}$/;  // Aumenté a 30 para dar más margen
  const isValid = documentoRegex.test(documento.trim());
  
  return {
    isValid,
    error: isValid ? null : 'Documento debe tener entre 3 y 30 caracteres (letras y números)'
  };
};

/**
 * Valida contraseña para usuarios con requisitos específicos
 * @param {string} password - Contraseña a validar
 * @param {Object} options - Opciones de validación
 * @returns {Object} { isValid, error }
 */
export const validateUserPassword = (password, options = {}) => {
  const {
    minLength = 6,
    requireUppercase = false,
    requireLowercase = false,
    requireNumbers = false,
    requireSpecialChars = false
  } = options;

  if (!password) {
    return { isValid: false, error: 'Contraseña es obligatoria' };
  }

  if (password.length < minLength) {
    return { isValid: false, error: `Contraseña debe tener al menos ${minLength} caracteres` };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Contraseña debe contener al menos una mayúscula' };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return { isValid: false, error: 'Contraseña debe contener al menos una minúscula' };
  }

  if (requireNumbers && !/\d/.test(password)) {
    return { isValid: false, error: 'Contraseña debe contener al menos un número' };
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: 'Contraseña debe contener al menos un carácter especial' };
  }

  return { isValid: true, error: null };
};

/**
 * Valida que las contraseñas coincidan
 * @param {string} password - Contraseña original
 * @param {string} confirmPassword - Confirmación de contraseña
 * @returns {Object} { isValid, error }
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Confirmación de contraseña es obligatoria' };
  }

  const isValid = password === confirmPassword;
  
  return {
    isValid,
    error: isValid ? null : 'Las contraseñas no coinciden'
  };
};

/**
 * Valida formato de nombre (solo letras y espacios)
 * @param {string} name - Nombre a validar
 * @param {string} fieldName - Nombre del campo
 * @returns {Object} { isValid, error }
 */
export const validateName = (name, fieldName = 'Nombre') => {
  if (!name) {
    return { isValid: false, error: `${fieldName} es obligatorio` };
  }

  if (name.length < 2) {
    return { isValid: false, error: `${fieldName} debe tener al menos 2 caracteres` };
  }

  if (name.length > 50) {
    return { isValid: false, error: `${fieldName} no puede exceder 50 caracteres` };
  }

  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  const isValid = nameRegex.test(name);
  
  return {
    isValid,
    error: isValid ? null : `${fieldName} solo puede contener letras y espacios`
  };
};

/**
 * Valida formulario completo de usuario
 * @param {Object} formData - Datos del formulario
 * @param {string} formType - Tipo de formulario ('create', 'edit', 'user')
 * @returns {Object} Objeto con errores por campo
 */
export const validateUserForm = (formData, formType = 'user') => {
  const errors = {};

  // Validación de DNI (username)
  if (formType === 'create' || formData.username) {
    const dniValidation = validateDNI(formData.username);
    if (!dniValidation.isValid) {
      errors.username = dniValidation.error;
    }
  }

  // Validación de nombres
  if (formData.first_name) {
    const firstNameValidation = validateName(formData.first_name, 'Nombre');
    if (!firstNameValidation.isValid) {
      errors.first_name = firstNameValidation.error;
    }
  }

  if (formData.last_name) {
    const lastNameValidation = validateName(formData.last_name, 'Apellido');
    if (!lastNameValidation.isValid) {
      errors.last_name = lastNameValidation.error;
    }
  }

  // Validación de email
  if (formData.email) {
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error;
    }
  }

  // Validación de contraseña
  if (formType === 'create') {
    // En creación, la contraseña es obligatoria
    if (formData.password) {
      const passwordValidation = validateUserPassword(formData.password, {
        minLength: 6,
        requireUppercase: false,
        requireSpecialChars: false
      });
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.error;
      }
    } else {
      errors.password = 'Contraseña es obligatoria';
    }

    // Validación de confirmación de contraseña
    if (formData.password && formData.confirmPassword) {
      const confirmValidation = validatePasswordConfirmation(formData.password, formData.confirmPassword);
      if (!confirmValidation.isValid) {
        errors.confirmPassword = confirmValidation.error;
      }
    } else if (formData.password && !formData.confirmPassword) {
      errors.confirmPassword = 'Confirmación de contraseña es obligatoria';
    }
  } else if (formType === 'edit') {
    // En edición, la contraseña es opcional, pero si se proporciona debe ser válida
    const hasPassword = formData.password && formData.password.trim() !== '';
    const hasConfirmPassword = formData.confirmPassword && formData.confirmPassword.trim() !== '';
    
    if (hasPassword || hasConfirmPassword) {
      // Si hay alguna contraseña, validar ambas
      if (hasPassword) {
        const passwordValidation = validateUserPassword(formData.password, {
          minLength: 6,
          requireUppercase: false,
          requireSpecialChars: false
        });
        if (!passwordValidation.isValid) {
          errors.password = passwordValidation.error;
        }
      }
      
      // Validación de confirmación
      if (hasPassword && hasConfirmPassword) {
        const confirmValidation = validatePasswordConfirmation(formData.password, formData.confirmPassword);
        if (!confirmValidation.isValid) {
          errors.confirmPassword = confirmValidation.error;
        }
      } else if (hasPassword && !hasConfirmPassword) {
        errors.confirmPassword = 'Confirme la nueva contraseña';
      } else if (!hasPassword && hasConfirmPassword) {
        errors.password = 'Complete la nueva contraseña';
      }
    }
  }

  // Validación de grupos (opcional, puede ser array, string o number)
  if (formData.groups) {
    // Permitir que sea array, string o number, pero validar que no esté vacío
    if (Array.isArray(formData.groups)) {
      if (formData.groups.length === 0) {
        errors.groups = 'Debe seleccionar al menos un grupo';
      }
    } else if (typeof formData.groups === 'string' || typeof formData.groups === 'number') {
      // Si es string o number, validar que no sea vacío/0
      if (!formData.groups || (typeof formData.groups === 'string' && formData.groups.trim() === '')) {
        errors.groups = 'Debe seleccionar un grupo válido';
      }
    } else {
      errors.groups = 'Grupo debe ser una selección válida';
    }
  }

  return errors;
};