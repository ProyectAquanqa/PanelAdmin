/**
 * Componente de acciones integradas para categorías - REFACTORIZADO CON UNIVERSALFILTERS
 * Mantiene exactamente el mismo diseño visual usando el componente base reutilizable
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { UniversalFilters, prepareCategoryFiltersConfig } from '../../Common';

/**
 * Barra de acciones con filtros integrados para categorías
 */
const CategoryActions = ({
  searchTerm = '',
  onSearchChange,
  selectedStatus = '',
  onStatusChange,
  sortOrder = '',
  onSortOrderChange,
  onCreateNew,
  onExport,
  totalItems = 0,
  loading
}) => {
  // Preparar configuración con handlers dinámicos
  const filtersConfig = useMemo(() => {
    return prepareCategoryFiltersConfig({
      onCreateNew,
      onExport
    });
  }, [onCreateNew, onExport]);

  // Estado actual de filtros
  const activeFilters = {
    searchTerm,
    selectedStatus,
    sortOrder
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
      case 'sortOrder':
        onSortOrderChange?.(value);
        break;
      default:
        break;
    }
  };

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    onSearchChange?.('');
    onStatusChange?.('');
    onSortOrderChange?.('');
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
      loading={loading}
    />
  );
};

CategoryActions.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  selectedStatus: PropTypes.string,
  onStatusChange: PropTypes.func.isRequired,
  sortOrder: PropTypes.string,
  onSortOrderChange: PropTypes.func.isRequired,
  onCreateNew: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  totalItems: PropTypes.number,
  loading: PropTypes.bool
};

export default CategoryActions; 