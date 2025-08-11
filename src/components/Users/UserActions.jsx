/**
 * Componente de acciones para usuarios - REFACTORIZADO CON UNIVERSALFILTERS
 * Mantiene exactamente el mismo diseño visual usando el componente base reutilizable
 * Compatible con el sistema de permisos dinámicos de AquanQ
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { UniversalFilters, prepareUserFiltersConfig } from '../Common';

const UserActions = ({
  searchTerm = '',
  onSearchChange,
  selectedGroup = '',
  onGroupChange,
  onCreateNew,
  onExport,
  onImport,
  groups = [],
  totalItems = 0,
  userPermissions = {},
  // Modo formulario para reutilizar barra con botón volver
  isFormMode = false,
  onBack,
  formTitle = ''
}) => {
  // Vista compacta cuando estamos en formulario inline (reutilizable)
  if (isFormMode) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 -mt-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-2 text-[13px] rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a la lista
          </button>

          <div className="text-sm text-slate-500">
            {formTitle || 'Formulario de usuario'}
          </div>
        </div>
      </div>
    );
  }

  // Preparar configuración con datos dinámicos y permisos
  const filtersConfig = useMemo(() => {
    const handlers = {
      onCreateNew: userPermissions.canCreate ? onCreateNew : null,
      onExport: userPermissions.canExport ? onExport : null,
      onImport: userPermissions.canImport ? onImport : null
    };

    return prepareUserFiltersConfig(groups, handlers);
  }, [groups, userPermissions, onCreateNew, onExport, onImport]);

  // Estado actual de filtros  
  const activeFilters = {
    searchTerm,
    selectedRole: selectedGroup // Mapeo para coincidir con la config
  };

  // Manejar cambios de filtros
  const handleFilterChange = (filterKey, value) => {
    switch (filterKey) {
      case 'searchTerm':
        onSearchChange?.(value);
        break;
      case 'selectedRole':
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
      actions={filtersConfig.actions.filter(action => action.onClick !== null)} // Solo mostrar acciones con permisos
      activeFilters={activeFilters}
      onFilterChange={handleFilterChange}
      onClearFilters={handleClearFilters}
      totalItems={totalItems}
      itemLabel={filtersConfig.itemLabel}
      className="-mt-4 mb-6"
    />
  );
};

UserActions.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  selectedGroup: PropTypes.string,
  onGroupChange: PropTypes.func.isRequired,
  onCreateNew: PropTypes.func,
  onExport: PropTypes.func,
  onImport: PropTypes.func,
  groups: PropTypes.array,
  totalItems: PropTypes.number,
  userPermissions: PropTypes.shape({
    canView: PropTypes.bool,
    canCreate: PropTypes.bool,
    canEdit: PropTypes.bool,
    canDelete: PropTypes.bool,
    canExport: PropTypes.bool,
    canImport: PropTypes.bool,
    canViewStats: PropTypes.bool,
    canManage: PropTypes.bool
  }),
  // Para modo formulario
  isFormMode: PropTypes.bool,
  onBack: PropTypes.func,
  formTitle: PropTypes.string
};

export default UserActions;