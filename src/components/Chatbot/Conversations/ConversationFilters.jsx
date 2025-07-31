import React from 'react';
import PropTypes from 'prop-types';
import { CustomDropdown } from '../../Common';

/**
 * Componente de filtros para Conversations - REDISEÑO COMPLETO
 * Siguiendo EXACTAMENTE el patrón visual de KnowledgeBase pero para conversaciones
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
  const handleSearchChange = (value) => {
    onSearchChange?.(value);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="space-y-6">
        {/* Búsqueda Principal */}
        <div className="w-full">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar conversaciones, usuarios, preguntas o respuestas..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200"
            />
          </div>
        </div>

        {/* Filtros Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Filtro de Usuario */}
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">
              Usuario
            </label>
            <CustomDropdown
              value={selectedUser}
              onChange={onUserChange}
              options={[
                { value: '', label: 'Todos los usuarios' },
                { value: 'admin', label: 'Administrador' },
                { value: 'usuario1', label: 'Usuario 1' },
                { value: 'maria_garcia', label: 'María García' },
                { value: 'test_user', label: 'Usuario Test' }
              ]}
              placeholder="Seleccionar usuario..."
              showIcon={true}
              iconComponent={
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              optionTextSize="text-[13px]"
            />
          </div>

          {/* Filtro de Estado */}
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">
              Estado
            </label>
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
                onClick={() => onStatusChange?.('exitosa')}
                className={`px-2 text-[13px] font-medium rounded-md transition-all flex items-center justify-center h-full ${
                  selectedStatus === 'exitosa'
                    ? 'bg-slate-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-slate-500 hover:bg-slate-100'
                }`}
              >
                Exitosas
              </button>
              <button
                onClick={() => onStatusChange?.('fallida')}
                className={`px-2 text-[13px] font-medium rounded-md transition-all flex items-center justify-center h-full ${
                  selectedStatus === 'fallida'
                    ? 'bg-slate-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-slate-500 hover:bg-slate-100'
                }`}
              >
                Fallidas
              </button>
            </div>
          </div>

          {/* Filtro por Fecha */}
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">
              Fecha
            </label>
            <CustomDropdown
              value={selectedDateRange}
              onChange={onDateRangeChange}
              options={[
                { value: '', label: 'Todas las fechas' },
                { value: 'today', label: 'Hoy' },
                { value: 'yesterday', label: 'Ayer' },
                { value: 'week', label: 'Última semana' },
                { value: 'month', label: 'Último mes' }
              ]}
              placeholder="Seleccionar fecha..."
              showIcon={true}
              iconComponent={
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              optionTextSize="text-[13px]"
            />
          </div>

          {/* Filtro por Tipo de Coincidencia */}
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">
              Base de Conocimiento
            </label>
            <CustomDropdown
              value={selectedMatchType}
              onChange={onMatchTypeChange}
              options={[
                { value: '', label: 'Todas' },
                { value: 'with_knowledge', label: 'Con conocimiento' },
                { value: 'no_knowledge', label: 'Sin conocimiento' }
              ]}
              placeholder="Tipo de coincidencia..."
              showIcon={true}
              iconComponent={
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              optionTextSize="text-[13px]"
            />
          </div>

          {/* Exportar */}
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wider">
              Exportar
            </label>
            <button
              onClick={onExport}
              disabled={totalItems === 0}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-500 text-white text-[13px] font-medium rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar
            </button>
          </div>
        </div>

        {/* Información de resultados y filtros */}
        <div className="flex flex-col gap-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-[13px] text-gray-600">
                <span className="font-bold">{totalItems}</span> {totalItems === 1 ? 'conversación' : 'conversaciones'} encontradas
              </span>

              {/* Filtros activos - Al lado del contador */}
              {(searchTerm || selectedUser || selectedStatus || selectedDateRange || selectedMatchType) && (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-gray-500">Filtros:</span>
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/10 text-blue-800 text-[13px] font-medium rounded-md">
                      "{searchTerm.length > 15 ? `${searchTerm.substring(0, 15)}...` : searchTerm}"
                    </span>
                  )}
                  {selectedUser && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-[13px] font-medium rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                      {selectedUser.length > 10 ? `${selectedUser.substring(0, 10)}...` : selectedUser}
                    </span>
                  )}
                  {selectedStatus && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-[13px] font-medium rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                      {selectedStatus === 'exitosa' ? 'Exitosas' : 'Fallidas'}
                    </span>
                  )}
                  {selectedDateRange && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-[13px] font-medium rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                      {selectedDateRange === 'today' ? 'Hoy' : 
                       selectedDateRange === 'yesterday' ? 'Ayer' :
                       selectedDateRange === 'week' ? 'Última semana' :
                       selectedDateRange === 'month' ? 'Último mes' : selectedDateRange}
                    </span>
                  )}
                  {selectedMatchType && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-[13px] font-medium rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                      {selectedMatchType === 'with_knowledge' ? 'Con conocimiento' : 'Sin conocimiento'}
                    </span>
                  )}
                </div>
              )}
            </div>

            {(searchTerm || selectedUser || selectedStatus || selectedDateRange || selectedMatchType) && (
              <button
                onClick={() => {
                  onSearchChange?.('');
                  onUserChange?.('');
                  onStatusChange?.('');
                  onDateRangeChange?.('');
                  onMatchTypeChange?.('');
                }}
                className="inline-flex items-center justify-center gap-1.5 px-8 py-2.5 bg-slate-100 text-slate-600 text-[13px] font-medium rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500/20 cursor-pointer transition-all min-w-[220px]"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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