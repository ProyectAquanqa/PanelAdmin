/**
 * Componente de acciones integradas para categorías
 * Siguiendo exactamente el diseño de Knowledge Base
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Barra de acciones con filtros integrados para categorías
 */
const CategoryActions = ({
  searchTerm = '',
  onSearchChange,
  selectedStatus = '',
  onStatusChange,
  sortOrder = '',
  onSortOrderChange,
  onCreateNew,
  onExport,
  totalItems = 0,
  loading
}) => {
  // Función para búsqueda flexible
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quita acentos
      .replace(/[^\w\s]/g, '') // Quita caracteres especiales
      .trim();
  };

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
              placeholder="Buscar categorías por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F]/30 transition-all bg-gray-50/30"
            />
          </div>
        </div>

        {/* Filtros y Acciones - Layout adaptativo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Columna 1: Estado de Categorías */}
          <div className="flex flex-col">
            <div className="text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">Estado</div>
            <div className="flex-1 flex flex-col justify-end">
              <div className="grid grid-cols-3 gap-1 bg-gray-50 rounded-lg h-[42px]">
                <button
                  onClick={() => onStatusChange?.('')}
                  className={`px-2 text-[13px] font-medium rounded-md transition-all flex items-center justify-center h-full ${
                    selectedStatus === '' 
                      ? 'bg-slate-500 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => onStatusChange?.('active')}
                  className={`px-2 text-[13px] font-medium rounded-md transition-all flex items-center justify-center h-full ${
                    selectedStatus === 'active' 
                      ? 'bg-slate-500 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Activas
                </button>
                <button
                  onClick={() => onStatusChange?.('inactive')}
                  className={`px-2 text-[13px] font-medium rounded-md transition-all flex items-center justify-center h-full ${
                    selectedStatus === 'inactive' 
                      ? 'bg-slate-500 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Inactivas
                </button>
              </div>
            </div>
          </div>

          {/* Columna 2: Ordenamiento */}
          <div className="flex flex-col">
            <div className="text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">Ordenamiento</div>
            <div className="flex-1 flex flex-col justify-end">
              <div className="grid grid-cols-2 gap-1 bg-gray-50 rounded-lg h-[42px]">
                <button
                  onClick={() => onSortOrderChange?.('asc')}
                  className={`px-2 text-[13px] font-medium rounded-md transition-all flex items-center justify-center h-full ${
                    sortOrder === 'asc' 
                      ? 'bg-slate-500 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  A-Z
                </button>
                <button
                  onClick={() => onSortOrderChange?.('desc')}
                  className={`px-2 text-[13px] font-medium rounded-md transition-all flex items-center justify-center h-full ${
                    sortOrder === 'desc' 
                      ? 'bg-slate-500 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Z-A
                </button>
              </div>
            </div>
          </div>

          {/* Columna 3: Acciones */}
          <div className="flex flex-col">
            <div className="text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">Acciones</div>
            <div className="flex-1 flex flex-col justify-end">
              <div className="flex gap-2 h-[42px]">
                <button
                  onClick={onCreateNew}
                  disabled={loading}
                  className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-500 text-white text-[13px] font-medium rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear
                </button>
                
                <button
                  onClick={onExport}
                  disabled={loading || totalItems === 0}
                  className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 text-slate-600 text-[13px] font-medium rounded-lg hover:bg-slate-200 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas y filtros aplicados */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-gray-600">
              <span className="font-bold">{totalItems}</span> {totalItems === 1 ? 'categoría' : 'categorías'}
            </span>
            {(searchTerm || selectedStatus || sortOrder) && (
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-gray-500">Filtros:</span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/10 text-blue-800 text-[13px] font-medium rounded-md">
                    "{searchTerm.length > 15 ? `${searchTerm.substring(0, 15)}...` : searchTerm}"
                  </span>
                )}
                {selectedStatus && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-[13px] font-medium rounded-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                    {selectedStatus === 'active' ? 'Activas' : selectedStatus === 'inactive' ? 'Inactivas' : 'Todas'}
                  </span>
                )}
                {sortOrder && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-[13px] font-medium rounded-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                    Orden: {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                  </span>
                )}
              </div>
            )}
          </div>
          {(searchTerm || selectedStatus || sortOrder) && (
            <button
              onClick={() => {
                onSearchChange('');
                onStatusChange('');
                onSortOrderChange('');
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 text-slate-600 text-[13px] font-medium rounded-lg hover:bg-slate-200 cursor-pointer transition-all whitespace-nowrap min-w-[90px] sm:min-w-[110px] md:min-w-[130px] lg:min-w-[150px] xl:min-w-[170px] 2xl:min-w-[186px]"
              style={{
                width: 'clamp(90px, 14vw, 186px)'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar filtros
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

CategoryActions.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  selectedStatus: PropTypes.string,
  onStatusChange: PropTypes.func.isRequired,
  sortOrder: PropTypes.string,
  onSortOrderChange: PropTypes.func.isRequired,
  onCreateNew: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  totalItems: PropTypes.number,
  loading: PropTypes.bool
};

export default CategoryActions; 