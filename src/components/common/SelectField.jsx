// components/common/SelectField.jsx
import React from 'react';

const SelectField = React.forwardRef(({ options, placeholder, icon: Icon, darkMode, ...props }, ref) => {
  return (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className={`h-5 w-5 ${darkMode ? 'text-neutral-500' : 'text-gray-400'}`} />
        </div>
      )}
      <select
        ref={ref}
        {...props}
        className={`block w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border rounded-md focus:ring-primary-600 focus:border-primary-600 sm:text-sm transition-colors
          ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'border-gray-300 text-gray-900'}`}
      >
        {placeholder && (
          <option value="" disabled className={darkMode ? 'bg-neutral-800' : ''}>
            {placeholder}
          </option>
        )}
        {options && options.map(option => (
          <option 
            key={option.id} 
            value={option.id}
            className={darkMode ? 'bg-neutral-800' : ''}
          >
            {option.name || option.full_name}
          </option>
        ))}
      </select>
    </div>
  );
});

SelectField.displayName = 'SelectField';

export default SelectField;