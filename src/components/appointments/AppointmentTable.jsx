import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppointmentStatusBadge from './AppointmentStatusBadge';
import AppointmentActions from './AppointmentActions';
import { formatDate, isTimeBlockPast } from '../../utils/dateUtils';

/**
 * Componente de tabla para la página de citas
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.appointments - Lista de citas
 * @param {boolean} props.isLoading - Indica si está cargando
 * @param {boolean} props.isError - Indica si hay error
 * @param {Function} props.onEdit - Función para editar una cita
 * @param {Function} props.onCancel - Función para cancelar una cita
 * @param {Function} props.onComplete - Función para completar una cita
 * @param {Function} props.onNoShow - Función para marcar como no presentada
 * @param {Function} props.onReschedule - Función para reprogramar una cita
 * @param {Function} props.onView - Función para ver detalles de una cita
 * @param {string} props.theme - Tema actual ('dark' o 'light')
 * @returns {JSX.Element} Componente de tabla
 */
const AppointmentTable = ({ 
  appointments,
  isLoading,
  isError,
  onEdit,
  onCancel,
  onComplete,
  onNoShow,
  onReschedule,
  onView,
  theme
}) => {
  const darkMode = theme === 'dark';

  // Función para obtener el texto del bloque horario
  const getTimeBlockText = (timeBlock) => {
    switch (timeBlock) {
      case 'MORNING':
        return 'Mañana (8:00 - 12:00)';
      case 'AFTERNOON':
        return 'Tarde (14:00 - 18:00)';
      default:
        return timeBlock || 'No especificado';
    }
  };

  // Si está cargando, mostrar mensaje
  if (isLoading) {
    return (
      <div className={`flex justify-center items-center py-12 ${
        darkMode ? 'text-neutral-400' : 'text-gray-500'
      }`}>
        <svg className="animate-spin h-8 w-8 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Cargando citas...
      </div>
    );
  }

  // Si hay error, mostrar mensaje
  if (isError) {
    return (
      <div className={`flex justify-center items-center py-12 ${
        darkMode ? 'text-red-400' : 'text-red-500'
      }`}>
        <svg className="h-8 w-8 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Error al cargar las citas. Por favor, intente nuevamente.
      </div>
    );
  }

  // Si no hay citas, mostrar mensaje
  if (!appointments || appointments.length === 0) {
    return (
      <div className={`flex justify-center items-center py-12 ${
        darkMode ? 'text-neutral-400' : 'text-gray-500'
      }`}>
        No se encontraron citas con los filtros aplicados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y ${
        darkMode ? 'divide-neutral-700' : 'divide-gray-200'
      }`}>
        <thead className={darkMode ? 'bg-neutral-800' : 'bg-gray-50'}>
          <tr>
            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
              darkMode ? 'text-neutral-400' : 'text-gray-500'
            } uppercase tracking-wider`}>
              Paciente
            </th>
            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
              darkMode ? 'text-neutral-400' : 'text-gray-500'
            } uppercase tracking-wider`}>
              Doctor
            </th>
            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
              darkMode ? 'text-neutral-400' : 'text-gray-500'
            } uppercase tracking-wider`}>
              Especialidad
            </th>
            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
              darkMode ? 'text-neutral-400' : 'text-gray-500'
            } uppercase tracking-wider`}>
              Fecha
            </th>
            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
              darkMode ? 'text-neutral-400' : 'text-gray-500'
            } uppercase tracking-wider`}>
              Horario
            </th>
            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
              darkMode ? 'text-neutral-400' : 'text-gray-500'
            } uppercase tracking-wider`}>
              Estado
            </th>
            <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${
              darkMode ? 'text-neutral-400' : 'text-gray-500'
            } uppercase tracking-wider`}>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className={`${
          darkMode ? 'bg-neutral-900 divide-y divide-neutral-800' : 'bg-white divide-y divide-gray-200'
        }`}>
          <AnimatePresence>
            {appointments.map((appointment) => {
              const isPast = isTimeBlockPast(appointment.appointment_date, appointment.time_block);
              
              return (
                <motion.tr 
                  key={appointment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`${
                    darkMode 
                      ? isPast ? 'bg-neutral-900/50' : ''
                      : isPast ? 'bg-gray-50' : ''
                  }`}
                >
                  {/* Paciente */}
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    darkMode ? 'text-neutral-300' : 'text-gray-900'
                  }`}>
                    {appointment.patient?.full_name || 
                     (appointment.patient?.first_name && appointment.patient?.last_name 
                      ? `${appointment.patient.first_name} ${appointment.patient.last_name}`
                      : `Paciente #${appointment.patient?.id || appointment.patient}`)}
                  </td>
                  
                  {/* Doctor */}
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    darkMode ? 'text-neutral-300' : 'text-gray-900'
                  }`}>
                    {appointment.doctor?.full_name || 
                     (appointment.doctor?.first_name && appointment.doctor?.last_name 
                      ? `${appointment.doctor.first_name} ${appointment.doctor.last_name}`
                      : `Doctor #${appointment.doctor?.id || appointment.doctor}`)}
                  </td>
                  
                  {/* Especialidad */}
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    darkMode ? 'text-neutral-300' : 'text-gray-900'
                  }`}>
                    {appointment.specialty?.name || `Especialidad #${appointment.specialty?.id || appointment.specialty}`}
                  </td>
                  
                  {/* Fecha */}
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    darkMode ? 'text-neutral-300' : 'text-gray-900'
                  }`}>
                    {formatDate(appointment.appointment_date)}
                  </td>
                  
                  {/* Horario */}
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    darkMode ? 'text-neutral-300' : 'text-gray-900'
                  }`}>
                    {getTimeBlockText(appointment.time_block)}
                  </td>
                  
                  {/* Estado */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AppointmentStatusBadge status={appointment.status} theme={theme} />
                  </td>
                  
                  {/* Acciones */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <AppointmentActions 
                      appointment={appointment}
                      onEdit={onEdit}
                      onCancel={onCancel}
                      onComplete={onComplete}
                      onNoShow={onNoShow}
                      onReschedule={onReschedule}
                      onView={onView}
                      isPast={isPast}
                      theme={theme}
                    />
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentTable; 