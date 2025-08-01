/**
 * Hook para manejar formularios de Knowledge Base
 * Gestiona estado del formulario, validación y envío
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { validateKnowledgeForm, validateCategoryForm } from '../utils/validationUtils';

/**
 * Hook para manejar formularios de conocimiento y categorías
 * @param {Object} initialData - Datos iniciales del formulario
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado y funciones para manejar el formulario
 */
export const useKnowledgeForm = (initialData = {}, options = {}) => {
  const {
    validateOnChange = false,
    validateOnBlur = true,
    resetOnSubmit = false,
    formType = 'knowledge' // 'knowledge' o 'category'
  } = options;

  // Referencia para rastrear los datos anteriores
  const prevInitialDataRef = useRef(null);

  // Detectar tipo de formulario basado en los datos iniciales
  const detectedFormType = useMemo(() => {
    if (formType !== 'knowledge') return formType;
    // Si tiene 'name' pero no 'question', es probablemente una categoría
    if (initialData.name !== undefined && initialData.question === undefined) {
      return 'category';
    }
    return 'knowledge';
  }, [initialData, formType]);

  // Datos iniciales por defecto según el tipo
  const defaultFormData = useMemo(() => {
    if (detectedFormType === 'category') {
      return {
        name: '',
        description: '',
        is_active: true,
        ...initialData
      };
    }
    return {
      question: '',
      answer: '',
      category: '',
      keywords: '',
      is_active: true,
      ...initialData
    };
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
  
  // Estado de si el formulario ha sido enviado
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Actualizar formulario cuando initialData cambie (para edición)
  useEffect(() => {
    const prevData = prevInitialDataRef.current;
    
    // Verificar si initialData realmente cambió
    if (!prevData || JSON.stringify(prevData) !== JSON.stringify(initialData)) {
      const mappedCategory = initialData.category 
        ? (typeof initialData.category === 'object' ? initialData.category.id : initialData.category)
        : '';
      
      const newFormData = {
        question: '',
        answer: '',
        category: '',
        keywords: '',
        is_active: true,
        ...initialData,
        // Mapear categoría correctamente: si viene como objeto, extraer solo el ID
        category: mappedCategory
      };
      
      setFormData(newFormData);
      // Limpiar errores y touched cuando se cambia a edición
      setErrors({});
      setTouched({});
      setHasSubmitted(false);
      
      // Actualizar referencia
      prevInitialDataRef.current = { ...initialData };
    }
  }, [initialData]);

  // Validar formulario completo
  const validateForm = useCallback(() => {
    return detectedFormType === 'knowledge' ? validateKnowledgeForm(formData) : validateCategoryForm(formData);
  }, [formData, detectedFormType]);

  // Validar campo específico
  const validateField = useCallback((fieldName, value) => {
    const tempData = { ...formData, [fieldName]: value };
    const validation = detectedFormType === 'knowledge' ? validateKnowledgeForm(tempData) : validateCategoryForm(tempData);
    
    return {
      isValid: !validation.errors[fieldName],
      error: validation.errors[fieldName] || null
    };
  }, [formData, detectedFormType]);

  // Estado de validación del formulario (memoizado)
  const validation = useMemo(() => {
    return validateForm();
  }, [validateForm]);

  // Verificar si el formulario es válido
  const isValid = validation.isValid;

  // Verificar si el formulario ha cambiado
  const hasChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(defaultFormData);
  }, [formData, defaultFormData]);

  // Manejar cambios en los campos
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Validar en tiempo real si está habilitado
    if (validateOnChange || (hasSubmitted && touched[name])) {
      const fieldValidation = validateField(name, fieldValue);
      setErrors(prev => ({
        ...prev,
        [name]: fieldValidation.error
      }));
    }
  }, [validateOnChange, hasSubmitted, touched, validateField]);

  // Manejar blur de campos
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validar en blur si está habilitado
    if (validateOnBlur || hasSubmitted) {
      const fieldValidation = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: fieldValidation.error
      }));
    }
  }, [validateOnBlur, hasSubmitted, validateField]);

  // Manejar focus de campos
  const handleFocus = useCallback((e) => {
    const { name } = e.target;
    
    // Limpiar error del campo cuando recibe focus
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [errors]);

  // Establecer valor de campo específico
  const setFieldValue = useCallback((fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Validar si es necesario
    if (validateOnChange || (hasSubmitted && touched[fieldName])) {
      const fieldValidation = validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldValidation.error
      }));
    }
  }, [validateOnChange, hasSubmitted, touched, validateField]);

  // Establecer error de campo específico
  const setFieldError = useCallback((fieldName, error) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, []);

  // Limpiar error de campo específico
  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: null
    }));
  }, []);

  // Limpiar todos los errores
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Resetear formulario
  const resetForm = useCallback((newData = defaultFormData) => {
    setFormData(newData);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setHasSubmitted(false);
  }, [defaultFormData]);

  // Establecer datos del formulario
  const setFormDataValues = useCallback((newData) => {
    setFormData(prev => ({
      ...prev,
      ...newData
    }));
  }, []);

  // Manejar envío del formulario
  const handleSubmit = useCallback(async (onSubmit) => {
    setHasSubmitted(true);
    setIsSubmitting(true);

    // Validar formulario completo
    const formValidation = validateForm();
    
    if (!formValidation.isValid) {
      setErrors(formValidation.errors);
      setIsSubmitting(false);
      return { success: false, errors: formValidation.errors };
    }

    try {
      // Preparar datos para envío
      const dataToSubmit = {
        ...formData,
        // Convertir categoría a número entero o null
        category: formData.category ? parseInt(formData.category, 10) : null
      };

      const result = await onSubmit(dataToSubmit);
      
      if (resetOnSubmit && result !== false) {
        resetForm();
      }
      
      setIsSubmitting(false);
      return { success: true, data: result };
      
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setIsSubmitting(false);
      
      // Si el error tiene información de validación del servidor
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      
      return { success: false, error: error.message };
    }
  }, [formData, validateForm, resetOnSubmit, resetForm]);

  // Obtener props para input - versión limpia sin warnings
  const getInputProps = useCallback((fieldName) => {
    return {
      name: fieldName,
      value: formData[fieldName] || '',
      onChange: handleChange,
      onBlur: handleBlur,
      onFocus: handleFocus
    };
  }, [formData, handleChange, handleBlur, handleFocus]);



  // Obtener props para checkbox
  const getCheckboxProps = useCallback((fieldName) => {
    return {
      name: fieldName,
      checked: Boolean(formData[fieldName]),
      onChange: handleChange,
      onBlur: handleBlur,
      onFocus: handleFocus
    };
  }, [formData, handleChange, handleBlur, handleFocus]);

  // Estadísticas del formulario
  const stats = useMemo(() => {
    const totalFields = Object.keys(defaultFormData).length;
    const filledFields = Object.values(formData).filter(value => 
      value !== '' && value !== null && value !== undefined
    ).length;
    const touchedFields = Object.keys(touched).length;
    const errorFields = Object.keys(errors).filter(key => errors[key]).length;

    return {
      totalFields,
      filledFields,
      touchedFields,
      errorFields,
      completionPercentage: Math.round((filledFields / totalFields) * 100),
      hasErrors: errorFields > 0
    };
  }, [defaultFormData, formData, touched, errors]);

  return {
    // Datos del formulario
    formData,
    errors,
    touched,
    
    // Estados
    isValid,
    hasChanges,
    isSubmitting,
    hasSubmitted,
    
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

export default useKnowledgeForm;