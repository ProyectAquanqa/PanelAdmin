import React from 'react';

/**
 * Componente reutilizable para checkboxes en formularios
 * 
 * @param {Object} props
 * @param {string} props.name - Nombre del checkbox
 * @param {string} props.label - Etiqueta del checkbox
 * @param {Function} props.register - Función register de react-hook-form
 * @param {boolean} [props.isDark=false] - Indica si se está usando el tema oscuro
 * @param {string} [props.className=""] - Clases adicionales para el contenedor
 */
const FormCheckbox = ({
  name,
  label,
  register,
  isDark = false,
  className = "",
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="checkbox"
        id={name}
        {...register(name)}
        className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded
          ${isDark ? 'bg-gray-700 border-gray-600' : ''}`}
      />
      <label 
        htmlFor={name} 
        className={`ml-2 block text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
      >
        {label}
      </label>
    </div>
  );
};

export default FormCheckbox; 