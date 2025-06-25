// components/common/FormField.jsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const FormField = ({ label, error, children, icon: Icon }) => {
  const { theme } = useTheme();
  
  return (
    <div>
      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'}`}>
        {label}
      </label>
      <div className="mt-1 relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className={`h-5 w-5 ${theme === 'dark' ? 'text-neutral-500' : 'text-gray-400'}`} />
          </div>
        )}
        {children}
      </div>
      {error && (
        <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;