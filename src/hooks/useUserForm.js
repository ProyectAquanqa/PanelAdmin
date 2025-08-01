/**
 * Hook para manejar formularios de Usuarios
 * Gestiona estado del formulario, validación y envío
 * Adaptado de useKnowledgeForm.js para usuarios
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { validateUserForm } from '../utils/validationUtils';

/**
 * Hook para manejar formularios de usuarios
 * @param {Object} initialData - Datos iniciales del formulario
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado y funciones para manejar el formulario
 */
export const useUserForm = (initialData = {}, options = {}) => {
  const {
    validateOnChange = false,
    validateOnBlur = true,
    resetOnSubmit = false,
    formType = 'user' // 'user', 'create', 'edit'
  } = options;

  // Referencia para rastrear los datos anteriores
  const prevInitialDataRef = useRef(null);

  // Detectar tipo de formulario basado en los datos iniciales
  const detectedFormType = useMemo(() => {
    if (formType !== 'user') return formType;
    // Si tiene 'id', es edición; si no, es creación
    if (initialData.id) return 'edit';
    return 'create';
  }, [initialData, formType]);

  // Datos iniciales por defecto según el tipo
  const defaultFormData = useMemo(() => {
    const baseData = {
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      groups: [],
      is_active: true,
      is_staff: false,
      ...initialData
    };

    if (detectedFormType === 'create') {
      // Para creación, incluir campos de registro
      return {
        ...baseData,
        password: '',
        confirmPassword: ''
      };
    }

    return baseData;
  }, [detectedFormType, initialData]);

  // Estado del formulario
  const [formData, setFormData] = useState(defaultFormData);
  
  // Sincronizar formData cuando cambien los datos iniciales
  useEffect(() => {
    // Solo sincronizar si realmente cambiaron los datos iniciales
    if (JSON.stringify(prevInitialDataRef.current) !== JSON.stringify(initialData)) {
      setFormData(defaultFormData);
      prevInitialDataRef.current = initialData;
    }
  }, [initialData, defaultFormData]);
  
  // Estado de errores
  const [errors, setErrors] = useState({});
  
  // Estado de campos tocados
  const [touched, setTouched] = useState({});
  
  // Estado de envío
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado de validación
  const validation = useMemo(() => {
    const formErrors = validateUserForm(formData, detectedFormType);
    const hasErrors = Object.keys(formErrors).length > 0;
    const touchedFields = Object.keys(touched);
    const hasTouchedErrors = touchedFields.some(field => formErrors[field]);

    return {
      hasErrors,
      hasTouchedErrors,
      isValid: !hasErrors,
      touchedErrors: Object.keys(formErrors).filter(field => touched[field])
    };
  }, [formData, touched, detectedFormType]);

  // Función para actualizar un campo
  const setFieldValue = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Validar al cambiar si está habilitado
    if (validateOnChange) {
      const fieldErrors = validateUserForm({ ...formData, [field]: value }, detectedFormType);
      if (fieldErrors[field]) {
        setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  }, [formData, validateOnChange, detectedFormType]);

  // Función para manejar cambios en inputs
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFieldValue(name, fieldValue);
  }, [setFieldValue]);

  // Función para manejar blur
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validar al perder foco si está habilitado
    if (validateOnBlur) {
      const fieldErrors = validateUserForm(formData, detectedFormType);
      if (fieldErrors[name]) {
        setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  }, [formData, validateOnBlur, detectedFormType]);

  // Función para manejar focus
  const handleFocus = useCallback((e) => {
    const { name } = e.target;
    // Limpiar error al hacer focus
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  // Función para validar el formulario completo
  const validateForm = useCallback(() => {
    const formErrors = validateUserForm(formData, detectedFormType);
    setErrors(formErrors);
    
    // Marcar todos los campos como tocados
    const allFields = Object.keys(defaultFormData);
    const touchedState = allFields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setTouched(touchedState);

    return Object.keys(formErrors).length === 0;
  }, [formData, defaultFormData, detectedFormType]);

  // Función para validar un campo específico
  const validateField = useCallback((fieldName) => {
    const formErrors = validateUserForm(formData, detectedFormType);
    const fieldError = formErrors[fieldName];
    
    if (fieldError) {
      setErrors(prev => ({ ...prev, [fieldName]: fieldError }));
      return false;
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return true;
    }
  }, [formData, detectedFormType]);

  // Función para manejar envío del formulario
  const handleSubmit = useCallback(async (onSubmit) => {
    if (isSubmitting) return { success: false };

    setIsSubmitting(true);

    try {
      // Validar formulario completo
      const isValid = validateForm();
      
      if (!isValid) {
        return { success: false, errors };
      }

      // Preparar datos para envío
      const dataToSubmit = { ...formData };
      
      // Para formularios de creación, manejar validación de contraseñas
      if (detectedFormType === 'create') {
        if (dataToSubmit.password !== dataToSubmit.confirmPassword) {
          setErrors(prev => ({ 
            ...prev, 
            confirmPassword: 'Las contraseñas no coinciden' 
          }));
          return { success: false };
        }
        // Remover confirmPassword antes de enviar
        delete dataToSubmit.confirmPassword;
      }

      // Convertir grupos a array si es string
      if (dataToSubmit.groups && typeof dataToSubmit.groups === 'string') {
        dataToSubmit.groups = [dataToSubmit.groups];
      }

      const result = await onSubmit(dataToSubmit);
      
      if (resetOnSubmit && result !== false) {
        resetForm();
      }

      return { success: result !== false };
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting, validateForm, errors, detectedFormType, resetOnSubmit]);

  // Funciones de control
  const setFieldError = useCallback((field, error) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetForm = useCallback(() => {
    setFormData(defaultFormData);
    setErrors({});
    setTouched({});
  }, [defaultFormData]);

  const setFormDataValues = useCallback((newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  }, []);

  // Utilidades para props de inputs (solo props HTML válidas)
  const getInputProps = useCallback((fieldName, extraProps = {}) => {
    return {
      name: fieldName,
      value: formData[fieldName] || '',
      onChange: handleChange,
      onBlur: handleBlur,
      onFocus: handleFocus,
      ...extraProps
    };
  }, [formData, errors, handleChange, handleBlur, handleFocus]);

  const getCheckboxProps = useCallback((fieldName, extraProps = {}) => {
    return {
      name: fieldName,
      checked: !!formData[fieldName],
      onChange: handleChange,
      onBlur: handleBlur,
      onFocus: handleFocus,
      ...extraProps
    };
  }, [formData, errors, handleChange, handleBlur, handleFocus]);

  const getSelectProps = useCallback((fieldName, extraProps = {}) => {
    return {
      name: fieldName,
      value: formData[fieldName] || '',
      onChange: handleChange,
      onBlur: handleBlur,
      onFocus: handleFocus,
      ...extraProps
    };
  }, [formData, errors, handleChange, handleBlur, handleFocus]);

  // Estadísticas del formulario
  const stats = useMemo(() => {
    const totalFields = Object.keys(defaultFormData).length;
    const filledFields = Object.values(formData).filter(value => 
      value !== '' && value !== null && value !== undefined
    ).length;
    const errorCount = Object.keys(errors).length;
    const touchedCount = Object.keys(touched).length;

    return {
      totalFields,
      filledFields,
      errorCount,
      touchedCount,
      completion: totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0
    };
  }, [formData, errors, touched, defaultFormData]);

  // Estado computado
  const isValid = useMemo(() => {
    return validation.isValid && Object.keys(errors).length === 0;
  }, [validation.isValid, errors]);

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(defaultFormData);
  }, [formData, defaultFormData]);

  // Retornar estado y funciones
  return {
    // Estado del formulario
    formData,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    formType: detectedFormType,
    
    // Funciones de manejo
    handleChange,
    handleBlur,
    handleFocus,
    handleSubmit,
    
    // Funciones de control
    setFieldValue,
    setFieldError,
    clearFieldError,
    clearErrors,
    resetForm,
    setFormDataValues,
    
    // Funciones de validación
    validateForm,
    validateField,
    validation,
    
    // Utilidades
    getInputProps,
    getCheckboxProps,
    getSelectProps,
    
    // Estadísticas
    stats,
    
    // Configuración
    config: {
      validateOnChange,
      validateOnBlur,
      resetOnSubmit
    }
  };
};

export default useUserForm;