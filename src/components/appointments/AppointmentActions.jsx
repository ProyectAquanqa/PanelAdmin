import React from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  CheckIcon, 
  XMarkIcon,
  CalendarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

/**
 * Componente de acciones para citas
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.appointment - Datos de la cita
 * @param {Function} props.onEdit - Función para editar la cita
 * @param {Function} props.onCancel - Función para cancelar la cita
 * @param {Function} props.onComplete - Función para completar la cita
 * @param {Function} props.onNoShow - Función para marcar como no presentada
 * @param {Function} props.onView - Función para ver detalles de la cita
 * @param {boolean} props.isPast - Indica si la cita está en el pasado
 * @param {string} props.theme - Tema actual ('dark' o 'light')
 * @returns {JSX.Element} Componente de acciones
 */
const AppointmentActions = ({ 
  appointment, 
  onEdit, 
  onCancel, 
  onComplete, 
  onNoShow, 
  onView,
  isPast,
  theme 
}) => {
  const darkMode = theme === 'dark';
  const { status } = appointment;
  
  // Determinar qué acciones mostrar según el estado
  const canEdit = status === 'SCHEDULED';
  const canCancel = status === 'SCHEDULED';
  const canComplete = status === 'SCHEDULED' || status === 'IN_CONSULTATION';
  const canMarkNoShow = status === 'SCHEDULED' && isPast;
  
  // Clases para los botones
  const buttonClass = `p-1.5 rounded-md ${
    darkMode ? 'hover:bg-neutral-700' : 'hover:bg-gray-100'
  }`;
  
  return (
    <div className="flex space-x-1">
      {/* Ver detalles */}
      <button
        type="button"
        onClick={() => onView(appointment)}
        className={buttonClass}
        title="Ver detalles"
      >
        <EyeIcon className={`h-5 w-5 ${
          darkMode ? 'text-neutral-400' : 'text-gray-500'
        }`} />
      </button>
      
      {/* Editar */}
      {canEdit && (
        <button
          type="button"
          onClick={() => onEdit(appointment)}
          className={buttonClass}
          title="Editar cita"
        >
          <PencilIcon className={`h-5 w-5 ${
            darkMode ? 'text-blue-400' : 'text-blue-600'
          }`} />
        </button>
      )}
      
      {/* Cancelar */}
      {canCancel && (
        <button
          type="button"
          onClick={() => onCancel(appointment)}
          className={buttonClass}
          title="Cancelar cita"
        >
          <TrashIcon className={`h-5 w-5 ${
            darkMode ? 'text-red-400' : 'text-red-600'
          }`} />
        </button>
      )}
      
      {/* Completar */}
      {canComplete && (
        <button
          type="button"
          onClick={() => onComplete(appointment)}
          className={buttonClass}
          title="Marcar como completada"
        >
          <CheckIcon className={`h-5 w-5 ${
            darkMode ? 'text-green-400' : 'text-green-600'
          }`} />
        </button>
      )}
      
      {/* No se presentó */}
      {canMarkNoShow && (
        <button
          type="button"
          onClick={() => onNoShow(appointment)}
          className={buttonClass}
          title="Marcar como no presentado"
        >
          <XMarkIcon className={`h-5 w-5 ${
            darkMode ? 'text-yellow-400' : 'text-yellow-600'
          }`} />
        </button>
      )}
    </div>
  );
};

export default AppointmentActions; 