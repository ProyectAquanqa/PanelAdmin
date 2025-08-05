/**
 * Componentes de estados de carga para eventos
 * Proporciona diferentes tipos de loaders y skeletons
 */

import React from 'react';

/**
 * Skeleton para la tabla de eventos
 */
export const TableSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              {[...Array(6)].map((_, index) => (
                <th key={index} className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(6)].map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Skeleton para el modal de evento
 */
export const ModalSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="space-y-6">
        {/* Título */}
        <div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>

        {/* Descripción */}
        <div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>

        {/* Fecha y categoría */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Imagen */}
        <div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>

        {/* Opciones */}
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Spinner simple para operaciones rápidas
 */
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-[#2D728F] ${sizeClasses[size]} ${className}`}></div>
  );
};

/**
 * Loading overlay para pantalla completa
 */
export const LoadingOverlay = ({ message = 'Cargando...' }) => {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
        <Spinner size="lg" />
        <span className="text-gray-900 font-medium">{message}</span>
      </div>
    </div>
  );
};

/**
 * Estado de carga para listas vacías
 */
export const EmptyState = ({ 
  title = 'No hay datos', 
  description = 'No se encontraron elementos para mostrar',
  icon: Icon = null 
}) => {
  return (
    <div className="text-center py-12">
      {Icon && (
        <Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
};

export default {
  TableSkeleton,
  ModalSkeleton,
  Spinner,
  LoadingOverlay,
  EmptyState,
};