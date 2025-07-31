/**
 * Componente de paginación reutilizable
 * Maneja navegación entre páginas con información de rango
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente Pagination
 * @param {Object} props - Props del componente
 * @returns {JSX.Element} Componente de paginación
 */
const Pagination = ({
  pagination,
  pageNumbers,
  displayRange,
  navigation,
  onPageChange,
  className = ''
}) => {
  const {
    currentPage,
    totalPages
  } = pagination;

  const {
    canGoPrev,
    canGoNext
  } = navigation;

  const {
    start,
    end,
    total
  } = displayRange;

  // No mostrar paginación si solo hay una página
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row gap-3 items-center justify-between px-4 py-3 bg-white border-t border-gray-200 ${className}`}>
      {/* Información de rango */}
      <div className="order-2 sm:order-1">
        <p className="text-[13px] text-gray-700">
          Mostrando <span className="font-bold">{start}</span> a{' '}
          <span className="font-bold">{end}</span> de{' '}
          <span className="font-bold">{total}</span> resultados
        </p>
      </div>
      
      {/* Controles de navegación */}
      <div className="order-1 sm:order-2 flex items-center">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          {/* Botón anterior */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrev}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-[13px] font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Página anterior"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* Números de página */}
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`relative inline-flex items-center px-4 py-2 border text-[13px] font-medium transition-colors ${
                page === currentPage
                  ? 'z-10 bg-slate-500 border-slate-500 text-white'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
              aria-label={`Página ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
          
          {/* Botón siguiente */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-[13px] font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Página siguiente"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  pagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
  }).isRequired,
  pageNumbers: PropTypes.arrayOf(PropTypes.number).isRequired,
  displayRange: PropTypes.shape({
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
  }).isRequired,
  navigation: PropTypes.shape({
    canGoPrev: PropTypes.bool.isRequired,
    canGoNext: PropTypes.bool.isRequired,
  }).isRequired,
  onPageChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default React.memo(Pagination);