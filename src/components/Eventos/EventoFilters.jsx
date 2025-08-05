import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { UniversalFilters } from '../Common/Filters';
import { prepareEventosFiltersConfig } from '../Common/Filters/configs/eventosFiltersConfig';

/**
 * Componente de filtros para Eventos - Basado en KnowledgeFilters
 * Mantiene exactamente el mismo diseño visual usando el componente base reutilizable
 */
const EventoFilters = ({
  searchTerm = '',
  onSearchChange,
  selectedCategory = '',
  onCategoryChange,
  selectedStatus = '',
  onStatusChange,
  selectedPinned = '',
  onPinnedChange,
  categories = [],
  onCreateNew,
  totalItems = 0
}) => {
  // Preparar configuración con datos dinámicos
  const filtersConfig = useMemo(() => {
    return prepareEventosFiltersConfig(categories, {
      onCreateNew
    });
  }, [categories, onCreateNew]);

  // Estado actual de filtros
  const activeFilters = {
    searchTerm,
    selectedCategory,
    selectedStatus,
    selectedPinned
  };

  // Manejar cambios de filtros
  const handleFilterChange = (filterKey, value) => {
    switch (filterKey) {
      case 'searchTerm':
        onSearchChange?.(value);
        break;
      case 'selectedCategory':
        onCategoryChange?.(value);
        break;
      case 'selectedStatus':
        onStatusChange?.(value);
        break;
      case 'selectedPinned':
        onPinnedChange?.(value);
        break;
      default:
        break;
    }
  };

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    onSearchChange?.('');
    onCategoryChange?.('');
    onStatusChange?.('');
    onPinnedChange?.('');
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

EventoFilters.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  selectedCategory: PropTypes.string,
  onCategoryChange: PropTypes.func,
  selectedStatus: PropTypes.string,
  onStatusChange: PropTypes.func,
  selectedPinned: PropTypes.string,
  onPinnedChange: PropTypes.func,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired
    })
  ),
  onCreateNew: PropTypes.func,
  totalItems: PropTypes.number
};

export default EventoFilters;