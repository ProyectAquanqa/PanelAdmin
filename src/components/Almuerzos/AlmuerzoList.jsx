/**
 * Componente principal para la lista de Almuerzos
 * Basado en EventoList, adaptado para almuerzos
 */

import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import AlmuerzoTableView from './AlmuerzoTableView';
import { InlineLoader } from './LoadingStates';
import { useDataView } from '../../hooks/useDataView';

/**
 * Componente AlmuerzoList - Lista principal de almuerzos
 */
const AlmuerzoList = ({
  almuerzos = [],
  loading = false,
  error = null,
  totalItems = 0,
  onEdit,
  onDelete,
  onToggleStatus,
  onCreateFirst,
  onRetry,
  className = ''
}) => {
  // Estados locales para expansión de filas
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Hook para manejo de vista de datos (ordenamiento, etc.)
  const {
    sortField,
    sortDirection,
    handleSort,
    sortedData
  } = useDataView(almuerzos, {
    defaultSort: { field: 'fecha', direction: 'desc' }
  });

  // Manejar expansión/colapso de filas
  const handleToggleExpansion = useCallback((almuerzoId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(almuerzoId)) {
        newSet.delete(almuerzoId);
      } else {
        newSet.add(almuerzoId);
      }
      return newSet;
    });
  }, []);

  // Datos ordenados y procesados
  const processedData = useMemo(() => {
    return sortedData;
  }, [sortedData]);

  // Componente de estado vacío
  const EmptyState = () => (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <div className="text-center py-12 px-6">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No hay almuerzos
        </h3>
        <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
          Comienza creando tu primer almuerzo del menú. Podrás gestionar toda la información del menú diario desde aquí.
        </p>
        <div className="mt-6">
          <button
            onClick={onCreateFirst}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#2D728F] hover:bg-[#235A6F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D728F] transition-colors"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear primer almuerzo
          </button>
        </div>
      </div>
    </div>
  );

  // Componente de error
  const ErrorState = () => (
    <div className="bg-white rounded-lg shadow-sm border border-red-200 overflow-hidden">
      <div className="text-center py-12 px-6">
        <div className="mx-auto h-12 w-12 text-red-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.938 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-red-900">
          Error al cargar almuerzos
        </h3>
        <p className="mt-2 text-sm text-red-700 max-w-sm mx-auto">
          {error || 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.'}
        </p>
        <div className="mt-6">
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reintentar
          </button>
        </div>
      </div>
    </div>
  );

  // Renderizado principal
  return (
    <div className={`w-full ${className}`}>
      {/* Estado de loading */}
      {loading && almuerzos.length === 0 && (
        <InlineLoader />
      )}

      {/* Estado de error */}
      {error && almuerzos.length === 0 && !loading && (
        <ErrorState />
      )}

      {/* Estado vacío */}
      {!loading && !error && almuerzos.length === 0 && (
        <EmptyState />
      )}

      {/* Lista de almuerzos */}
      {almuerzos.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <AlmuerzoTableView
            data={processedData}
            sortField={sortField}
            sortDirection={sortDirection}
            expandedRows={expandedRows}
            onSort={handleSort}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleExpansion={handleToggleExpansion}
            onToggleStatus={onToggleStatus}
          />
          
          {/* Indicador de loading durante recargas */}
          {loading && almuerzos.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2D728F] mr-2"></div>
                <span className="text-sm text-gray-500">Actualizando...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Información adicional en el footer */}
      {almuerzos.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500 px-2">
          <div>
            Mostrando {almuerzos.length} de {totalItems} almuerzos
          </div>
          
          {/* Leyenda de estados */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Activo</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>Inactivo</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span>Feriado</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

AlmuerzoList.propTypes = {
  almuerzos: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    fecha: PropTypes.string.isRequired,
    entrada: PropTypes.string,
    plato_fondo: PropTypes.string,
    refresco: PropTypes.string,
    dieta: PropTypes.string,
    active: PropTypes.bool,
    es_feriado: PropTypes.bool,
    link: PropTypes.string,
    nombre_dia: PropTypes.string,
  })),
  loading: PropTypes.bool,
  error: PropTypes.string,
  totalItems: PropTypes.number,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onToggleStatus: PropTypes.func,
  onCreateFirst: PropTypes.func,
  onRetry: PropTypes.func,
  className: PropTypes.string,
};

export default React.memo(AlmuerzoList);
