import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { UniversalFilters } from '../Common/Filters';
import { prepareComentariosFiltersConfig } from '../Common/Filters/configs/comentariosFiltersConfig';

/**
 * Componente de filtros para Comentarios - Basado en EventoFilters
 * Mantiene exactamente el mismo diseño visual usando el componente base reutilizable
 */
const ComentarioFilters = ({
  searchTerm = '',
  onSearchChange,
  selectedEvento = '',
  onEventoChange,
  selectedUsuario = '',
  onUsuarioChange,
  selectedDateRange = { start: '', end: '' },
  onDateRangeChange,
  eventos = [],
  usuarios = [],
  totalItems = 0
}) => {
  // Preparar configuración con datos dinámicos
  const filtersConfig = useMemo(() => {
    return prepareComentariosFiltersConfig(eventos, usuarios, {});
  }, [eventos, usuarios]);

  // Estado actual de filtros
  const activeFilters = {
    searchTerm,
    selectedEvento,
    selectedUsuario,
    dateRange_start: selectedDateRange?.start || '',
    dateRange_end: selectedDateRange?.end || ''
  };

  // Manejar cambios de filtros
  const handleFilterChange = (filterKey, value) => {
    switch (filterKey) {
      case 'searchTerm':
        onSearchChange?.(value);
        break;
      case 'selectedEvento':
        onEventoChange?.(value);
        break;
      case 'selectedUsuario':
        onUsuarioChange?.(value);
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
    onEventoChange?.('');
    onUsuarioChange?.('');
    onDateRangeChange?.({ start: '', end: '' });
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

ComentarioFilters.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  selectedEvento: PropTypes.string,
  onEventoChange: PropTypes.func,
  selectedUsuario: PropTypes.string,
  onUsuarioChange: PropTypes.func,
  selectedDateRange: PropTypes.shape({
    start: PropTypes.string,
    end: PropTypes.string
  }),
  onDateRangeChange: PropTypes.func,
  eventos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      titulo: PropTypes.string.isRequired,
      comentarios_count: PropTypes.number
    })
  ),
  usuarios: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      username: PropTypes.string,
      full_name: PropTypes.string
    })
  ),
  totalItems: PropTypes.number
};

export default ComentarioFilters;
