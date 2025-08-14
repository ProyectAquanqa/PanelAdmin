import React from 'react';
import PropTypes from 'prop-types';
import { CustomDropdown } from '../Common';

/**
 * Componente de acciones integradas: búsqueda, filtros y acciones principales para Áreas
 * Diseño profesional con búsqueda y filtros fusionados siguiendo el patrón de KnowledgeActions
 */
const AreaActions = ({
  searchTerm = '',
  onSearchChange,
  selectedStatus = '',
  onStatusChange,
  selectedDateRange = null,
  onDateRangeChange,
  onCreateNew,
  onExport,
  totalItems = 0,
  onClearFilters
}) => {
  // Función mejorada para búsqueda flexible
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

  // Opciones de estado
  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'true', label: 'Activas' },
    { value: 'false', label: 'Inactivas' }
  ];

  const hasActiveFilters = searchTerm || selectedStatus || (selectedDateRange && (selectedDateRange.start || selectedDateRange.end));

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
              placeholder="Buscar áreas por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F]/30 transition-all bg-gray-50/30"
            />
          </div>
        </div>

        {/* Filtros y Acciones - Layout adaptativo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Columna 1: Filtro de Estado */}
          <div className="flex flex-col">
            <div className="text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">Estado</div>
            <div className="flex-1 flex flex-col justify-end">
              <CustomDropdown
                value={selectedStatus}
                onChange={onStatusChange}
                options={statusOptions}
                placeholder="Seleccionar estado..."
                className="h-[42px]"
                showIcon={false}
                optionTextSize="text-[13px]"
              />
            </div>
          </div>

          {/* Columna 2: Filtro de Fechas */}
          <div className="flex flex-col">
            <div className="text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">Fecha de Creación</div>
            <div className="flex-1 flex flex-col justify-end">
              <div className="grid grid-cols-2 gap-1 h-[42px]">
                <input
                  type="date"
                  value={selectedDateRange?.start || ''}
                  onChange={(e) => onDateRangeChange?.({ 
                    ...selectedDateRange, 
                    start: e.target.value 
                  })}
                  className="text-[13px] border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
                  placeholder="Desde"
                />
                <input
                  type="date"
                  value={selectedDateRange?.end || ''}
                  onChange={(e) => onDateRangeChange?.({ 
                    ...selectedDateRange, 
                    end: e.target.value 
                  })}
                  className="text-[13px] border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
                  placeholder="Hasta"
                />
              </div>
            </div>
          </div>

          {/* Columna 3: Acciones */}
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
              </div>
            </div>
          </div>
        </div>

        {/* Información de resultados y filtros */}
        <div className="flex flex-col gap-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-[13px] text-gray-600">
                <span className="font-bold">{totalItems}</span> {totalItems === 1 ? 'área' : 'áreas'}
              </span>
              
              {/* Filtros activos - Al lado del contador */}
              {hasActiveFilters && (
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
                      {statusOptions.find(s => s.value === selectedStatus)?.label || 'Estado'}
                    </span>
                  )}
                  {selectedDateRange && (selectedDateRange.start || selectedDateRange.end) && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-[13px] font-medium rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                      {selectedDateRange.start && selectedDateRange.end ? 
                        `${selectedDateRange.start} - ${selectedDateRange.end}` :
                        selectedDateRange.start ? 
                          `Desde ${selectedDateRange.start}` :
                          `Hasta ${selectedDateRange.end}`
                      }
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {hasActiveFilters && (
              <button
                onClick={() => {
                  onSearchChange?.('');
                  onStatusChange?.('');
                  onDateRangeChange?.(null);
                  onClearFilters?.();
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 text-slate-600 text-[13px] font-medium rounded-lg hover:bg-slate-200 cursor-pointer transition-all min-w-[120px]"
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
    </div>
  );
};

AreaActions.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  selectedStatus: PropTypes.string,
  onStatusChange: PropTypes.func,
  selectedDateRange: PropTypes.shape({
    start: PropTypes.string,
    end: PropTypes.string
  }),
  onDateRangeChange: PropTypes.func,
  onCreateNew: PropTypes.func,
  onExport: PropTypes.func,
  totalItems: PropTypes.number,
  onClearFilters: PropTypes.func
};

export default AreaActions;
