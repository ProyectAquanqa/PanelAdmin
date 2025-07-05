// components/common/FormField.jsx
import React, { forwardRef } from 'react';

/**
 * Componente reutilizable para campos de formulario
 * 
 * @param {Object} props
 * @param {string} props.name - Nombre del campo
 * @param {string} props.label - Etiqueta del campo
 * @param {Function} props.register - Función register de react-hook-form
 * @param {Object} props.errors - Objeto errors de react-hook-form
 * @param {string} [props.type="text"] - Tipo de input
 * @param {string} [props.className=""] - Clases adicionales para el contenedor
 * @param {boolean} [props.isDark=false] - Indica si se está usando el tema oscuro
 * @param {string} [props.placeholder=""] - Placeholder para el input
 * @param {React.ReactNode} [props.children] - Contenido adicional para el campo
 * @param {string} [props.error] - Mensaje de error directo (alternativa a errors[name].message)
 */
const FormField = forwardRef(({
  label,
  type = "text",
  className = "",
  isDark = false,
  placeholder = "",
  error,
  children,
  ...fieldProps // Captura el resto de las props (value, onChange, onBlur, name, etc.)
}, ref) => {
  const errorMessage = error?.message || (typeof error === 'string' ? error : null);

  const inputClasses = `px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md
    ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`;

  return (
    <div className={className}>
      <label 
        htmlFor={fieldProps.name}
        className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
      >
        {label}
      </label>
      <div className="mt-1">
        {children ? (
          React.cloneElement(children, { ...fieldProps, ref, className: `${children.props.className || ''} ${inputClasses}` })
        ) : (
          <input
            id={fieldProps.name}
            type={type}
            placeholder={placeholder}
            ref={ref}
            {...fieldProps} // Pasa todas las props de react-hook-form al input
            className={inputClasses}
          />
        )}
        {errorMessage && (
          <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
        )}
      </div>
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;