/**
 * Componente de filtros para Areas
 * Siguiendo el patrón de UserFilters para consistencia
 */

import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { UniversalFilters } from '../Common/Filters';

const AreaFilters = ({
  searchTerm = '',
  onSearchChange,
  selectedStatus = '',
  onStatusChange,
  selectedDateRange = null,
  onDateRangeChange,
  onCreateNew,
  onExport,
  totalItems = 0,
  onClearFilters
}) => {
  
  // Configuración de filtros específica para areas
  const filtersConfig = useMemo(() => ({
    // Configuración de búsqueda
    searchConfig: {
      key: 'searchTerm',
      placeholder: 'Buscar areas por nombre o descripción...',
      variant: 'default'
    },

    // Grupos de filtros
    filterGroups: [
      {
        key: 'selectedStatus',
        title: 'Estado',
        type: 'buttons',
        options: [
          { value: '', label: 'Todos', isDefault: true },
          { value: 'true', label: 'Activos', color: 'green' },
          { value: 'false', label: 'Inactivos', color: 'red' }
        ],
        showIcon: true,
        iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        className: 'h-[42px]'
      },
      {
        key: 'dateRange',
        title: 'Fecha de Creación',
        type: 'dateRange',
        placeholder: 'Seleccionar fechas...',
        showIcon: true,
        iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
        className: 'h-[42px]',
        responsive: {
          mobile: 'w-full',
          tablet: 'w-auto',
          desktop: 'w-auto'
        },
        containerClass: 'min-w-0 max-w-[240px] lg:max-w-[280px] xl:max-w-[320px] transition-all duration-300 ease-in-out'
      }
    ],

    // Acciones disponibles
    actions: [
      {
        key: 'create',
        label: 'Nueva Área',
        variant: 'primary',
        icon: 'M12 4v16m8-8H4',
        onClick: onCreateNew
      },
      {
        key: 'export',
        label: 'Exportar',
        variant: 'secondary',
        icon: 'M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z',
        onClick: onExport
      }
    ],

    // Configuración adicional
    itemLabel: 'areas'
  }), [onCreateNew, onExport]);

  // Estado actual de filtros
  const activeFilters = {
    searchTerm,
    selectedStatus,
    dateRange_start: selectedDateRange?.start || '',
    dateRange_end: selectedDateRange?.end || ''
  };

  // Manejar cambios en filtros
  const handleFilterChange = useCallback((filterKey, value) => {
    switch (filterKey) {
      case 'searchTerm':
        onSearchChange?.(value);
        break;
      case 'selectedStatus':
        onStatusChange?.(value);
        break;
      case 'dateRange_start':
      case 'dateRange_end':
        const currentRange = selectedDateRange || {};
        const newRange = {
          ...currentRange,
          [filterKey.replace('dateRange_', '')]: value
        };
        onDateRangeChange?.(newRange);
        break;
      default:
        console.warn(`Filtro no reconocido: ${filterKey}`);
    }
  }, [onSearchChange, onStatusChange, onDateRangeChange, selectedDateRange]);

  // Limpiar filtros
  const handleClearFilters = useCallback(() => {
    onSearchChange?.('');
    onStatusChange?.('');
    onDateRangeChange?.(null);
    onClearFilters?.();
  }, [onSearchChange, onStatusChange, onDateRangeChange, onClearFilters]);

  return (
    <UniversalFilters
      {...filtersConfig}
      activeFilters={activeFilters}
      totalItems={totalItems}
      onFilterChange={handleFilterChange}
      onClearFilters={handleClearFilters}
    />
  );
};

AreaFilters.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  selectedStatus: PropTypes.string,
  onStatusChange: PropTypes.func,
  selectedDateRange: PropTypes.object,
  onDateRangeChange: PropTypes.func,
  onCreateNew: PropTypes.func,
  onExport: PropTypes.func,
  totalItems: PropTypes.number,
  onClearFilters: PropTypes.func
};

export default AreaFilters;
