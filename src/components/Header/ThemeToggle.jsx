/**
 * Componente de toggle de tema oscuro/claro
 * Permite cambiar entre modo claro y oscuro
 */

import React from 'react';
import PropTypes from 'prop-types';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

/**
 * Componente de toggle de tema
 */
const ThemeToggle = ({ 
  isDarkMode, 
  onToggle, 
  className = "" 
}) => {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-full hover:bg-[#2D728F]/10 dark:hover:bg-[#2D728F]/20 transition-colors ${className}`}
      aria-label={isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDarkMode ? (
        <SunIcon className="w-5 h-5 text-yellow-500" />
      ) : (
        <MoonIcon className="w-5 h-5 text-[#2D728F]" />
      )}
    </button>
  );
};

ThemeToggle.propTypes = {
  isDarkMode: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default React.memo(ThemeToggle);