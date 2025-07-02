import React from 'react';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

/**
 * Componente de badge de estado para citas
 * @param {Object} props - Propiedades del componente
 * @param {string} props.status - Estado de la cita (SCHEDULED, IN_CONSULTATION, COMPLETED, CANCELLED, NO_SHOW)
 * @param {string} props.theme - Tema actual ('dark' o 'light')
 * @returns {JSX.Element} Componente de badge de estado
 */
const AppointmentStatusBadge = ({ status, theme }) => {
  const darkMode = theme === 'dark';
  
  // Obtener el color según el estado
  const getStatusColor = () => {
    if (darkMode) {
      switch (status) {
        case 'SCHEDULED':
          return 'bg-blue-900/20 text-blue-400 border border-blue-500/20';
        case 'IN_CONSULTATION':
          return 'bg-green-900/20 text-green-400 border border-green-500/20';
        case 'COMPLETED':
          return 'bg-purple-900/20 text-purple-400 border border-purple-500/20';
        case 'CANCELLED':
          return 'bg-red-900/20 text-red-400 border border-red-500/20';
        case 'NO_SHOW':
          return 'bg-yellow-900/20 text-yellow-400 border border-yellow-500/20';
        default:
          return 'bg-neutral-900/20 text-neutral-400 border border-neutral-500/20';
      }
    } else {
      switch (status) {
        case 'SCHEDULED':
          return 'bg-blue-100 text-blue-800';
        case 'IN_CONSULTATION':
          return 'bg-green-100 text-green-800';
        case 'COMPLETED':
          return 'bg-purple-100 text-purple-800';
        case 'CANCELLED':
          return 'bg-red-100 text-red-800';
        case 'NO_SHOW':
          return 'bg-yellow-100 text-yellow-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
  };

  // Obtener el texto del estado
  const getStatusText = () => {
    switch (status) {
      case 'SCHEDULED':
        return 'Programada';
      case 'IN_CONSULTATION':
        return 'En consulta';
      case 'COMPLETED':
        return 'Completada';
      case 'CANCELLED':
        return 'Cancelada';
      case 'NO_SHOW':
        return 'No se presentó';
      default:
        return status;
    }
  };

  // Obtener el icono según el estado
  const getStatusIcon = () => {
    switch (status) {
      case 'SCHEDULED':
        return <ClockIcon className="h-4 w-4" />;
      case 'IN_CONSULTATION':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'CANCELLED':
        return <XCircleIcon className="h-4 w-4" />;
      case 'NO_SHOW':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
      <span className="mr-1">{getStatusIcon()}</span>
      {getStatusText()}
    </span>
  );
};

export default AppointmentStatusBadge; 