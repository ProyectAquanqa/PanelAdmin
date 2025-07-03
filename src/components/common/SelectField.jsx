// components/common/SelectField.jsx
import React from 'react';

const SelectField = React.forwardRef(({ 
  label, 
  options = [], 
  error, 
  darkMode, 
  icon: Icon, 
  placeholder,
  isLoading,
  ...props 
}, ref) => {
  return (
    <div>
      {label && <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{label}</label>}
      <div className="relative mt-1">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />}
        <select
          {...props}
          ref={ref}
          className={`block w-full rounded-md border-0 py-2.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset ${Icon ? 'pl-10' : 'pl-3'} pr-10 ${
            darkMode 
              ? 'bg-neutral-700 text-white ring-neutral-600 focus:ring-primary-500' 
              : 'bg-white text-gray-900 ring-gray-300 focus:ring-primary-600'
          } ${error ? 'ring-red-500' : ''}`}
        >
          <option value="">{isLoading ? 'Cargando...' : placeholder || 'Seleccione una opción'}</option>
          {!isLoading && options.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error.message}</p>}
    </div>
  );
});

export default SelectField;