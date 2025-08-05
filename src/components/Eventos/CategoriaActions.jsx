/**
 * Componente de acciones integradas para categorías de eventos - COPIADO DEL CHATBOT
 * Mantiene exactamente el mismo diseño visual usando el componente base reutilizable
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { UniversalFilters } from '../Common';
import { prepareEventCategoryFiltersConfig } from '../Common/Filters/configs/categoryFiltersConfig';

/**
 * Barra de acciones con filtros integrados para categorías de eventos
 */
const CategoriaActions = ({
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
    return prepareEventCategoryFiltersConfig({
      onCreateNew,
      onExport
    });
  }, [onCreateNew, onExport]);

  // Estado actual de filtros simplificados
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

CategoriaActions.propTypes = {
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

export default CategoriaActions;