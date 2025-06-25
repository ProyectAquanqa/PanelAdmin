// components/common/SelectField.jsx
import React from 'react';

const SelectField = ({ options, value, onChange, disabled, placeholder, icon: Icon, darkMode }) => {
  return (
    <select
      value={value || ''}
      onChange={onChange}
      disabled={disabled}
      className={`block w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border rounded-md focus:ring-primary-600 focus:border-primary-600 sm:text-sm transition-colors
        ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'border-gray-300 text-gray-900'}`}
    >
      <option value="" className={darkMode ? 'bg-neutral-800' : ''}>
        {placeholder}
      </option>
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
  );
};

export default SelectField;