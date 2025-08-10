/**
 * Componente de filtro de rango de fechas responsive y consciente del sidebar
 */
import React from 'react';
import PropTypes from 'prop-types';

const DateRangeFilter = ({ 
  group, 
  activeFilters, 
  onFilterChange,
  sidebarExpanded = false 
}) => {
  return (
    <div className={`flex flex-col space-y-2 ${group.containerClass || ''}`}>
      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
        {group.showIcon && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={group.iconPath} />
          </svg>
        )}
        {group.title}
      </label>
      <div className={`
        flex gap-2 transition-all duration-300 ease-in-out
        ${sidebarExpanded ? 'flex-col sm:flex-row' : 'flex-row'}
        ${group.responsive?.mobile || ''} 
        ${group.responsive?.tablet || ''} 
        ${group.responsive?.desktop || ''}
      `}>
        <input
          type="date"
          value={activeFilters[`${group.key}_start`] || ''}
          onChange={(e) => onFilterChange(`${group.key}_start`, e.target.value)}
          className={`
            px-3 py-2 border border-slate-300 rounded-lg text-sm 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
            transition-all duration-300 min-w-0 flex-1
            ${group.className || ''}
            ${sidebarExpanded ? 'w-full sm:w-auto' : 'w-auto'}
          `}
          placeholder={typeof group.placeholder === 'object' ? group.placeholder.start : 'Fecha inicio'}
        />
        <input
          type="date"
          value={activeFilters[`${group.key}_end`] || ''}
          onChange={(e) => onFilterChange(`${group.key}_end`, e.target.value)}
          className={`
            px-3 py-2 border border-slate-300 rounded-lg text-sm 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
            transition-all duration-300 min-w-0 flex-1
            ${group.className || ''}
            ${sidebarExpanded ? 'w-full sm:w-auto' : 'w-auto'}
          `}
          placeholder={typeof group.placeholder === 'object' ? group.placeholder.end : 'Fecha fin'}
        />
      </div>
    </div>
  );
};

DateRangeFilter.propTypes = {
  group: PropTypes.object.isRequired,
  activeFilters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  sidebarExpanded: PropTypes.bool
};

export default DateRangeFilter;