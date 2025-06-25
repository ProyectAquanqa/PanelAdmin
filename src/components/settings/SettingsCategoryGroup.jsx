import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import SettingField from './SettingField';

/**
 * Componente para mostrar configuraciones agrupadas por categoría
 */
const SettingsCategoryGroup = ({ 
  title, 
  settings = [], 
  onUpdateSetting,
  defaultExpanded = true
}) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  // Convertir el título a formato legible
  const formatTitle = (title) => {
    return title
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Obtener icono según la categoría
  const getCategoryIcon = () => {
    const categoryIcons = {
      hospital_info: '🏥',
      schedule: '🕒',
      appointments: '📅',
      payments: '💰',
      system: '⚙️',
      chatbot: '🤖',
      emergency: '🚨'
    };
    
    return categoryIcons[title.toLowerCase()] || '📋';
  };
  
  return (
    <div className={`rounded-lg overflow-hidden ${
      theme === 'dark' 
        ? 'bg-neutral-900 border border-neutral-800' 
        : 'bg-gray-50 border border-gray-200'
    } shadow-sm`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex justify-between items-center p-4 ${
          theme === 'dark' 
            ? 'bg-neutral-800 hover:bg-neutral-700' 
            : 'bg-white hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center">
          <span className="text-xl mr-2">{getCategoryIcon()}</span>
          <h2 className={`text-lg font-medium ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {formatTitle(title)}
          </h2>
          <span className={`ml-2 text-xs font-medium px-2 py-1 rounded-full ${
            theme === 'dark' 
              ? 'bg-neutral-700 text-neutral-300' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {settings.length}
          </span>
        </div>
        
        {isExpanded ? (
          <ChevronUpIcon className={`h-5 w-5 ${
            theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
          }`} />
        ) : (
          <ChevronDownIcon className={`h-5 w-5 ${
            theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
          }`} />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {settings.map(setting => (
            <SettingField
              key={setting.id}
              setting={setting}
              onUpdate={onUpdateSetting}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SettingsCategoryGroup; 