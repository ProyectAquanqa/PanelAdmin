/**
 * Componente de barra de búsqueda del header
 * Proporciona funcionalidad de búsqueda global
 */

import React from 'react';
import PropTypes from 'prop-types';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

/**
 * Componente de barra de búsqueda
 */
const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  placeholder = "Buscar...",
  className = "" 
}) => {
  return (
    <div className={`hidden md:block flex-1 max-w-xl mx-4 ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MagnifyingGlassIcon className="w-5 h-5 text-neutral-400" />
        </div>
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg 
                   bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-[#2D728F]/70 transition-colors"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};

SearchBar.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

export default React.memo(SearchBar);