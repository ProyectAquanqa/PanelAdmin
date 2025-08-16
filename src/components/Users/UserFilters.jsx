import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { UniversalFilters, prepareUserFiltersConfig } from '../Common';

/**
 * Componente de filtros para Usuarios - SIGUIENDO PATRÓN DE KNOWLEDGEFILTERS
 * Mantiene exactamente el mismo diseño visual usando el componente base reutilizable
 */
const UserFilters = ({
  searchTerm = '',
  onSearchChange,
  selectedRole = '',
  onRoleChange,
  selectedDateRange = null,
  onDateRangeChange,
  roles = [],
  onCreateNew,
  onExport,
  onImport,
  totalItems = 0
}) => {
  // Preparar configuración con datos dinámicos
  const filtersConfig = useMemo(() => {
    return prepareUserFiltersConfig(roles, {
      onCreateNew,
      onExport,
      onImport
    });
  }, [roles, onCreateNew, onExport, onImport]);

  // Estado actual de filtros
  const activeFilters = {
    searchTerm,
    selectedRole,
    dateRange_start: selectedDateRange?.start || '',
    dateRange_end: selectedDateRange?.end || ''
  };

  // Manejar cambios de filtros
  const handleFilterChange = (filterKey, value) => {
    switch (filterKey) {
      case 'searchTerm':
        onSearchChange?.(value);
        break;
      case 'selectedRole':
        onRoleChange?.(value);
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
    onRoleChange?.('');
    onDateRangeChange?.(null);
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

UserFilters.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  selectedRole: PropTypes.string,
  onRoleChange: PropTypes.func,
  selectedDateRange: PropTypes.object,
  onDateRangeChange: PropTypes.func,
  roles: PropTypes.array,
  onCreateNew: PropTypes.func,
  onExport: PropTypes.func,
  onImport: PropTypes.func,
  totalItems: PropTypes.number
};

export default UserFilters;