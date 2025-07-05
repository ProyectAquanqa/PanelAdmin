// ============================================================================
// 📊 COMPONENTE PARA MOSTRAR INFORMACIÓN DE DISPONIBILIDAD
// Muestra cupos disponibles y ocupados de manera visual
// ============================================================================

import React, { forwardRef } from 'react';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const AvailabilityDisplay = forwardRef(({
  availabilityInfo,
  availableTimeBlocks,
  loading,
  error,
  onChange,
  value,
}, ref) => {
  if (loading) {
    return (
      <div className="mt-4 flex items-center text-sm text-gray-500">
        <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
        Buscando horarios...
      </div>
    );
  }

  if (error) {
    const errorMessage = typeof error === 'object' && error.message ? error.message : 'Error al cargar la disponibilidad.';
    return <p className="text-sm text-red-600 mt-2">{errorMessage}</p>;
  }

  if (!availabilityInfo) {
    return <p className="text-sm text-gray-500 mt-2">Selecciona una fecha para ver la disponibilidad.</p>;
  }

  const { day_name, available_blocks_count, total_blocks } = availabilityInfo;

  return (
    <div ref={ref} className="mt-4 p-4 border rounded-lg bg-gray-50">
      <h4 className="font-semibold text-gray-800">
        Disponibilidad para {day_name}
      </h4>
      <p className="text-sm text-gray-600 mb-3">
        {available_blocks_count} de {total_blocks} bloques disponibles
      </p>

      {availableTimeBlocks && availableTimeBlocks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {availableTimeBlocks.map((block) => (
            <button
              key={block.id}
              type="button"
              onClick={() => onChange(block.id)}
              className={`p-2 border rounded-md text-center text-sm transition-colors ${
                value === block.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className="block font-medium">{block.name}</span>
              <span className="block text-xs">
                ({block.available_slots} cupos disponibles)
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-yellow-600">No hay horarios disponibles para este día.</p>
      )}
    </div>
  );
});

AvailabilityDisplay.displayName = 'AvailabilityDisplay';

export default AvailabilityDisplay;