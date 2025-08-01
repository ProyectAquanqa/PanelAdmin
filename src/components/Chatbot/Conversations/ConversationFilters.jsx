import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { UniversalFilters, prepareConversationFiltersConfig } from '../../Common';

/**
 * Componente de filtros para Conversations - REFACTORIZADO CON UNIVERSALFILTERS
 * Mantiene exactamente el mismo diseño visual usando el componente base reutilizable
 */
const ConversationFilters = ({
  searchTerm = '',
  onSearchChange,
  selectedUser = '',
  onUserChange,
  selectedStatus = '',
  onStatusChange,
  selectedDateRange = '',
  onDateRangeChange,
  selectedMatchType = '',
  onMatchTypeChange,
  totalItems = 0,
  onExport
}) => {
  // Preparar configuración con handlers dinámicos
  const filtersConfig = useMemo(() => {
    return prepareConversationFiltersConfig({
      onExport
    });
  }, [onExport]);

  // Estado actual de filtros
  const activeFilters = {
    searchTerm,
    selectedUser,
    selectedStatus,
    selectedDateRange,
    selectedMatchType
  };

  // Manejar cambios de filtros
  const handleFilterChange = (filterKey, value) => {
    switch (filterKey) {
      case 'searchTerm':
        onSearchChange?.(value);
        break;
      case 'selectedUser':
        onUserChange?.(value);
        break;
      case 'selectedStatus':
        onStatusChange?.(value);
        break;
      case 'selectedDateRange':
        onDateRangeChange?.(value);
        break;
      case 'selectedMatchType':
        onMatchTypeChange?.(value);
        break;
      default:
        break;
    }
  };

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    onSearchChange?.('');
    onUserChange?.('');
    onStatusChange?.('');
    onDateRangeChange?.('');
    onMatchTypeChange?.('');
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
      className=""
    />
  );
};

ConversationFilters.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  selectedUser: PropTypes.string,
  onUserChange: PropTypes.func,
  selectedStatus: PropTypes.string,
  onStatusChange: PropTypes.func,
  selectedDateRange: PropTypes.string,
  onDateRangeChange: PropTypes.func,
  selectedMatchType: PropTypes.string,
  onMatchTypeChange: PropTypes.func,
  totalItems: PropTypes.number,
  onExport: PropTypes.func
};

export default ConversationFilters;