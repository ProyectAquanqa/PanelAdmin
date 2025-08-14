/**
 * Componente de estados de carga profesionales para Áreas
 * Incluye skeletons y estados vacíos siguiendo el patrón de KnowledgeBase
 */

import React from 'react';
import PropTypes from 'prop-types';

// Skeleton para item individual de área
const AreaItemSkeleton = () => (
  <div className="p-6 border-b border-gray-200 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        {/* Header del item */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-5 bg-gray-200 rounded w-16"></div>
          <div className="h-5 bg-gray-200 rounded w-12"></div>
        </div>
        
        {/* Contenido del item */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        
        {/* Estadísticas */}
        <div className="flex items-center space-x-4 mb-3">
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
        
        {/* Metadata */}
        <div className="flex items-center space-x-4">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
      
      {/* Botones de acción */}
      <div className="ml-4 flex flex-col space-y-2">
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  </div>
);

// Componente principal de loading
const AreaListLoading = ({ count = 5 }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
    </div>
    
    <div className="divide-y divide-gray-200">
      {Array.from({ length: count }, (_, index) => (
        <AreaItemSkeleton key={index} />
      ))}
    </div>
  </div>
);

// Estado vacío profesional
const EmptyState = ({ 
  title = "No hay áreas registradas",
  description = "Comience creando las áreas organizacionales de su empresa para una mejor gestión de cargos y usuarios.",
  actionLabel = "Crear Primera Área",
  onCreateFirst
}) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="p-16 text-center">
      {/* Ilustración moderna */}
      <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        {title}
      </h3>
      
      <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
        {description}
      </p>
      
      {onCreateFirst && (
        <button
          onClick={onCreateFirst}
          className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-slate-500 hover:bg-slate-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {actionLabel}
        </button>
      )}
      
      {/* Elementos decorativos sutiles */}
      <div className="mt-12 flex justify-center space-x-2">
        <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
        <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
        <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
      </div>
    </div>
  </div>
);

// Estado de error profesional
const ErrorState = ({ 
  title = "Error al cargar datos",
  description = "Ha ocurrido un error al intentar cargar las áreas. Por favor, intente nuevamente.",
  actionLabel = "Reintentar",
  onRetry
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-red-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-red-200 bg-red-50">
      <h2 className="text-lg font-semibold text-red-900">Error de Carga</h2>
    </div>
    
    <div className="p-12 text-center">
      {/* Icono de error */}
      <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {description}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D728F] transition-all"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {actionLabel}
        </button>
      )}
    </div>
  </div>
);

// Componente principal que exporta todos los estados
const LoadingStates = {
  AreaListLoading,
  EmptyState,
  ErrorState,
  AreaItemSkeleton
};

// PropTypes
AreaListLoading.propTypes = {
  count: PropTypes.number
};

EmptyState.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  onCreateFirst: PropTypes.func
};

ErrorState.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  onRetry: PropTypes.func
};

export default LoadingStates;
