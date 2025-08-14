/**
 * Estados de carga para Areas
 * Siguiendo el patrón de otros módulos para consistencia
 */

import React from 'react';

const LoadingStates = {
  // Estado de carga principal de areas
  AreasLoading: () => (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Skeleton de filtros */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="flex space-x-3">
                  <div className="h-10 bg-gray-200 rounded w-32"></div>
                  <div className="h-10 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="h-10 bg-gray-200 rounded w-64"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
                <div className="h-10 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
          </div>

          {/* Skeleton de tabla */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="animate-pulse">
              {/* Header de tabla */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="flex space-x-6">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              
              {/* Filas de tabla */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3">
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-48"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-8"></div>
                    <div className="h-4 bg-gray-200 rounded w-8"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="flex space-x-2">
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ),

  // Estado de carga del modal
  AreaModalLoading: () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="animate-pulse">
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-6 w-6 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Contenido */}
          <div className="px-6 py-4 space-y-4">
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-20 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
            <div className="flex justify-end space-x-3">
              <div className="h-9 bg-gray-200 rounded w-20"></div>
              <div className="h-9 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),

  // Skeleton de tabla específico
  TableSkeleton: () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="flex space-x-6">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
        
        {/* Filas */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-8"></div>
              <div className="h-4 bg-gray-200 rounded w-8"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),

  // Skeleton de tarjetas móviles
  MobileCardsSkeleton: () => (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="animate-pulse">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-48"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="flex space-x-2">
                <div className="h-6 bg-gray-200 rounded w-12"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="flex space-x-1">
                <div className="h-7 w-7 bg-gray-200 rounded-full"></div>
                <div className="h-7 w-7 bg-gray-200 rounded-full"></div>
                <div className="h-7 w-7 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  ),

  // Estado de carga para operaciones de CRUD
  ActionLoading: ({ message = 'Cargando...' }) => (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 flex items-center space-x-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="text-gray-700 font-medium">{message}</span>
      </div>
    </div>
  ),

  // Estado de carga inline para botones
  ButtonLoading: ({ className = "h-4 w-4" }) => (
    <div className={`animate-spin rounded-full border-b-2 border-current ${className}`}></div>
  ),

  // Estado de carga para dropdown/select
  DropdownLoading: () => (
    <div className="px-4 py-2 text-gray-500 flex items-center">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
      Cargando...
    </div>
  )
};

export default LoadingStates;
