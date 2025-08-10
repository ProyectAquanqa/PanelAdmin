/**
 * Componente de acciones para perfiles siguiendo el patrón KnowledgeBase
 * Diseño profesional con búsqueda, filtros y acciones integradas
 */

import React from 'react';
import PropTypes from 'prop-types';

const ProfileActions = ({
  searchTerm = '',
  onSearchChange,
  selectedType = '',
  onTypeChange,
  onCreateNew,
  onExport,
  onImport,
  totalItems = 0,
  loading = false
}) => {
  const handleSearchChange = (value) => {
    onSearchChange?.(value);
  };

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
              placeholder="Buscar por nombre, descripción o tipo de acceso..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F]/30 transition-all bg-gray-50/30"
            />
          </div>
        </div>

        {/* Filtros y Acciones - Layout simplificado (2 columnas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Columna 1: Filtro de Tipo */}
          <div className="flex flex-col">
            <div className="text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">Tipo de Perfil</div>
            <div className="flex-1 flex flex-col justify-end">
              <div className="grid grid-cols-3 gap-1 bg-gray-50 rounded-lg h-[42px]">
                <button
                  onClick={() => onTypeChange?.('')}
                  className={`px-2 text-[13px] font-medium rounded-md transition-all flex items-center justify-center h-full ${
                    selectedType === '' 
                      ? 'bg-slate-500 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => onTypeChange?.('admin')}
                  className={`px-2 text-[13px] font-medium rounded-md transition-all flex items-center justify-center h-full ${
                    selectedType === 'admin' 
                      ? 'bg-slate-500 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Admin
                </button>
                <button
                  onClick={() => onTypeChange?.('worker')}
                  className={`px-2 text-[13px] font-medium rounded-md transition-all flex items-center justify-center h-full ${
                    selectedType === 'worker' 
                      ? 'bg-slate-500 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Worker
                </button>
              </div>
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
                    accept=".json,.csv"
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
                <span className="font-bold">{totalItems}</span> {totalItems === 1 ? 'perfil' : 'perfiles'}
              </span>
              
              {/* Filtros activos - Al lado del contador */}
              {(searchTerm || selectedType) && (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-gray-500">Filtros:</span>
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/10 text-blue-800 text-[13px] font-medium rounded-md">
                      "{searchTerm.length > 15 ? `${searchTerm.substring(0, 15)}...` : searchTerm}"
                    </span>
                  )}
                  {selectedType && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/10 text-green-800 text-[13px] font-medium rounded-md">
                      {selectedType === 'admin' ? 'Administradores' : selectedType === 'worker' ? 'Trabajadores' : selectedType}
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

ProfileActions.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  selectedType: PropTypes.string,
  onTypeChange: PropTypes.func.isRequired,
  onCreateNew: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  totalItems: PropTypes.number,
  loading: PropTypes.bool
};

export default ProfileActions;
 