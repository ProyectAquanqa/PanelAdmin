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

  selectedDateRange = { start: '', end: '' },
  onDateRangeChange,
  totalItems = 0,
  onExport,
  uniqueUsers = []
}) => {
  // Preparar configuración con handlers dinámicos y usuarios únicos
  const filtersConfig = useMemo(() => {
    const userOptions = [
      { value: '', label: 'Todos los usuarios' },
      ...uniqueUsers.map(user => ({
        value: user.username,
        label: user.full_name !== user.username ? `${user.full_name} (${user.username})` : user.username
      }))
    ];

    return {
      searchConfig: {
        key: 'searchTerm',
        placeholder: 'Buscar conversaciones, usuarios, preguntas o respuestas...',
        variant: 'simple'
      },
      filterGroups: [
        {
          key: 'selectedUser',
          title: 'Usuario',
          type: 'dropdown',
          options: userOptions,
          placeholder: 'Seleccionar usuario...',
          showIcon: true,
          iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
          className: 'h-[42px]',
          containerClass: 'min-w-0 w-full sm:w-auto sm:min-w-[200px] transition-all duration-300'
        },

        {
          key: 'dateRange',
          title: 'Fecha',
          type: 'dateRange',
          placeholder: 'Seleccionar fechas...',
          showIcon: true,
          iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
          className: 'h-[42px]',
          responsive: {
            mobile: 'w-full',
            tablet: 'w-full sm:w-auto',
            desktop: 'w-auto'
          },
          containerClass: 'min-w-0 w-full sm:w-auto sm:min-w-[200px] lg:min-w-[240px] xl:min-w-[280px] transition-all duration-300 ease-in-out'
        }
      ],
      actions: [
        {
          label: 'Exportar',
          variant: 'primary',
          icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
          onClick: onExport
        }
      ],
      itemLabel: 'conversaciones encontradas'
    };
  }, [uniqueUsers, onExport]);

  // Estado actual de filtros
  const activeFilters = {
    searchTerm,
    selectedUser,
    dateRange_start: selectedDateRange?.start || '',
    dateRange_end: selectedDateRange?.end || ''
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
    onUserChange?.('');
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
      className=""
    />
  );
};

ConversationFilters.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  selectedUser: PropTypes.string,
  onUserChange: PropTypes.func,

  selectedDateRange: PropTypes.shape({
    start: PropTypes.string,
    end: PropTypes.string
  }),
  onDateRangeChange: PropTypes.func,
  totalItems: PropTypes.number,
  onExport: PropTypes.func,
  uniqueUsers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    username: PropTypes.string,
    full_name: PropTypes.string,
    email: PropTypes.string
  }))
};

export default ConversationFilters;