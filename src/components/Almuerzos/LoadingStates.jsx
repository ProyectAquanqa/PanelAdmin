/**
 * Estados de carga para el módulo de Almuerzos
 * Basado en los LoadingStates de otros módulos
 */

import React from 'react';

/**
 * Skeleton loader para tabla de almuerzos
 */
export const TableSkeleton = () => {
  return (
    <div className="w-full bg-slate-50">
      <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Skeleton del header de filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 mb-6 animate-pulse">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="h-10 bg-gray-200 rounded-lg w-64"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded-lg w-36"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>

        {/* Skeleton de la tabla */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          {/* Header de la tabla */}
          <div className="bg-[#F2F3F5] border-b border-slate-300/60 p-4">
            <div className="flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-32 hidden md:block"></div>
              <div className="h-4 bg-gray-200 rounded w-32 hidden lg:block"></div>
              <div className="h-4 bg-gray-200 rounded w-24 hidden sm:block"></div>
              <div className="h-4 bg-gray-200 rounded w-24 hidden xl:block"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-24 ml-auto"></div>
            </div>
          </div>

          {/* Filas de la tabla */}
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="p-4 border-b border-gray-100 animate-pulse">
              <div className="flex items-center gap-4">
                {/* Fecha */}
                <div className="min-w-[120px]">
                  <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
                
                {/* Entrada */}
                <div className="max-w-[200px] lg:max-w-[250px] hidden md:block">
                  <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                
                {/* Plato de fondo */}
                <div className="max-w-[200px] xl:max-w-[250px] hidden lg:block">
                  <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                
                {/* Refresco */}
                <div className="max-w-[120px] hidden sm:block">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
                
                {/* Dieta */}
                <div className="max-w-[120px] hidden xl:block">
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>
                
                {/* Estado */}
                <div className="flex flex-col gap-1">
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                </div>
                
                {/* Acciones */}
                <div className="flex items-center gap-1 ml-auto">
                  <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Estado de loading en línea para operaciones rápidas
 */
export const InlineLoader = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D728F]"></div>
    <span className="ml-3 text-gray-500">Cargando almuerzos...</span>
  </div>
);

/**
 * Estado de loading para modales
 */
export const ModalLoader = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D728F]"></div>
  </div>
);

/**
 * Estado de loading para botones
 */
export const ButtonLoader = ({ size = 4 }) => (
  <div className={`animate-spin rounded-full h-${size} w-${size} border-b-2 border-white`}></div>
);

export default {
  TableSkeleton,
  InlineLoader,
  ModalLoader,
  ButtonLoader
};
