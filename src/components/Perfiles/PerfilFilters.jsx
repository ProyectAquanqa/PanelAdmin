/**
 * Componente de filtros para perfiles
 * Utiliza el sistema UniversalFilters para consistencia
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { UniversalFilters } from '../Common';

const PerfilFilters = ({
  searchTerm = '',
  onSearchChange,
  selectedTipoAcceso = '',
  onTipoAccesoChange,
  selectedTipoPerfil = '',
  onTipoPerfilChange,
  selectedEstado = '',
  onEstadoChange,
  onCreateNew,
  onExport,
  totalItems = 0
}) => {
  // Configuración de filtros
  const filtersConfig = useMemo(() => {
    return {
      searchConfig: {
        key: 'searchTerm',
        placeholder: 'Buscar por nombre o descripción...',
        variant: 'default'
      },
      
      filterGroups: [
        {
          key: 'selectedTipoAcceso',
          title: 'Tipo de Acceso',
          type: 'dropdown',
          options: [
            { value: '', label: 'Todos los accesos' },
            { value: 'WEB', label: 'Solo Web' },
            { value: 'MOVIL', label: 'Solo Móvil' },
            { value: 'AMBOS', label: 'Web y Móvil' }
          ],
          placeholder: 'Seleccionar acceso...',
          showIcon: true,
          iconPath: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
        },
        {
          key: 'selectedTipoPerfil',
          title: 'Tipo de Perfil',
          type: 'dropdown',
          options: [
            { value: '', label: 'Todos los tipos' },
            { value: 'admin', label: 'Administrativo' },
            { value: 'worker', label: 'Trabajador' }
          ],
          placeholder: 'Seleccionar tipo...',
          showIcon: true,
          iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
        },
        {
          key: 'selectedEstado',
          title: 'Estado',
          type: 'buttons',
          options: [
            { value: '', label: 'Todos' },
            { value: 'active', label: 'Activos' },
            { value: 'inactive', label: 'Inactivos' }
          ]
        }
      ],
      
      actions: [
        {
          label: 'Crear',
          variant: 'primary',
          icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
          onClick: onCreateNew
        },
        {
          label: 'Exportar',
          variant: 'secondary',
          icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
          onClick: onExport
        }
      ],
      
      itemLabel: 'perfiles'
    };
  }, [onCreateNew, onExport]);

  // Estado actual de filtros
  const activeFilters = {
    searchTerm,
    selectedTipoAcceso,
    selectedTipoPerfil,
    selectedEstado
  };

  // Manejar cambios de filtros
  const handleFilterChange = (filterKey, value) => {
    switch (filterKey) {
      case 'searchTerm':
        onSearchChange?.(value);
        break;
      case 'selectedTipoAcceso':
        onTipoAccesoChange?.(value);
        break;
      case 'selectedTipoPerfil':
        onTipoPerfilChange?.(value);
        break;
      case 'selectedEstado':
        onEstadoChange?.(value);
        break;
      default:
        break;
    }
  };

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    onSearchChange?.('');
    onTipoAccesoChange?.('');
    onTipoPerfilChange?.('');
    onEstadoChange?.('');
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

PerfilFilters.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  selectedTipoAcceso: PropTypes.string,
  onTipoAccesoChange: PropTypes.func,
  selectedTipoPerfil: PropTypes.string,
  onTipoPerfilChange: PropTypes.func,
  selectedEstado: PropTypes.string,
  onEstadoChange: PropTypes.func,
  onCreateNew: PropTypes.func,
  onExport: PropTypes.func,
  totalItems: PropTypes.number
};

export default PerfilFilters;