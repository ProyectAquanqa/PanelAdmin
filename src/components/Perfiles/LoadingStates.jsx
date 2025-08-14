import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de estados de carga para Perfiles
 * Basado en KnowledgeBase LoadingStates
 */

// Skeleton para item individual de perfil
const ProfileItemSkeleton = () => (
  <div className="p-6 border-b border-gray-200 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        {/* Header del perfil */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="h-5 bg-gray-200 rounded w-1/2"></div>
          <div className="h-5 bg-gray-200 rounded w-16"></div>
        </div>
        
        {/* Stats del perfil */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
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
const ProfileListLoading = ({ count = 5 }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
      <div className="animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
    <div className="divide-y divide-gray-200">
      {Array.from({ length: count }).map((_, index) => (
        <ProfileItemSkeleton key={index} />
      ))}
    </div>
  </div>
);

// Estado vacío
const EmptyState = ({ onCreateFirst }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay perfiles</h3>
    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
      Comienza creando tu primer perfil de usuario. Podrás gestionar permisos y accesos desde aquí.
    </p>
    <div className="flex items-center justify-center space-x-2">
      <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
      <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
      <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
    </div>
  </div>
);

// Estado de error
const ErrorState = ({ onRetry }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar perfiles</h3>
    <p className="text-gray-500 mb-6">
      No se pudieron cargar los perfiles. Por favor, inténtalo de nuevo.
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#2D728F] hover:bg-[#1e4d61] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D728F] transition-colors"
      >
        Reintentar
      </button>
    )}
  </div>
);

// PropTypes
ProfileListLoading.propTypes = {
  count: PropTypes.number
};

EmptyState.propTypes = {
  onCreateFirst: PropTypes.func
};

ErrorState.propTypes = {
  onRetry: PropTypes.func
};

// Exportar todos los componentes
export const LoadingStates = {
  ProfileListLoading,
  EmptyState,
  ErrorState
};

export default LoadingStates;
