import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { UniversalFilters } from '../Common/Filters';

/**
 * Componente de filtros para Categorías - Basado en KnowledgeFilters
 * Mantiene exactamente el mismo diseño visual usando el componente base reutilizable
 */
const CategoriaFilters = ({
  searchTerm = '',
  onSearchChange,
  onCreateNew,
  totalItems = 0
}) => {
  // Preparar configuración simple para categorías
  const filtersConfig = useMemo(() => {
    return {
      searchConfig: {
        key: 'searchTerm',
        placeholder: 'Buscar categorías por nombre o descripción...',
        variant: 'default'
      },
      filterGroups: [], // Sin filtros adicionales para categorías
      actions: [
        {
          label: 'Crear Categoría',
          variant: 'primary',
          icon: 'M12 4v16m8-8H4',
          onClick: onCreateNew
        }
      ],
      itemLabel: 'categorías'
    };
  }, [onCreateNew]);

  // Estado actual de filtros
  const activeFilters = {
    searchTerm
  };

  // Manejar cambios de filtros
  const handleFilterChange = (filterKey, value) => {
    if (filterKey === 'searchTerm') {
      onSearchChange?.(value);
    }
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    onSearchChange?.('');
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

CategoriaFilters.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  onCreateNew: PropTypes.func,
  totalItems: PropTypes.number
};

export default CategoriaFilters;