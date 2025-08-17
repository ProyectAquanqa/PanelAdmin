import { useState, useCallback, useMemo } from 'react';
import { VALIDATION_MESSAGES } from '../constants/errorMessages';

/**
 * Hook para validación de formularios en tiempo real
 * Proporciona funcionalidades de validación, manejo de errores y estado del formulario
 * 
 * @param {Object} initialValues - Valores iniciales del formulario
 * @param {Object} validationRules - Reglas de validación por campo
 * @returns {Object} Objeto con valores, errores, funciones de validación y manejo
 */
const useFormValidation = (initialValues = {}, validationRules = {}) => {
  // Estado del formulario
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Valida un campo específico usando sus reglas
   * @param {string} fieldName - Nombre del campo
   * @param {any} value - Valor a validar
   * @returns {string|null} Mensaje de error o null si es válido
   */
  const validateField = useCallback((fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return null;

    // Validación de campo requerido
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return rules.requiredMessage || VALIDATION_MESSAGES.REQUIRED_FIELD;
    }

    // Si el campo no es requerido y está vacío, no validar otras reglas
    if (!rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return null;
    }

    // Validación de longitud mínima
    if (rules.minLength && value && value.length < rules.minLength) {
      return rules.minLengthMessage || `Debe tener al menos ${rules.minLength} caracteres`;
    }

    // Validación de longitud máxima
    if (rules.maxLength && value && value.length > rules.maxLength) {
      return rules.maxLengthMessage || `No puede exceder ${rules.maxLength} caracteres`;
    }

    // Validación de patrón (regex)
    if (rules.pattern && value && !rules.pattern.test(value)) {
      return rules.patternMessage || 'Formato inválido';
    }

    // Validación de email
    if (rules.email && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return rules.emailMessage || VALIDATION_MESSAGES.INVALID_EMAIL;
      }
    }

    // Validación de contraseña
    if (rules.password && value) {
      const minLength = rules.passwordMinLength || 8;
      if (value.length < minLength) {
        return rules.passwordMessage || `La contraseña debe tener al menos ${minLength} caracteres`;
      }

      if (rules.passwordRequireUppercase && !/[A-Z]/.test(value)) {
        return 'La contraseña debe contener al menos una mayúscula';
      }

      if (rules.passwordRequireLowercase && !/[a-z]/.test(value)) {
        return 'La contraseña debe contener al menos una minúscula';
      }

      if (rules.passwordRequireNumbers && !/\d/.test(value)) {
        return 'La contraseña debe contener al menos un número';
      }

      if (rules.passwordRequireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        return 'La contraseña debe contener al menos un carácter especial';
      }
    }

    // Validación de confirmación de contraseña
    if (rules.confirmPassword && value) {
      const passwordField = rules.confirmPasswordField || 'password';
      const passwordValue = values[passwordField];
      if (value !== passwordValue) {
        return rules.confirmPasswordMessage || VALIDATION_MESSAGES.PASSWORD_CONFIRMATION_MISMATCH;
      }
    }

    // Validación numérica
    if (rules.numeric && value) {
      const numValue = Number(value);
      if (isNaN(numValue) || !isFinite(numValue)) {
        return rules.numericMessage || VALIDATION_MESSAGES.NUMBER_REQUIRED;
      }

      if (rules.min !== undefined && numValue < rules.min) {
        return rules.minMessage || `El valor debe ser mayor o igual a ${rules.min}`;
      }

      if (rules.max !== undefined && numValue > rules.max) {
        return rules.maxMessage || `El valor debe ser menor o igual a ${rules.max}`;
      }
    }

    // Validación personalizada
    if (rules.custom && typeof rules.custom === 'function') {
      const customResult = rules.custom(value, values);
      if (customResult !== true) {
        return typeof customResult === 'string' ? customResult : 'Valor inválido';
      }
    }

    return null;
  }, [validationRules, values]);

  /**
   * Valida todos los campos del formulario
   * @returns {Object} Objeto con errores por campo
   */
  const validateAll = useCallback(() => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    setErrors(newErrors);
    return newErrors;
  }, [validateField, values, validationRules]);

  /**
   * Maneja el cambio de valor de un campo
   * @param {string} fieldName - Nombre del campo
   * @param {any} value - Nuevo valor
   */
  const handleChange = useCallback((fieldName, value) => {
    setValues(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Validar en tiempo real solo si el campo ya fue tocado
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }
  }, [touched, validateField]);

  /**
   * Maneja el evento blur de un campo (cuando pierde el foco)
   * @param {string} fieldName - Nombre del campo
   */
  const handleBlur = useCallback((fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    // Validar el campo cuando pierde el foco
    const error = validateField(fieldName, values[fieldName]);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, [validateField, values]);

  /**
   * Resetea el formulario a sus valores iniciales
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Establece errores manualmente (útil para errores del servidor)
   * @param {Object} newErrors - Objeto con errores por campo
   */
  const setFieldErrors = useCallback((newErrors) => {
    setErrors(prev => ({
      ...prev,
      ...newErrors
    }));
  }, []);

  /**
   * Limpia el error de un campo específico
   * @param {string} fieldName - Nombre del campo
   */
  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Establece el valor de un campo específico
   * @param {string} fieldName - Nombre del campo
   * @param {any} value - Nuevo valor
   */
  const setFieldValue = useCallback((fieldName, value) => {
    setValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  }, []);

  /**
   * Establece múltiples valores a la vez
   * @param {Object} newValues - Objeto con los nuevos valores
   */
  const setValues = useCallback((newValues) => {
    if (typeof newValues === 'function') {
      setValues(newValues);
    } else {
      setValues(prev => ({
        ...prev,
        ...newValues
      }));
    }
  }, []);

  // Calcula si el formulario es válido
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // Calcula si hay campos tocados
  const hasBeenTouched = useMemo(() => {
    return Object.keys(touched).length > 0;
  }, [touched]);

  // Función helper para obtener props de un campo
  const getFieldProps = useCallback((fieldName) => {
    return {
      name: fieldName,
      value: values[fieldName] || '',
      onChange: (e) => {
        const value = e.target ? e.target.value : e;
        handleChange(fieldName, value);
      },
      onBlur: () => handleBlur(fieldName),
      error: errors[fieldName],
      hasError: !!errors[fieldName]
    };
  }, [values, errors, handleChange, handleBlur]);

  return {
    // Estado
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    hasBeenTouched,

    // Funciones de validación
    validateField,
    validateAll,

    // Funciones de manejo
    handleChange,
    handleBlur,
    reset,

    // Funciones de control
    setFieldErrors,
    clearFieldError,
    setFieldValue,
    setValues: setValues,
    setIsSubmitting,

    // Helpers
    getFieldProps
  };
};

export default useFormValidation;