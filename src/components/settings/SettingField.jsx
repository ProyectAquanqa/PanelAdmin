import React, { useState } from 'react';
import { 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';

/**
 * Componente para editar un campo de configuración
 */
const SettingField = ({ 
  setting, 
  onUpdate, 
  disabled = false 
}) => {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(setting.setting_value);
  const [error, setError] = useState('');
  
  // Determinar el tipo de input según el tipo de dato
  const getInputType = () => {
    switch (setting.data_type) {
      case 'INTEGER':
        return 'number';
      case 'BOOLEAN':
        return 'checkbox';
      default:
        return 'text';
    }
  };
  
  // Manejar cambio de valor
  const handleChange = (e) => {
    const newValue = setting.data_type === 'BOOLEAN' 
      ? e.target.checked.toString() 
      : e.target.value;
    setValue(newValue);
    setError('');
  };
  
  // Validar valor
  const validateValue = () => {
    if (setting.data_type === 'INTEGER') {
      try {
        parseInt(value);
        return true;
      } catch (error) {
        setError('El valor debe ser un número entero');
        return false;
      }
    }
    
    if (setting.data_type === 'JSON') {
      try {
        JSON.parse(value);
        return true;
      } catch (error) {
        setError('El valor debe ser un JSON válido');
        return false;
      }
    }
    
    return true;
  };
  
  // Guardar cambios
  const handleSave = () => {
    if (!validateValue()) {
      return;
    }
    
    onUpdate(setting.id, { setting_value: value });
    setIsEditing(false);
  };
  
  // Cancelar edición
  const handleCancel = () => {
    setValue(setting.setting_value);
    setIsEditing(false);
    setError('');
  };
  
  // Renderizar valor según el tipo de dato
  const renderValue = () => {
    if (setting.data_type === 'BOOLEAN') {
      const boolValue = setting.typed_value;
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          boolValue 
            ? `${theme === 'dark' ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800'}` 
            : `${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-800'}`
        }`}>
          {boolValue ? 'Activado' : 'Desactivado'}
        </span>
      );
    }
    
    if (setting.data_type === 'JSON') {
      try {
        const jsonValue = typeof setting.typed_value === 'object' 
          ? JSON.stringify(setting.typed_value, null, 2) 
          : setting.setting_value;
        return (
          <pre className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} overflow-auto max-h-24`}>
            {jsonValue}
          </pre>
        );
      } catch (error) {
        return setting.setting_value;
      }
    }
    
    return setting.setting_value;
  };
  
  // Renderizar input según el tipo de dato
  const renderInput = () => {
    if (setting.data_type === 'BOOLEAN') {
      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={value === 'true' || value === '1'}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm">
            {value === 'true' || value === '1' ? 'Activado' : 'Desactivado'}
          </span>
        </div>
      );
    }
    
    if (setting.data_type === 'JSON') {
      return (
        <textarea
          value={value}
          onChange={handleChange}
          rows={4}
          className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
            theme === 'dark' 
              ? 'bg-neutral-800 border-neutral-700 text-white' 
              : 'border-gray-300'
          }`}
        />
      );
    }
    
    return (
      <input
        type={getInputType()}
        value={value}
        onChange={handleChange}
        className={`block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
          theme === 'dark' 
            ? 'bg-neutral-800 border-neutral-700 text-white' 
            : 'border-gray-300'
        }`}
      />
    );
  };
  
  return (
    <div className={`p-4 rounded-lg ${
      theme === 'dark' 
        ? 'bg-neutral-800 border border-neutral-700' 
        : 'bg-white border border-gray-200'
    } shadow-sm`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className={`text-sm font-medium ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {setting.setting_key}
          </h3>
          {setting.description && (
            <div className="flex items-center mt-1">
              <QuestionMarkCircleIcon className={`h-4 w-4 ${
                theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
              } mr-1`} />
              <p className={`text-xs ${
                theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
              }`}>
                {setting.description}
              </p>
            </div>
          )}
        </div>
        
        {setting.is_editable && !disabled && (
          <div>
            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <CheckIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center p-1 border border-gray-300 rounded-full shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className={`inline-flex items-center p-1 border rounded-full shadow-sm ${
                  theme === 'dark'
                    ? 'border-neutral-600 bg-neutral-700 hover:bg-neutral-600'
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
              >
                <PencilIcon className={`h-4 w-4 ${
                  theme === 'dark' ? 'text-neutral-300' : 'text-gray-500'
                }`} />
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-2">
        <div className={`text-sm ${theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'}`}>
          {isEditing ? renderInput() : renderValue()}
        </div>
        
        {error && (
          <p className="mt-1 text-xs text-red-600">
            {error}
          </p>
        )}
        
        {setting.category && (
          <div className="mt-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              theme === 'dark' 
                ? 'bg-blue-900/20 text-blue-400 border border-blue-500/20' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {setting.category}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingField; 