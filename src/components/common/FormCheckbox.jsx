import React, { forwardRef } from 'react';

/**
 * Componente reutilizable para checkboxes en formularios
 * 
 * @param {Object} props
 * @param {string} props.name - Nombre del checkbox
 * @param {string} props.label - Etiqueta del checkbox (opcional si se pasa children)
 * @param {Function} [props.register] - Función register de react-hook-form
 * @param {boolean} [props.isDark=false] - Indica si se está usando el tema oscuro
 * @param {string} [props.className=""] - Clases adicionales para el contenedor
 * @param {React.ReactNode} [props.children] - Contenido para la etiqueta
 * @param {Function} [props.onChange] - Manejador para el cambio de estado
 * @param {boolean} [props.checked] - Estado del checkbox
 */
const FormCheckbox = forwardRef(({
  name,
  label,
  register,
  isDark = false,
  className = "",
  children,
  onChange,
  checked,
  ...props
}, ref) => {
  const registerProps = register ? register(name) : {};

  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="checkbox"
        id={name}
        ref={ref}
        onChange={onChange || registerProps.onChange}
        checked={checked}
        {...registerProps}
        {...props}
        className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded
          ${isDark ? 'bg-gray-700 border-gray-600' : ''}`}
      />
      <label 
        htmlFor={name} 
        className={`ml-2 block text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
      >
        {children || label}
      </label>
    </div>
  );
});

FormCheckbox.displayName = 'FormCheckbox';

export default FormCheckbox; 