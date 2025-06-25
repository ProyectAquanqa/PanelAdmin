// ============================================================================
// 📊 COMPONENTE PARA MOSTRAR INFORMACIÓN DE DISPONIBILIDAD
// Muestra cupos disponibles y ocupados de manera visual
// ============================================================================

import React from 'react';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const AvailabilityDisplay = ({
  availabilityInfo,
  availableTimeBlocks,
  selectedTimeBlock,
  className = ""
}) => {
  if (!availabilityInfo && (!availableTimeBlocks || availableTimeBlocks.length === 0)) {
    return null;
  }

  // Función para obtener el color según el porcentaje de ocupación
  const getOccupancyColor = (occupied, total) => {
    if (total === 0) return 'text-gray-500';
    const percentage = (occupied / total) * 100;
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Función para obtener la barra de progreso
  const getProgressBar = (occupied, total) => {
    if (total === 0) return null;
    const percentage = (occupied / total) * 100;
    let colorClass = 'bg-green-500';
    if (percentage >= 50) colorClass = 'bg-yellow-500';
    if (percentage >= 80) colorClass = 'bg-red-500';

    return (
      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    );
  };

  return (
    <div className={`bg-slate-50 border border-slate-200 rounded-lg p-4 ${className}`}>
      {/* Header con información general */}
      {availabilityInfo && (
        <div className="flex items-center gap-2 mb-3">
          <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-slate-700">
            Disponibilidad para {availabilityInfo.day_name}
          </span>
          {availabilityInfo.available_blocks_count !== undefined && (
            <span className="ml-auto text-sm text-slate-500">
              {availabilityInfo.available_blocks_count} de {availabilityInfo.total_blocks} bloques disponibles
            </span>
          )}
        </div>
      )}

      {/* Lista de bloques horarios disponibles */}
      {availableTimeBlocks && availableTimeBlocks.length > 0 ? (
        <div className="space-y-3">
          {availableTimeBlocks.map((block) => {
            const isSelected = selectedTimeBlock === block.id;
            const hasDetailedInfo = block.max_patients && block.available_slots !== null;
            
            return (
              <div
                key={block.id}
                className={`
                  border rounded-lg p-3 transition-all duration-200
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-sm' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-slate-600" />
                    <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                      {block.name}
                    </span>
                    {isSelected && (
                      <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  
                  {hasDetailedInfo && (
                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="w-4 h-4 text-slate-500" />
                      <span className={`text-sm font-medium ${getOccupancyColor(block.occupied_slots, block.max_patients)}`}>
                        {block.available_slots} disponibles
                      </span>
                    </div>
                  )}
                </div>

                {/* Información detallada si está disponible */}
                {hasDetailedInfo && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>Ocupados: {block.occupied_slots}</span>
                      <span>Total: {block.max_patients}</span>
                    </div>
                    {getProgressBar(block.occupied_slots, block.max_patients)}
                  </div>
                )}

                {/* Indicador visual del estado */}
                {hasDetailedInfo && (
                  <div className="flex items-center gap-1 mt-2">
                    {block.available_slots > 3 ? (
                      <>
                        <CheckCircleIcon className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600">Buena disponibilidad</span>
                      </>
                    ) : block.available_slots > 0 ? (
                      <>
                        <ExclamationTriangleIcon className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-yellow-600">Pocos cupos disponibles</span>
                      </>
                    ) : (
                      <>
                        <ExclamationTriangleIcon className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-red-600">Sin cupos disponibles</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Mensaje cuando no hay bloques disponibles */
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <InformationCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800">Sin horarios disponibles</p>
            <p className="text-yellow-700">
              {availabilityInfo?.message || 'No hay bloques horarios disponibles para esta fecha.'}
            </p>
          </div>
        </div>
      )}

      {/* Debug info (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && availabilityInfo?.debug && (
        <details className="mt-3">
          <summary className="text-xs text-slate-500 cursor-pointer">Debug Info</summary>
          <pre className="text-xs text-slate-400 mt-1 bg-slate-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(availabilityInfo.debug, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default AvailabilityDisplay;