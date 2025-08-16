import React from 'react';
import PropTypes from 'prop-types';

/**
 * Estados de carga específicos para el módulo de Cargos
 * Siguiendo el patrón del módulo de Areas
 */

// Skeleton para la lista de cargos
export const CargoListLoading = () => (
  <div className="space-y-4">
    {/* Skeleton para la barra de acciones */}
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-28 animate-pulse"></div>
        </div>
      </div>
    </div>

    {/* Skeleton para la lista */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Estado de error general
export const ErrorState = ({ onRetry = null, message = "Error al cargar los datos" }) => (
  <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
      <svg
        className="h-6 w-6 text-red-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.598 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Error al cargar
    </h3>
    <p className="text-gray-500 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Reintentar
      </button>
    )}
  </div>
);

// Estado vacío
export const EmptyState = ({ onCreateFirst = null }) => (
  <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
      <svg
        className="h-6 w-6 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      No hay cargos registrados
    </h3>
    <p className="text-gray-500 mb-4">
      Comience creando el primer cargo de la empresa.
    </p>
    {onCreateFirst && (
      <button
        onClick={onCreateFirst}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Crear primer cargo
      </button>
    )}
  </div>
);

// Skeleton para el modal de cargo
export const CargoModalLoading = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
    </div>
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
    </div>
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
      <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
    </div>
  </div>
);

// Propiedades por defecto
ErrorState.propTypes = {
  onRetry: PropTypes.func,
  message: PropTypes.string,
};

EmptyState.propTypes = {
  onCreateFirst: PropTypes.func,
};
