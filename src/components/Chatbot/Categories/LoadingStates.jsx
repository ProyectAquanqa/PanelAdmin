/**
 * Estados de carga para componentes de categorías
 * Siguiendo el diseño minimalista y profesional
 */

import React from 'react';

/**
 * Skeleton para tabla de categorías
 */
const CategoryTableLoading = () => {
  return (
    <div className="space-y-6">
      {/* Skeleton para actions bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="w-32 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="w-full h-12 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>

      {/* Skeleton para tabla */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header de tabla */}
        <div className="bg-[#F2F3F5] border-b border-slate-300/60 px-6 py-4">
          <div className="flex items-center space-x-8">
            <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
          </div>
        </div>

        {/* Filas de skeleton */}
        <div className="divide-y divide-gray-200">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="px-6 py-4 animate-pulse">
              <div className="flex items-center space-x-8">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mt-1"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
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
 * Estado de carga general para categorías
 */
const CategoriesLoading = () => {
  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CategoryTableLoading />
      </div>
    </div>
  );
};

/**
 * Estado de error para categorías
 */
const ErrorState = ({ onRetry }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-gray-400 text-6xl mb-4">⚠️</div>
        <h3 className="text-[13px] font-medium text-gray-900 mb-2">
          Error al cargar categorías
        </h3>
        <p className="text-[13px] text-gray-500 mb-6 leading-relaxed">
          Hubo un problema al cargar las categorías. Por favor, intenta nuevamente.
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 text-[13px] font-medium text-white bg-[#2D728F] hover:bg-[#235A6F] border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 transition-all duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reintentar
        </button>
      </div>
    </div>
  );
};

const LoadingStates = {
  CategoryTableLoading,
  CategoriesLoading,
  ErrorState
};

export default LoadingStates; 