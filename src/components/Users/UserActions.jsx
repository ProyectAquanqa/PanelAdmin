/**
 * Componente de acciones para usuarios siguiendo el patrón KnowledgeBase
 * Diseño profesional con búsqueda, filtros y acciones integradas
 */

import React from 'react';
import PropTypes from 'prop-types';
import { CustomDropdown } from '../Common';

const UserActions = ({
  searchTerm = '',
  onSearchChange,
  selectedRole = '',
  onRoleChange,
  onCreateNew,
  onExport,
  onImport,
  groups = [],
  totalItems = 0,
  // Nuevo: modo formulario para reutilizar barra con botón volver
  isFormMode = false,
  onBack,
  formTitle = ''
}) => {
  // Todos los grupos disponibles (sin filtros por pestañas)
  const validGroups = React.useMemo(() => {
    // Validación defensiva - asegurar que groups sea un array
    return Array.isArray(groups) ? groups : [];
  }, [groups]);

  const handleSearchChange = (value) => {
    onSearchChange?.(value);
  };

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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 -mt-4 mb-6">
      <div className="space-y-4">
        {/* Búsqueda - Siempre en su propia línea */}
        <div className="w-full">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, DNI, email o código de empleado..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F]/30 transition-all bg-gray-50/30"
            />
          </div>
        </div>

        {/* Filtros y Acciones - Layout simplificado (2 columnas) */
        }
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Columna 1: Filtro de Perfil */}
          <div className="flex flex-col">
            <div className="text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">Perfil</div>
            <div className="flex-1 flex flex-col justify-end">
              <CustomDropdown
                value={selectedRole}
                onChange={onRoleChange}
                options={[
                  { value: '', label: 'Todos los perfiles' },
                  ...validGroups.map(group => ({ 
                    value: group.id?.toString(), 
                    label: group.nombre || group.name 
                  }))
                ]}
                placeholder="Seleccionar perfil..."
                className="h-[42px]"
                showIcon={true}
                iconComponent={
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
                optionTextSize="text-[13px]"
              />
            </div>
          </div>

          {/* Columna 2: Acciones */}
          <div className="flex flex-col">
            <div className="text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">Acciones</div>
            <div className="flex-1 flex flex-col justify-end">
              <div className="flex flex-wrap gap-2 h-[42px]">
                <button
                  onClick={onCreateNew}
                  className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-500 text-white text-[13px] font-medium rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500/20 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear
                </button>
                
                <button
                  onClick={onExport}
                  className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 text-slate-600 text-[13px] font-medium rounded-lg hover:bg-slate-200 cursor-pointer transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exportar
                </button>

                <label className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 text-slate-600 text-[13px] font-medium rounded-lg hover:bg-slate-200 cursor-pointer transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Importar
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={onImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Información de resultados y filtros */}
        <div className="flex flex-col gap-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-[13px] text-gray-600">
                <span className="font-bold">{totalItems}</span> {totalItems === 1 ? 'usuario' : 'usuarios'}
              </span>
              
              {/* Filtros activos - Al lado del contador */}
              {(searchTerm || selectedRole) && (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-gray-500">Filtros:</span>
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/10 text-blue-800 text-[13px] font-medium rounded-md">
                      "{searchTerm.length > 15 ? `${searchTerm.substring(0, 15)}...` : searchTerm}"
                    </span>
                  )}
                  {selectedRole && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/10 text-green-800 text-[13px] font-medium rounded-md">
                      {validGroups.find(g => g.id?.toString() === selectedRole)?.nombre || validGroups.find(g => g.id?.toString() === selectedRole)?.name || 'Perfil'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

UserActions.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  selectedRole: PropTypes.string,
  onRoleChange: PropTypes.func.isRequired,
  onCreateNew: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  groups: PropTypes.array,
  totalItems: PropTypes.number,
  isFormMode: PropTypes.bool,
  onBack: PropTypes.func,
  formTitle: PropTypes.string
};

export default UserActions;