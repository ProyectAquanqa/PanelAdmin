// components/common/FormField.jsx
import React from 'react';

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
const FormField = ({
  name,
  label,
  register,
  errors = {},
  type = "text",
  className = "",
  isDark = false,
  placeholder = "",
  children,
  error,
}) => {
  // Determinar el mensaje de error (puede venir directo o a través del objeto errors)
  const errorMessage = error || (errors[name]?.message);
  
  return (
    <div className={className}>
      <label 
        htmlFor={name} 
        className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
      >
        {label}
      </label>
      <div className="mt-1">
        {children ? (
          children
        ) : (
          <input
            type={type}
            id={name}
            placeholder={placeholder}
            {...(register ? register(name) : {})}
            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md
              ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
          />
        )}
        {errorMessage && (
          <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

export default FormField;