import React, { useState } from 'react';
import PropTypes from 'prop-types';

const DataViewSwitcher = ({ 
  data = [], 
  onEdit,
  onDelete,
  onSort
}) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const toggleRowExpansion = (itemId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Función para manejar el ordenamiento
  const handleSort = (field) => {
    if (sortField === field) {
      // Ciclo: desc -> asc -> null (deseleccionar)
      if (sortDirection === 'desc') {
        setSortDirection('asc');
      } else if (sortDirection === 'asc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      // Nuevo campo, empezar con desc
      setSortField(field);
      setSortDirection('desc');
    }
    onSort?.(field, sortDirection);
  };

  // Ordenar los datos
  const sortedData = [...data].sort((a, b) => {
    // Si no hay campo de ordenamiento, ordenar por fecha de creación (más reciente primero)
    if (!sortField) {
      const dateA = new Date(a.created_at || a.created);
      const dateB = new Date(b.created_at || b.created);
      return dateB - dateA; // Desc por defecto (más reciente primero)
    }
    
    if (sortField === 'created_at') {
      const dateA = new Date(a.created_at || a.created);
      const dateB = new Date(b.created_at || b.created);
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    }
    
    if (sortField === 'is_active') {
      const aValue = a.is_active ? 1 : 0;
      const bValue = b.is_active ? 1 : 0;
      return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
    }

    if (sortField === 'has_embedding') {
      const aValue = (a.question_embedding && a.question_embedding.length > 0) ? 1 : 0;
      const bValue = (b.question_embedding && b.question_embedding.length > 0) ? 1 : 0;
      return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
    }
    
    return 0;
  });

  // Paginación
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const SortIcon = ({ field, currentField, direction }) => {
    if (field !== currentField || !direction) {
      return (
        <svg className="w-3 h-3 ml-1 text-gray-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return (
      <svg className={`w-3 h-3 ml-1 text-[#2D728F] transition-transform ${direction === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const TableView = () => (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-gray-300 table-auto">
          <thead className="bg-[#F2F3F5] border-b border-slate-300/60">
            <tr>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider w-auto min-w-[300px]">
                Pregunta | Respuesta
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell w-auto min-w-[120px]">
                Categoría
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell w-auto min-w-[150px]">
                Palabras Clave
              </th>
              <th 
                className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell cursor-pointer hover:bg-gray-200/50 transition-colors w-auto min-w-[100px]"
                onClick={() => handleSort('has_embedding')}
              >
                <div className="flex items-center">
                  Embedding
                  <SortIcon field="has_embedding" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th 
                className="px-3 sm:px-4 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell cursor-pointer hover:bg-gray-200/50 transition-colors w-auto min-w-[80px]"
                onClick={() => handleSort('is_active')}
              >
                <div className="flex items-center">
                  Estado
                  <SortIcon field="is_active" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th className="px-3 sm:px-4 md:px-6 py-4 text-right text-[13px] font-semibold text-gray-500 uppercase tracking-wider w-auto min-w-[100px]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item, index) => {
              const isExpanded = expandedRows.has(item.id);
              const shouldTruncate = item.answer && item.answer.length > 100;
              
              return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  {/* Pregunta | Respuesta */}
                  <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100">
                    <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                      <div className="mb-2">
                        <p className="text-[13px] font-semibold text-gray-800 line-clamp-2 leading-relaxed">
                          {item.question}
                        </p>
                      </div>
                      {item.answer && (
                        <div className="relative">
                          <p className={`text-[13px] text-gray-500 leading-relaxed ${
                            !isExpanded && shouldTruncate ? 'line-clamp-2' : ''
                          }`}>
                            {item.answer}
                          </p>
                          {shouldTruncate && (
                            <button
                              onClick={() => toggleRowExpansion(item.id)}
                              className="mt-1 text-[13px] text-[#2D728F] hover:text-[#235A6F] flex items-center gap-1 transition-colors"
                              title={isExpanded ? 'Mostrar menos' : 'Mostrar más'}
                            >
                              {isExpanded ? (
                                <>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                  Ver menos
                                </>
                              ) : (
                                <>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                  Ver más
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Categoría */}
                  <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden lg:table-cell">
                    <div className="flex items-center">
                      {item.category ? (
                        <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium bg-blue-100/50 text-blue-600 border border-blue-200/50 whitespace-nowrap">
                          {item.category.name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium bg-gray-100 text-gray-500 border border-gray-200 whitespace-nowrap">
                          Sin categoría
                        </span>
                      )}
                    </div>
                  </td>
                  
                  {/* Palabras Clave */}
                  <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden xl:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {item.keywords ? (
                        typeof item.keywords === 'string' && item.keywords.trim() ? (
                          <>
                            {item.keywords.split(',').slice(0, 3).map((keyword, idx) => 
                              keyword.trim() ? (
                                <span 
                                  key={idx} 
                                  className="inline-block px-2 py-1 text-[13px] bg-gray-100 text-gray-600 rounded-full border border-gray-200 whitespace-nowrap"
                                >
                                  {keyword.trim()}
                                </span>
                              ) : null
                            )}
                            {item.keywords.split(',').length > 3 && (
                              <span className="inline-flex items-center text-[13px] text-gray-400 font-medium">
                                +{item.keywords.split(',').length - 3} más
                              </span>
                            )}
                          </>
                        ) : Array.isArray(item.keywords) && item.keywords.length > 0 ? (
                          <>
                            {item.keywords.slice(0, 3).map((keyword, idx) => (
                              <span 
                                key={idx} 
                                className="inline-block px-2 py-1 text-[13px] bg-gray-100 text-gray-600 rounded-full border border-gray-200 whitespace-nowrap"
                              >
                                {keyword}
                              </span>
                            ))}
                            {item.keywords.length > 3 && (
                              <span className="inline-flex items-center text-[13px] text-gray-400 font-medium">
                                +{item.keywords.length - 3} más
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-[13px] text-gray-400 italic">Sin palabras clave</span>
                        )
                      ) : (
                        <span className="text-[13px] text-gray-400 italic">Sin palabras clave</span>
                      )}
                    </div>
                  </td>

                  {/* Embedding */}
                  <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden md:table-cell">
                    <div className="flex items-center">
                      {item.question_embedding && item.question_embedding.length > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium bg-slate-50 text-slate-600 border border-slate-200 whitespace-nowrap">
                          <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-slate-500"></div>
                          Con IA
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 whitespace-nowrap">
                          <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-gray-400"></div>
                          Sin IA
                        </span>
                      )}
                    </div>
                  </td>
                  
                  {/* Estado */}
                  <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 hidden sm:table-cell">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium border whitespace-nowrap ${
                        item.is_active 
                          ? 'bg-slate-50 text-slate-600 border-slate-200' 
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          item.is_active ? 'bg-slate-500' : 'bg-gray-400'
                        }`}></div>
                        {item.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </td>
                  
                  {/* Acciones */}
                  <td className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit?.(item)}
                        className="p-2 text-gray-400 hover:text-[#2D728F] transition-colors rounded-lg hover:bg-gray-100"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete?.(item)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
            <div className="order-2 sm:order-1">
              <p className="text-[13px] text-gray-700">
                Mostrando <span className="font-bold">{startIndex + 1}</span> a{' '}
                <span className="font-bold">{Math.min(startIndex + itemsPerPage, sortedData.length)}</span> de{' '}
                <span className="font-bold">{sortedData.length}</span> resultados
              </p>
            </div>
            
            <div className="order-1 sm:order-2 flex items-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-[13px] font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-[13px] font-medium ${
                        page === currentPage
                          ? 'z-10 bg-slate-500 border-slate-500 text-white'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-[13px] font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
      )}
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-3 md:px-6 py-4 text-left text-[13px] font-semibold text-gray-600 uppercase tracking-wider">
                Pregunta | Respuesta
              </th>
              <th className="hidden lg:table-cell px-6 py-4 text-left text-[13px] font-semibold text-gray-600 uppercase tracking-wider">
                Categoría
              </th>
              <th className="hidden xl:table-cell px-6 py-4 text-left text-[13px] font-semibold text-gray-600 uppercase tracking-wider">
                Palabras Clave
              </th>
              <th className="hidden md:table-cell px-6 py-4 text-left text-[13px] font-semibold text-gray-600 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-3 md:px-6 py-4 text-right text-[13px] font-semibold text-gray-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[...Array(5)].map((_, index) => (
              <tr key={index}>
                <td className="px-3 md:px-6 py-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </td>
                <td className="hidden lg:table-cell px-6 py-4">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  </div>
                </td>
                <td className="hidden xl:table-cell px-6 py-4">
                  <div className="animate-pulse flex gap-1">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                </td>
                <td className="hidden md:table-cell px-6 py-4">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  </div>
                </td>
                <td className="px-3 md:px-6 py-4">
                  <div className="animate-pulse flex justify-end gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {data.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos disponibles</h3>
          <p className="text-gray-500">No se encontraron elementos para mostrar.</p>
        </div>
      ) : (
        <TableView />
      )}
    </div>
  );
};

DataViewSwitcher.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onSort: PropTypes.func
};

export default DataViewSwitcher; 