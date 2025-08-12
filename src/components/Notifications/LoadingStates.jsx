import React from 'react';

/**
 * Estados de carga para el módulo de notificaciones
 * Sigue el patrón de LoadingStates de KnowledgeBase
 */

// Shimmer effect para carga
const Shimmer = ({ className = '' }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`}></div>
);

// Loading para lista de notificaciones
const NotificationListLoading = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="space-y-4">
      {/* Header simulado */}
      <div className="flex items-center justify-between mb-6">
        <Shimmer className="h-4 w-32" />
        <Shimmer className="h-8 w-20" />
      </div>
      
      {/* Items de notificaciones simulados */}
      {[1, 2, 3, 4, 5].map((index) => (
        <div key={index} className="border border-gray-100 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              {/* Título y badge de tipo */}
              <div className="flex items-center gap-3">
                <Shimmer className="h-5 w-48" />
                <Shimmer className="h-5 w-16 rounded-full" />
              </div>
              
              {/* Mensaje */}
              <div className="space-y-2">
                <Shimmer className="h-4 w-full" />
                <Shimmer className="h-4 w-3/4" />
              </div>
              
              {/* Metadatos */}
              <div className="flex items-center gap-4">
                <Shimmer className="h-3 w-24" />
                <Shimmer className="h-3 w-20" />
                <Shimmer className="h-3 w-28" />
              </div>
            </div>
            
            {/* Acciones */}
            <div className="flex items-center gap-2 ml-4">
              <Shimmer className="h-8 w-8 rounded" />
              <Shimmer className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Loading para modal de notificación
const NotificationModalLoading = () => (
  <div className="space-y-6">
    {/* Título */}
    <div className="space-y-2">
      <Shimmer className="h-4 w-20" />
      <Shimmer className="h-10 w-full" />
    </div>
    
    {/* Mensaje */}
    <div className="space-y-2">
      <Shimmer className="h-4 w-16" />
      <Shimmer className="h-24 w-full" />
    </div>
    
    {/* Tipo y destinatario */}
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Shimmer className="h-4 w-12" />
        <Shimmer className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Shimmer className="h-4 w-20" />
        <Shimmer className="h-10 w-full" />
      </div>
    </div>
    
    {/* Botones */}
    <div className="flex justify-end gap-3 pt-4">
      <Shimmer className="h-10 w-20" />
      <Shimmer className="h-10 w-24" />
    </div>
  </div>
);

// Loading para estadísticas
const NotificationStatsLoading = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((index) => (
      <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Shimmer className="h-8 w-8 rounded" />
            <Shimmer className="h-4 w-16" />
          </div>
          <Shimmer className="h-8 w-20" />
          <Shimmer className="h-3 w-24" />
        </div>
      </div>
    ))}
  </div>
);

// Loading para tabla de dispositivos
const DeviceTableLoading = () => (
  <div className="bg-white rounded-lg border border-gray-200">
    {/* Header de tabla */}
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="grid grid-cols-5 gap-4">
        <Shimmer className="h-4 w-20" />
        <Shimmer className="h-4 w-16" />
        <Shimmer className="h-4 w-24" />
        <Shimmer className="h-4 w-16" />
        <Shimmer className="h-4 w-20" />
      </div>
    </div>
    
    {/* Filas de tabla */}
    {[1, 2, 3, 4, 5].map((index) => (
      <div key={index} className="px-6 py-4 border-b border-gray-100">
        <div className="grid grid-cols-5 gap-4 items-center">
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-5 w-16 rounded-full" />
          <Shimmer className="h-4 w-32" />
          <Shimmer className="h-5 w-12 rounded-full" />
          <div className="flex gap-2">
            <Shimmer className="h-8 w-8 rounded" />
            <Shimmer className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Loading para formulario de broadcast
const BroadcastFormLoading = () => (
  <div className="space-y-6">
    {/* Título */}
    <div className="space-y-2">
      <Shimmer className="h-4 w-28" />
      <Shimmer className="h-10 w-full" />
    </div>
    
    {/* Mensaje */}
    <div className="space-y-2">
      <Shimmer className="h-4 w-20" />
      <Shimmer className="h-32 w-full" />
    </div>
    
    {/* Opciones adicionales */}
    <div className="space-y-4">
      <Shimmer className="h-6 w-40" />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Shimmer className="h-4 w-16" />
          <Shimmer className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Shimmer className="h-4 w-20" />
          <Shimmer className="h-10 w-full" />
        </div>
      </div>
    </div>
    
    {/* Botones */}
    <div className="flex justify-end gap-3 pt-4">
      <Shimmer className="h-10 w-20" />
      <Shimmer className="h-10 w-28" />
    </div>
  </div>
);

// Loading inline para acciones
const InlineLoading = ({ message = 'Cargando...' }) => (
  <div className="flex items-center justify-center py-8">
    <div className="flex items-center space-x-3">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#2D728F]"></div>
      <span className="text-[13px] text-gray-600">{message}</span>
    </div>
  </div>
);

// Loading para botones
const ButtonLoading = ({ size = 'default' }) => {
  const sizeClasses = {
    small: 'h-3 w-3',
    default: 'h-4 w-4',
    large: 'h-5 w-5'
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-current ${sizeClasses[size]}`}></div>
  );
};

// Exportar todos los estados de carga
const LoadingStates = {
  NotificationListLoading,
  NotificationModalLoading,
  NotificationStatsLoading,
  DeviceTableLoading,
  BroadcastFormLoading,
  InlineLoading,
  ButtonLoading,
  Shimmer
};

export default LoadingStates;
