/**
 * Tabla de previsualización para importación de usuarios
 * Reutiliza componentes existentes de TableView pero adaptado para previsualización
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { SortIcon } from '../Common/DataView';

/**
 * Componente de tabla de previsualización para importación
 */
const ImportPreviewTable = ({ 
  data = [], 
  errors = [], 
  isLoading = false 
}) => {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /**
   * Maneja el ordenamiento de la tabla
   */
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  /**
   * Obtiene los datos ordenados
   */
  const getSortedData = () => {
    if (!sortField || !sortDirection) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Manejo especial para diferentes tipos de datos
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  };

  /**
   * Obtiene los datos paginados
   */
  const getPaginatedData = () => {
    const sortedData = getSortedData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  };

  /**
   * Renderiza una fila de la tabla
   */
  const renderTableRow = (user, index) => {
    const hasError = errors.some(error => error.row === user._rowIndex);
    const rowError = errors.find(error => error.row === user._rowIndex);

    return (
      <tr 
        key={user.id || index} 
        className={`border-b border-gray-100 hover:bg-slate-50 transition-colors ${
          hasError ? 'bg-red-50' : ''
        }`}
      >
        {/* Número de fila */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100">
          <div className="flex items-center">
            <span className="text-[13px] font-mono text-slate-700">
              {user._rowIndex || (index + 1)}
            </span>
            {hasError && (
              <svg className="w-4 h-4 text-red-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
          </div>
        </td>

        {/* Estado de validación */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100">
          <div className="flex justify-center">
            {user._isValid ? (
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
        </td>

        {/* DNI */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100">
          <div className="min-w-0">
            <p className="text-[13px] text-gray-900 truncate">
              {user.username || '-'}
            </p>
          </div>
        </td>

        {/* Nombre completo */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden md:table-cell">
          <div className="min-w-0">
            <p className="text-[13px] text-gray-800 truncate">
              {user.full_name || '-'}
            </p>
          </div>
        </td>

        {/* Email */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden lg:table-cell">
          <div className="min-w-0">
            <p className="text-[13px] text-gray-600 truncate">
              {user.email}
            </p>
          </div>
        </td>

        {/* Estado */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden sm:table-cell">
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[12px] font-medium border whitespace-nowrap ${
              user.is_active 
                ? 'bg-slate-50 text-slate-600 border-slate-200' 
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                user.is_active ? 'bg-slate-500' : 'bg-slate-400'
              }`}></div>
              {user.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </td>

        {/* Roles */}
        <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden xl:table-cell">
          <div className="flex flex-wrap gap-1">
            {user.groups && user.groups.length > 0 ? (
              <>
                {user.groups.slice(0, 2).map((group, idx) => (
                  <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-medium">
                    {group}
                  </span>
                ))}
                {user.groups.length > 2 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-medium">
                    +{user.groups.length - 2}
                  </span>
                )}
              </>
            ) : (
              <span className="text-[10px] text-gray-400 italic">Sin roles</span>
            )}
          </div>
        </td>
      </tr>
    );
  };

  /**
   * Renderiza el resumen de errores
   */
  const renderErrorSummary = () => {
    if (errors.length === 0) return null;

    return (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="text-sm font-medium text-red-800 mb-2">
          Errores encontrados ({errors.length}):
        </h4>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {errors.slice(0, 5).map((error, index) => (
            <p key={index} className="text-xs text-red-700">
              Fila {error.row}: {error.error}
            </p>
          ))}
          {errors.length > 5 && (
            <p className="text-xs text-red-600 font-medium">
              ... y {errors.length - 5} errores más
            </p>
          )}
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg text-gray-700">Procesando archivo...</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay datos para mostrar</h3>
        <p className="mt-1 text-sm text-gray-500">Seleccione un archivo Excel para previsualizar los datos</p>
      </div>
    );
  }

  const sortedData = getSortedData();
  const paginatedData = getPaginatedData();
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  return (
    <div className="space-y-4">
      {/* Resumen de errores */}
      {renderErrorSummary()}

      {/* Tabla */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-gray-300 table-auto">
            <thead className="bg-[#F2F3F5] border-b border-slate-300/60">
              <tr>
                {/* Fila */}
                <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider w-[80px]">
                  Fila
                </th>
                
                {/* Estado */}
                <th className="px-3 sm:px-4 md:px-6 py-4 text-center text-[13px] font-semibold text-gray-500 uppercase tracking-wider w-[60px]">
                  Estado
                </th>
                
                {/* DNI */}
                <th 
                  className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-200/50 transition-colors"
                  onClick={() => handleSort('username')}
                >
                  <div className="flex items-center">
                    DNI
                    <SortIcon field="username" currentField={sortField} direction={sortDirection} />
                  </div>
                </th>
                
                {/* Nombre Completo */}
                <th 
                  className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell min-w-[160px] cursor-pointer hover:bg-gray-200/50 transition-colors"
                  onClick={() => handleSort('full_name')}
                >
                  <div className="flex items-center">
                    Nombre Completo
                    <SortIcon field="full_name" currentField={sortField} direction={sortDirection} />
                  </div>
                </th>
                
                {/* Email */}
                <th 
                  className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell min-w-[180px] cursor-pointer hover:bg-gray-200/50 transition-colors"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center">
                    Email
                    <SortIcon field="email" currentField={sortField} direction={sortDirection} />
                  </div>
                </th>
                
                {/* Estado */}
                <th 
                  className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell cursor-pointer hover:bg-gray-200/50 transition-colors min-w-[80px] w-[100px]"
                  onClick={() => handleSort('is_active')}
                >
                  <div className="flex items-center">
                    Estado
                    <SortIcon field="is_active" currentField={sortField} direction={sortDirection} />
                  </div>
                </th>
                
                {/* Roles */}
                <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell min-w-[100px] w-[120px]">
                  Roles
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map(renderTableRow)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> de{' '}
                <span className="font-medium">{sortedData.length}</span> usuarios
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNumber
                          ? 'z-10 bg-slate-50 border-slate-500 text-slate-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ImportPreviewTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  errors: PropTypes.arrayOf(PropTypes.shape({
    row: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    error: PropTypes.string
  })),
  isLoading: PropTypes.bool
};

export default ImportPreviewTable;