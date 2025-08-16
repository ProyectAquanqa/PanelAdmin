import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { UniversalFilters } from '../Common/Filters';
import { prepareCargoFiltersConfig } from '../Common/Filters/configs/cargosFiltersConfig';

/**
 * Componente de acciones integradas: búsqueda, filtros y acciones principales para Cargos
 * Ahora usa UniversalFilters para consistencia con eventos y áreas
 */
const CargoActions = ({
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
  // Preparar configuración con datos dinámicos
  const filtersConfig = useMemo(() => {
    return prepareCargoFiltersConfig({
      onCreateNew,
      onExport
    });
  }, [onCreateNew, onExport]);

  // Estado actual de filtros
  const activeFilters = {
    searchTerm,
    selectedStatus,
    dateRange_start: selectedDateRange?.start || '',
    dateRange_end: selectedDateRange?.end || ''
  };

  // Manejar cambios de filtros
  const handleFilterChange = (filterKey, value) => {
    switch (filterKey) {
      case 'searchTerm':
        onSearchChange?.(value);
        break;
      case 'selectedStatus':
        onStatusChange?.(value);
        break;
      case 'dateRange_start':
        onDateRangeChange?.({ 
          ...selectedDateRange, 
          start: value 
        });
        break;
      case 'dateRange_end':
        onDateRangeChange?.({ 
          ...selectedDateRange, 
          end: value 
        });
        break;
      default:
        break;
    }
  };

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    onSearchChange?.('');
    onStatusChange?.('');
    onDateRangeChange?.(null);
    onClearFilters?.();
  };

  return (
    <UniversalFilters
      searchConfig={filtersConfig.searchConfig}
      filterGroups={filtersConfig.filterGroups}
      actions={filtersConfig.actions}
      activeFilters={activeFilters}
      onFilterChange={handleFilterChange}
      onClearFilters={handleClearFilters}
      totalItems={totalItems}
      itemLabel={filtersConfig.itemLabel}
      className="-mt-4 mb-6"
    />
  );
};

CargoActions.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  selectedStatus: PropTypes.string,
  onStatusChange: PropTypes.func,
  selectedDateRange: PropTypes.shape({
    start: PropTypes.string,
    end: PropTypes.string
  }),
  onDateRangeChange: PropTypes.func,
  onCreateNew: PropTypes.func,
  onExport: PropTypes.func,
  totalItems: PropTypes.number,
  onClearFilters: PropTypes.func
};

export default CargoActions;
