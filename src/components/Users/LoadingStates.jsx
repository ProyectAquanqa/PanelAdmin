/**
 * Estados de carga para el módulo de Usuarios
 * Siguiendo el patrón de Conversations LoadingStates
 */

import React from 'react';
import PropTypes from 'prop-types';

const UsersLoading = () => (
  <div className="bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header Loading */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>

        {/* Filtros Loading */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-10 bg-gray-100 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabla Loading */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Header de tabla */}
          <div className="bg-[#F2F3F5] border-b border-gray-200 px-6 py-4">
            <div className="animate-pulse">
              <div className="grid grid-cols-6 gap-4">
                {['ID', 'Usuario', 'Nombre', 'Email', 'Grupos', 'Acciones'].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Filas de tabla */}
          <div className="divide-y divide-gray-200">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-6 py-4">
                <div className="animate-pulse">
                  <div className="grid grid-cols-6 gap-4 items-center">
                    {/* ID */}
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                    
                    {/* Usuario con avatar */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    
                    {/* Nombre */}
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    
                    {/* Email */}
                    <div className="h-4 bg-gray-200 rounded w-40"></div>
                    
                    {/* Grupos */}
                    <div className="flex space-x-2">
                      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-12"></div>
                    </div>
                    
                    {/* Acciones */}
                    <div className="flex space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paginación Loading */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-48"></div>
              <div className="flex space-x-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-8 h-8 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const UserModalLoading = () => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-5">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          {/* Foto de perfil */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
          </div>

          {/* Campos del formulario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>

          {/* Grupos */}
          <div className="mt-6 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded-full w-20"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
        <div className="animate-pulse">
          <div className="flex justify-end space-x-3">
            <div className="h-10 bg-gray-200 rounded w-20"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const UserCardLoading = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
    <div className="animate-pulse">
      {/* Header con avatar y nombre */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>

      {/* Información del usuario */}
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>

      {/* Grupos */}
      <div className="flex flex-wrap gap-2">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full w-12"></div>
      </div>

      {/* Acciones */}
      <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
        <div className="w-8 h-8 bg-gray-200 rounded"></div>
        <div className="w-8 h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

// Estado vacío profesional para usuarios
const EmptyState = ({ 
  title = "No hay usuarios registrados",
  description = "Los usuarios aparecerán aquí cuando se registren en el sistema. Puedes agregar nuevos usuarios desde el panel de administración.",
  actionLabel = "Crear Usuario",
  onAction
}) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="p-16 text-center">
      {/* Ilustración moderna con icono de usuarios */}
      <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        {title}
      </h3>
      
      <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
        {description}
      </p>
      
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-slate-500 hover:bg-slate-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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

EmptyState.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func
};

/**
 * Estado de carga para procesamiento de archivos
 */
const ProcessingFile = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="relative">
      <svg className="animate-spin h-12 w-12 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    </div>
    <h3 className="mt-4 text-lg font-medium text-gray-900">Procesando archivo</h3>
    <p className="mt-2 text-sm text-gray-500">Analizando datos del Excel, por favor espere...</p>
  </div>
);

/**
 * Estado de importación en progreso
 */
const ImportingData = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="relative">
      <svg className="animate-spin h-12 w-12 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
    </div>
    <h3 className="mt-4 text-lg font-medium text-gray-900">Importando usuarios</h3>
    <p className="mt-2 text-sm text-gray-500">Guardando datos en el sistema, esto puede tomar unos momentos...</p>
  </div>
);

// Skeleton para lista de usuarios (igual que KnowledgeBase)
const UserListLoading = ({ count = 5 }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
      <div className="animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
    <div className="divide-y divide-gray-200">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="p-6 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Header del usuario */}
              <div className="flex items-center space-x-2 mb-3">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
              
              {/* Info del usuario */}
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
      ))}
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
    <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar usuarios</h3>
    <p className="text-gray-500 mb-6">
      No se pudieron cargar los usuarios. Por favor, inténtalo de nuevo.
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

const LoadingStates = {
  UsersLoading,
  UserModalLoading,
  UserCardLoading,
  UserListLoading,
  EmptyState,
  ErrorState,
  ProcessingFile,
  ImportingData
};

export default LoadingStates;