/**
 * Componente de acciones para perfiles - REFACTORIZADO CON UNIVERSALFILTERS
 * Mantiene exactamente el mismo diseño visual usando el componente base reutilizable
 * Compatible con Django Groups (Perfiles del sistema)
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { UniversalFilters, prepareProfileFiltersConfig } from '../Common';

const ProfileActions = ({
  searchTerm = '',
  onSearchChange,
  selectedGroup = '',
  onGroupChange,
  groups = [],
  onCreateNew,
  onExport,
  onImport,
  totalItems = 0,
  loading = false
}) => {
  // Preparar configuración con handlers dinámicos y grupos del backend
  const filtersConfig = useMemo(() => {
    const handlers = {
      onCreateNew,
      onExport,
      onImport
    };

    return prepareProfileFiltersConfig(groups, handlers);
  }, [groups, onCreateNew, onExport, onImport]);

  // Estado actual de filtros  
  const activeFilters = {
    searchTerm,
    selectedGroup
  };

  // Manejar cambios de filtros
  const handleFilterChange = (filterKey, value) => {
    switch (filterKey) {
      case 'searchTerm':
        onSearchChange?.(value);
        break;
      case 'selectedGroup':
        onGroupChange?.(value);
        break;
      default:
        break;
    }
  };

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    onSearchChange?.('');
    onGroupChange?.('');
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

ProfileActions.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  selectedGroup: PropTypes.string,
  onGroupChange: PropTypes.func.isRequired,
  groups: PropTypes.arrayOf(PropTypes.object),
  onCreateNew: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  totalItems: PropTypes.number,
  loading: PropTypes.bool
};

export default ProfileActions;