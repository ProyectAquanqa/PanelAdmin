import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { UniversalFilters, prepareDeviceFiltersConfig } from '../Common';

/**
 * Componente de filtros para Devices - USANDO UNIVERSALFILTERS
 * Mantiene exactamente el mismo diseño visual que KnowledgeBase usando el componente base reutilizable
 */
const DeviceFilters = ({
  searchTerm = '',
  onSearchChange,
  selectedType = '',
  onTypeChange,
  selectedStatus = '',
  onStatusChange,
  deviceTypes = [],
  onExportData,
  totalItems = 0
}) => {
  // Preparar configuración con datos dinámicos
  const filtersConfig = useMemo(() => {
    return prepareDeviceFiltersConfig(deviceTypes, {
      onExportData
    });
  }, [deviceTypes, onExportData]);

  // Estado actual de filtros
  const activeFilters = {
    searchTerm,
    selectedType,
    selectedStatus
  };

  // Manejar cambios de filtros
  const handleFilterChange = (filterKey, value) => {
    switch (filterKey) {
      case 'searchTerm':
        onSearchChange?.(value);
        break;
      case 'selectedType':
        onTypeChange?.(value);
        break;
      case 'selectedStatus':
        onStatusChange?.(value);
        break;
      default:
        break;
    }
  };

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    onSearchChange?.('');
    onTypeChange?.('');
    onStatusChange?.('');
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
      className="mb-6"
    />
  );
};

DeviceFilters.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  selectedType: PropTypes.string,
  onTypeChange: PropTypes.func,
  selectedStatus: PropTypes.string,
  onStatusChange: PropTypes.func,
  deviceTypes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ),
  onExportData: PropTypes.func,
  totalItems: PropTypes.number
};

export default DeviceFilters;
