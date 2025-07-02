import React from 'react';

/**
 * Componente reutilizable para campos select en formularios
 * 
 * @param {Object} props
 * @param {string} props.name - Nombre del campo
 * @param {string} props.label - Etiqueta del campo
 * @param {Function} props.register - Función register de react-hook-form
 * @param {Object} props.errors - Objeto errors de react-hook-form
 * @param {Array} props.options - Array de opciones [{value: string, label: string}]
 * @param {string} [props.className=""] - Clases adicionales para el contenedor
 * @param {boolean} [props.isDark=false] - Indica si se está usando el tema oscuro
 * @param {string} [props.placeholder=""] - Placeholder para el select
 */
const FormSelect = ({
  name,
  label,
  register,
  errors,
  options = [],
  className = "",
  isDark = false,
  placeholder = "Seleccione una opción",
}) => {
  return (
    <div className={className}>
      <label 
        htmlFor={name} 
        className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
      >
        {label}
      </label>
      <div className="mt-1">
        <select
          id={name}
          {...register(name)}
          className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md
            ${isDark ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors[name] && (
          <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>
        )}
      </div>
    </div>
  );
};

export default FormSelect; 