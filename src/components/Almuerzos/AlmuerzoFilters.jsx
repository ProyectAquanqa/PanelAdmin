import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { UniversalFilters } from '../Common/Filters';
import { prepareAlmuerzosFiltersConfig } from '../Common/Filters/configs/almuerzosFiltersConfig';

/**
 * Componente de filtros para Almuerzos - COPIADO EXACTAMENTE DE KnowledgeFilters
 * Mantiene exactamente el mismo diseño visual usando el componente base reutilizable
 */
const AlmuerzoFilters = ({
  searchTerm = '',
  onSearchChange,
  selectedStatus = '',
  onStatusChange,
  selectedDateRange = '',
  onDateRangeChange,
  selectedDiet = '',
  onDietChange,
  onCreateNew,
  totalItems = 0
}) => {
  // Preparar configuración con datos dinámicos
  const filtersConfig = useMemo(() => {
    return prepareAlmuerzosFiltersConfig({
      onCreateNew
    });
  }, [onCreateNew]);

  // Estado actual de filtros
  const activeFilters = {
    searchTerm: searchTerm || '',
    selectedStatus: selectedStatus || '',
    selectedDateRange: selectedDateRange || '',
    selectedDiet: selectedDiet || ''
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
      case 'selectedDateRange':
        onDateRangeChange?.(value);
        break;
      case 'selectedDiet':
        onDietChange?.(value);
        break;
      default:
        break;
    }
  };

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    onSearchChange?.('');
    onStatusChange?.('');
    onDateRangeChange?.('');
    onDietChange?.('');
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

AlmuerzoFilters.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  selectedStatus: PropTypes.string,
  onStatusChange: PropTypes.func,
  selectedDateRange: PropTypes.string,
  onDateRangeChange: PropTypes.func,
  selectedDiet: PropTypes.string,
  onDietChange: PropTypes.func,
  onCreateNew: PropTypes.func,
  totalItems: PropTypes.number
};

export default AlmuerzoFilters;
