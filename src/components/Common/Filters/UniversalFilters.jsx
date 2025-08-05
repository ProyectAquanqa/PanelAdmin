/**
 * Componente Universal de Filtros
 * Elimina la duplicación de código entre KnowledgeFilters, CategoryActions y ConversationFilters
 */

import React from 'react';
import PropTypes from 'prop-types';
import { CustomDropdown } from '../';

/**
 * Componente base reutilizable para todos los filtros del sistema
 */
const UniversalFilters = ({
  // Configuración de búsqueda
  searchConfig,
  
  // Grupos de filtros
  filterGroups = [],
  
  // Acciones disponibles
  actions = [],
  
  // Estado actual de filtros
  activeFilters = {},
  
  // Callbacks
  onFilterChange,
  onClearFilters,
  
  // Información de resultados
  totalItems = 0,
  itemLabel = 'elementos',
  
  // Configuración adicional
  className = '',
  loading = false
}) => {
  /**
   * Maneja el cambio de cualquier filtro
   */
  const handleFilterChange = (filterKey, value) => {
    onFilterChange?.(filterKey, value);
  };

  /**
   * Renderiza la barra de búsqueda con mejor responsive
   */
  const renderSearchBar = () => {
    if (!searchConfig) return null;

    return (
      <div className="w-full max-w-none">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={searchConfig.placeholder || 'Buscar...'}
            value={activeFilters[searchConfig.key] || ''}
            onChange={(e) => handleFilterChange(searchConfig.key, e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-[13px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F]/30 transition-all ${
              searchConfig.variant === 'simple' ? 'rounded-lg' : 'bg-gray-50/30'
            } placeholder:text-gray-400`}
          />
        </div>
      </div>
    );
  };

  /**
   * Renderiza un grupo de filtros tipo botones con mejor responsive
   */
  const renderButtonGroup = (group) => {
    return (
      <div className="flex flex-col h-full">
        <div className="text-[12px] sm:text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">
          {group.title}
        </div>
        <div className="flex-1 flex flex-col justify-end">
          <div className={`grid gap-1 bg-gray-50 rounded-lg min-h-[42px] ${
            group.options.length === 2 ? 'grid-cols-2' : 
            group.options.length === 3 ? 'grid-cols-3' : 
            'grid-cols-2 sm:grid-cols-4'
          }`}>
            {group.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange(group.key, option.value)}
                className={`px-2 py-2 text-[11px] sm:text-[13px] font-medium rounded-md transition-all flex items-center justify-center min-h-[38px] ${
                  activeFilters[group.key] === option.value
                    ? 'bg-slate-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span className="truncate">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renderiza un grupo de filtros tipo dropdown con mejor responsive
   */
  const renderDropdownGroup = (group) => {
    return (
      <div className="space-y-2 w-full h-full flex flex-col">
        <label className="text-[12px] sm:text-[13px] font-semibold text-gray-700 uppercase tracking-wider">
          {group.title}
        </label>
        <div className="flex-1 flex flex-col justify-end">
          <CustomDropdown
            value={activeFilters[group.key] || ''}
            onChange={(value) => handleFilterChange(group.key, value)}
            options={group.options}
            placeholder={group.placeholder || `Seleccionar ${group.title.toLowerCase()}...`}
            showIcon={group.showIcon}
            iconComponent={group.iconComponent}
            optionTextSize="text-[12px] sm:text-[13px]"
            className={`${group.className || ''} w-full`}
          />
        </div>
      </div>
    );
  };

  /**
   * Renderiza un grupo de filtros tipo rango de fechas con mejor responsive
   */
  const renderDateRangeGroup = (group) => {
    return (
      <div className="space-y-2 w-full h-full flex flex-col">
        <label className="text-[12px] sm:text-[13px] font-semibold text-gray-700 uppercase tracking-wider">
          {group.title}
        </label>
        <div className="relative flex-1 flex flex-col justify-end">
          <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:items-center p-3 border border-gray-300 rounded-lg bg-white min-h-[42px]">
            {group.showIcon && (
              <svg className="w-4 h-4 text-gray-400 hidden sm:block sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={group.iconPath} />
              </svg>
            )}
            <div className="flex flex-col gap-2 sm:gap-2 sm:flex-row sm:items-center w-full">
              <div className="flex flex-col sm:flex-1">
                <label className="text-[11px] text-gray-500 mb-1 sm:hidden">Desde</label>
                <input
                  type="date"
                  placeholder="Desde"
                  value={activeFilters[group.key]?.from || ''}
                  className="w-full text-[12px] sm:text-[13px] border-none outline-none bg-transparent"
                  onChange={(e) => handleFilterChange(group.key, { ...(activeFilters[group.key] || {}), from: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-center">
                <span className="text-gray-400 text-[12px] sm:text-[13px] px-2">-</span>
              </div>
              <div className="flex flex-col sm:flex-1">
                <label className="text-[11px] text-gray-500 mb-1 sm:hidden">Hasta</label>
                <input
                  type="date"
                  placeholder="Hasta"
                  value={activeFilters[group.key]?.to || ''}
                  className="w-full text-[12px] sm:text-[13px] border-none outline-none bg-transparent"
                  onChange={(e) => handleFilterChange(group.key, { ...(activeFilters[group.key] || {}), to: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renderiza las acciones disponibles con mejor responsive
   */
  const renderActions = () => {
    if (!actions.length) return null;

    return (
      <div className="flex flex-col h-full">
        <div className="text-[12px] sm:text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">
          Acciones
        </div>
        <div className="flex-1 flex flex-col justify-end">
          <div className="flex flex-col sm:flex-row gap-2 min-h-[42px]">
            {actions.map((action, index) => (
              action.isFileInput ? (
                <label
                  key={index}
                  className={`flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-[12px] sm:text-[13px] font-medium rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    action.variant === 'primary' 
                      ? 'bg-slate-500 text-white hover:bg-slate-600 focus:ring-slate-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 focus:ring-slate-500/20'
                  } focus:outline-none focus:ring-2`}
                >
                  {action.icon && (
                    <svg className="w-3.5 h-3.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                    </svg>
                  )}
                  <span className="truncate">{action.label}</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={action.onChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <button
                  key={index}
                  onClick={action.onClick}
                  disabled={loading || action.disabled}
                  className={`flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-[12px] sm:text-[13px] font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    action.variant === 'primary' 
                      ? 'bg-slate-500 text-white hover:bg-slate-600 focus:ring-slate-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 focus:ring-slate-500/20'
                  } focus:outline-none focus:ring-2`}
                >
                  {action.icon && (
                    <svg className="w-3.5 h-3.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                    </svg>
                  )}
                  <span className="truncate">{action.label}</span>
                </button>
              )
            ))}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renderiza los filtros activos
   */
  const renderActiveFilters = () => {
    const hasActiveFilters = Object.values(activeFilters).some(value => value && value !== '');
    
    if (!hasActiveFilters) return null;

    return (
      <div className="flex items-center gap-2">
        <span className="text-[13px] text-gray-500">Filtros:</span>
        {Object.entries(activeFilters).map(([key, value]) => {
          if (!value || value === '') return null;
          
          // Buscar la configuración del filtro para obtener el label
          const filterGroup = filterGroups.find(group => group.key === key);
          let displayValue = value;
          
          if (filterGroup && filterGroup.options) {
            const option = filterGroup.options.find(opt => opt.value === value);
            displayValue = option ? option.label : value;
          }
          
          // Para búsqueda, mostrar el término truncado
          if (key === searchConfig?.key) {
            displayValue = `"${value.length > 15 ? `${value.substring(0, 15)}...` : value}"`;
          }
          
          // Para rango de fechas, mostrar formato especial
          if (typeof value === 'object' && (value.from || value.to)) {
            const fromStr = value.from ? new Date(value.from).toLocaleDateString() : '';
            const toStr = value.to ? new Date(value.to).toLocaleDateString() : '';
            displayValue = `${fromStr} - ${toStr}`.replace(/^-\s/, '').replace(/\s-$/, '');
            if (!displayValue.trim()) return null;
          }

          return (
            <span 
              key={key} 
              className={`inline-flex items-center gap-1 px-2 py-1 text-[13px] font-medium rounded-md ${
                key === searchConfig?.key 
                  ? 'bg-blue-900/10 text-blue-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {key !== searchConfig?.key && (
                <div className="w-1 h-1 rounded-full bg-slate-500"></div>
              )}
              {displayValue}
            </span>
          );
        })}
      </div>
    );
  };

  /**
   * Calcula la distribución responsiva óptima del grid
   */
  const getGridLayout = () => {
    const totalFilters = filterGroups.length;
    const hasActions = actions.length > 0;
    const totalItems = totalFilters + (hasActions ? 1 : 0);
    
    // Configuración inteligente basada en el contenido real
    if (totalItems <= 2) {
      return 'grid-cols-1 md:grid-cols-2 gap-4 md:gap-6';
    } else if (totalItems === 3) {
      return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6';
    } else if (totalItems === 4) {
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4';
    } else {
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 lg:gap-4';
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="space-y-5 sm:space-y-6">
          {/* Barra de búsqueda */}
          {renderSearchBar()}

          {/* Filtros y Acciones - Grid inteligente y responsive */}
          {(filterGroups.length > 0 || actions.length > 0) && (
            <div className={`grid ${getGridLayout()}`}>
              {/* Renderizar grupos de filtros */}
              {filterGroups.map((group, index) => (
                <div key={index} className="min-w-0 w-full flex flex-col h-full">
                  {group.type === 'buttons' 
                    ? renderButtonGroup(group) 
                    : group.type === 'dateRange'
                    ? renderDateRangeGroup(group)
                    : renderDropdownGroup(group)
                  }
                </div>
              ))}
              
              {/* Renderizar acciones - Ocupando toda la altura disponible */}
              {actions.length > 0 && (
                <div className="min-w-0 w-full flex flex-col justify-end h-full">
                  {renderActions()}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Información de resultados y filtros activos */}
        <div className="border-t border-gray-100 pt-4 sm:pt-5 mt-5 sm:mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <span className="text-[12px] sm:text-[13px] text-gray-600 whitespace-nowrap">
                <span className="font-bold">{totalItems}</span> {itemLabel}
              </span>
              {renderActiveFilters()}
            </div>

            {/* Botón limpiar filtros */}
            {Object.values(activeFilters).some(value => value && value !== '') && (
              <button
                onClick={onClearFilters}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-600 text-[12px] sm:text-[13px] font-medium rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500/20 cursor-pointer transition-all w-full sm:w-auto sm:min-w-[120px] shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

UniversalFilters.propTypes = {
  searchConfig: PropTypes.shape({
    key: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    variant: PropTypes.oneOf(['default', 'simple'])
  }),
  filterGroups: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['buttons', 'dropdown', 'dateRange']).isRequired,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired
        })
      ), // Removido .isRequired - no es obligatorio para dateRange
      placeholder: PropTypes.string,
      showIcon: PropTypes.bool,
      iconComponent: PropTypes.node,
      className: PropTypes.string
    })
  ),
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      variant: PropTypes.oneOf(['primary', 'secondary']),
      icon: PropTypes.string,
      disabled: PropTypes.bool
    })
  ),
  activeFilters: PropTypes.object,
  onFilterChange: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
  totalItems: PropTypes.number,
  itemLabel: PropTypes.string,
  className: PropTypes.string,
  loading: PropTypes.bool
};

export default UniversalFilters;