import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ValidationMessage from './ValidationMessage';
import { validateField } from '../../utils/validationUtils';

/**
 * Componente de campo de formulario con validación automática integrada
 * Combina input, label, validación y mensajes de error en un solo componente
 */
const FormField = ({
  name,
  type = 'text',
  label,
  value = '',
  onChange,
  onBlur,
  validation = {},
  required = false,
  placeholder = '',
  className = '',
  inputClassName = '',
  labelClassName = '',
  disabled = false,
  autoComplete,
  showValidationOnChange = true,
  showValidationOnBlur = true,
  ...inputProps
}) => {
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // Validar campo cuando cambia el valor o las reglas de validación
  useEffect(() => {
    if (touched && (showValidationOnChange || showValidationOnBlur)) {
      validateCurrentField();
    }
  }, [value, validation, touched, showValidationOnChange, showValidationOnBlur]);

  const validateCurrentField = () => {
    const validationResult = validateField(value, validation, name);
    setError(validationResult.error);
    setIsValid(validationResult.isValid);
    return validationResult;
  };

  const handleChange = (e) => {
    // Llamar onChange del padre si existe
    if (onChange) {
      onChange(e);
    }

    // Validar en tiempo real si está habilitado y el campo ya fue tocado
    if (touched && showValidationOnChange) {
      // Usar setTimeout para validar después de que el estado se actualice
      setTimeout(() => {
        validateCurrentField();
      }, 0);
    }
  };

  const handleBlur = (e) => {
    setTouched(true);
    
    // Llamar onBlur del padre si existe
    if (onBlur) {
      onBlur(e);
    }

    // Validar al perder el foco si está habilitado
    if (showValidationOnBlur) {
      setTimeout(() => {
        validateCurrentField();
      }, 0);
    }
  };

  // Determinar estilos del input según el estado
  const getInputStyles = () => {
    const baseStyles = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm';
    
    if (error && touched) {
      return `${baseStyles} border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500`;
    }
    
    if (isValid && touched && value) {
      return `${baseStyles} border-green-300 focus:border-green-500 focus:ring-green-500`;
    }
    
    return baseStyles;
  };

  // Determinar estilos del label
  const getLabelStyles = () => {
    const baseStyles = 'block text-sm font-medium mb-1';
    
    if (error && touched) {
      return `${baseStyles} text-red-700`;
    }
    
    return `${baseStyles} text-gray-700`;
  };

  return (
    <div className={`${className}`}>
      {label && (
        <label 
          htmlFor={name}
          className={`${getLabelStyles()} ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          required={required}
          className={`${getInputStyles()} ${inputClassName}`}
          aria-invalid={error && touched ? 'true' : 'false'}
          aria-describedby={error && touched ? `${name}-error` : undefined}
          data-testid={`form-field-${name}`}
          {...inputProps}
        />
        
        {/* Icono de validación */}
        {touched && value && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {isValid && !error ? (
              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : error ? (
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : null}
          </div>
        )}
      </div>
      
      {/* Mensaje de validación */}
      <ValidationMessage 
        error={error}
        field={name}
        show={touched && !!error}
      />
    </div>
  );
};

FormField.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  validation: PropTypes.object,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  disabled: PropTypes.bool,
  autoComplete: PropTypes.string,
  showValidationOnChange: PropTypes.bool,
  showValidationOnBlur: PropTypes.bool
};

export default FormField;