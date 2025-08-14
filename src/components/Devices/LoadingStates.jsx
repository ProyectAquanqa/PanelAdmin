import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componentes de estados de carga para el módulo de dispositivos
 * Incluye estados de carga, error y vacío
 */

// Estado de carga para la lista de dispositivos
const DeviceListLoading = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((index) => (
      <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
            <div className="h-5 bg-gray-200 rounded w-16"></div>
          </div>

          {/* Información del dispositivo */}
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item}>
                <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>

          {/* Usuario */}
          <div className="p-2 bg-gray-50 rounded-md">
            <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>

          {/* Última actividad */}
          <div className="h-3 bg-gray-200 rounded w-40"></div>

          {/* Acciones */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="flex gap-1">
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Estado de error
const ErrorState = ({ onRetry }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
    <div className="w-16 h-16 mx-auto mb-4 text-red-500">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar dispositivos</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      Ha ocurrido un problema al cargar la lista de dispositivos. Por favor, verifica tu conexión e inténtalo nuevamente.
    </p>
    <button
      onClick={onRetry}
      className="inline-flex items-center gap-2 px-4 py-2 bg-[#2D728F] text-white rounded-lg hover:bg-[#2D728F]/90 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Reintentar
    </button>
  </div>
);

// Estado vacío
const EmptyState = ({ onCreateFirst }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
    <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay dispositivos registrados</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      Comienza registrando el primer dispositivo en el sistema. Puedes crear uno nuevo o importar una lista de dispositivos.
    </p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <button
        onClick={onCreateFirst}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#2D728F] text-white rounded-lg hover:bg-[#2D728F]/90 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Registrar primer dispositivo
      </button>
    </div>
  </div>
);

// Estado de carga del modal
const ModalLoading = () => (
  <div className="space-y-4 animate-pulse">
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-32"></div>
      <div className="h-24 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// PropTypes
ErrorState.propTypes = {
  onRetry: PropTypes.func
};

EmptyState.propTypes = {
  onCreateFirst: PropTypes.func
};

const LoadingStates = {
  DeviceListLoading,
  ErrorState,
  EmptyState,
  ModalLoading
};

export default LoadingStates;
