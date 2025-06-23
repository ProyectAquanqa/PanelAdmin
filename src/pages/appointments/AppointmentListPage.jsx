import React, { useState } from 'react';
import { 
  CalendarIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useGetAppointments } from '../../hooks/useAppointments';
import AppointmentFormModal from '../../components/appointments/AppointmentFormModal';
import { format, parseISO, isBefore, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

function AppointmentListPage() {
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  const { data: appointmentsData, isLoading, isError, refetch } = useGetAppointments({
    search: searchTerm,
    status: statusFilter,
    date: dateFilter
  });

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = parseISO(dateString);
      return format(date, 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return dateString;
    }
  };

  // Función para obtener el color según el estado
  const getStatusColor = (status) => {
    if (theme === 'dark') {
      switch (status) {
        case 'SCHEDULED':
          return 'bg-blue-900/20 text-blue-400 border border-blue-500/20';
        case 'CONFIRMED':
          return 'bg-green-900/20 text-green-400 border border-green-500/20';
        case 'COMPLETED':
          return 'bg-purple-900/20 text-purple-400 border border-purple-500/20';
        case 'CANCELLED':
          return 'bg-red-900/20 text-red-400 border border-red-500/20';
        case 'NO_SHOW':
          return 'bg-yellow-900/20 text-yellow-400 border border-yellow-500/20';
        case 'RESCHEDULED':
          return 'bg-orange-900/20 text-orange-400 border border-orange-500/20';
        default:
          return 'bg-neutral-900/20 text-neutral-400 border border-neutral-500/20';
      }
    } else {
      switch (status) {
        case 'SCHEDULED':
          return 'bg-blue-100 text-blue-800';
        case 'CONFIRMED':
          return 'bg-green-100 text-green-800';
        case 'COMPLETED':
          return 'bg-purple-100 text-purple-800';
        case 'CANCELLED':
          return 'bg-red-100 text-red-800';
        case 'NO_SHOW':
          return 'bg-yellow-100 text-yellow-800';
        case 'RESCHEDULED':
          return 'bg-orange-100 text-orange-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
  };

  // Función para obtener el texto del estado
  const getStatusText = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Programada';
      case 'CONFIRMED':
        return 'Confirmada';
      case 'COMPLETED':
        return 'Completada';
      case 'CANCELLED':
        return 'Cancelada';
      case 'NO_SHOW':
        return 'No se presentó';
      case 'RESCHEDULED':
        return 'Reprogramada';
      default:
        return status;
    }
  };

  // Función para obtener el icono según el estado
  const getStatusIcon = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return <ClockIcon className="h-5 w-5" />;
      case 'CONFIRMED':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'COMPLETED':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'CANCELLED':
        return <XCircleIcon className="h-5 w-5" />;
      case 'NO_SHOW':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'RESCHEDULED':
        return <ArrowPathIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };

  // Función para determinar si una cita está en el pasado
  const isAppointmentPast = (dateString, timeString) => {
    if (!dateString || !timeString) return false;
    
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const appointmentDate = parseISO(dateString);
      const appointmentDateTime = new Date(
        appointmentDate.getFullYear(),
        appointmentDate.getMonth(),
        appointmentDate.getDate(),
        hours,
        minutes
      );
      
      return isBefore(appointmentDateTime, new Date());
    } catch (error) {
      console.error('Error al verificar si la cita es pasada:', error);
      return false;
    }
  };

  // Función para determinar si una cita es hoy
  const isAppointmentToday = (dateString) => {
    if (!dateString) return false;
    
    try {
      const appointmentDate = parseISO(dateString);
      const today = startOfToday();
      
      return (
        appointmentDate.getDate() === today.getDate() &&
        appointmentDate.getMonth() === today.getMonth() &&
        appointmentDate.getFullYear() === today.getFullYear()
      );
    } catch (error) {
      console.error('Error al verificar si la cita es hoy:', error);
      return false;
    }
  };

  const handleOpenModal = (appointment = null) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
    refetch(); // Recargar datos después de cerrar el modal
  };

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFilter('');
    refetch();
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${
          theme === 'dark' 
            ? 'bg-neutral-800 border-neutral-700' 
            : 'bg-white border-gray-200'
        } shadow-sm border rounded-xl p-6 mb-6`}
      >
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-2xl font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            } flex items-center`}>
              <CalendarIcon className="h-7 w-7 text-primary-600 mr-3" />
              Citas Médicas
            </h1>
            <p className={`mt-2 text-sm ${
              theme === 'dark' ? 'text-neutral-400' : 'text-gray-700'
            }`}>
              Gestiona las citas médicas del hospital
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => handleOpenModal()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 transition-all duration-200"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Nueva Cita
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filtros y búsqueda */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`${
          theme === 'dark' 
            ? 'bg-neutral-800 border-neutral-700' 
            : 'bg-white border-gray-200'
        } shadow-sm border rounded-xl p-4 mb-6`}
      >
        <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Búsqueda por texto */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className={`h-5 w-5 ${
                theme === 'dark' ? 'text-neutral-400' : 'text-gray-400'
              }`} aria-hidden="true" />
            </div>
            <input
              type="text"
              className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:ring-primary-600 focus:border-primary-600 sm:text-sm transition-colors ${
                theme === 'dark' 
                  ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Buscar por paciente o doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtro por estado */}
          <div>
            <select
              className={`block w-full px-3 py-2 border rounded-md focus:ring-primary-600 focus:border-primary-600 sm:text-sm transition-colors ${
                theme === 'dark' 
                  ? 'bg-neutral-700 border-neutral-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="">Todos los estados</option>
              <option value="SCHEDULED">Programada</option>
              <option value="CONFIRMED">Confirmada</option>
              <option value="COMPLETED">Completada</option>
              <option value="CANCELLED">Cancelada</option>
              <option value="NO_SHOW">No se presentó</option>
              <option value="RESCHEDULED">Reprogramada</option>
            </select>
          </div>

          {/* Filtro por fecha */}
          <div>
            <input
              type="date"
              className={`block w-full px-3 py-2 border rounded-md focus:ring-primary-600 focus:border-primary-600 sm:text-sm transition-colors ${
                theme === 'dark' 
                  ? 'bg-neutral-700 border-neutral-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              value={dateFilter}
              onChange={handleDateFilterChange}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 transition-all duration-200"
            >
              Buscar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleClearFilters}
              className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors ${
                theme === 'dark' 
                  ? 'border-neutral-600 text-neutral-300 bg-neutral-800 hover:bg-neutral-700' 
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Limpiar
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Tabla de citas */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`${
          theme === 'dark' 
            ? 'bg-neutral-800 border-neutral-700' 
            : 'bg-white border-gray-200'
        } shadow-sm border rounded-xl overflow-hidden`}
      >
        {isLoading ? (
          <div className="p-8 text-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center space-y-3"
            >
              <div className="w-12 h-12 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
              <p className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>
                Cargando citas...
              </p>
            </motion.div>
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${
                theme === 'dark' 
                  ? 'bg-red-900/20 border-red-500/20 text-red-400' 
                  : 'bg-red-50 border-red-200 text-red-700'
              } border p-6 rounded-xl inline-block mx-auto`}
            >
              <div className="flex">
                <XCircleIcon className="h-12 w-12 mx-auto text-red-500" />
                <div className="ml-3">
                  <p className="mt-4 text-center">Error al cargar las citas. Intenta de nuevo más tarde.</p>
                  <div className="mt-4 flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={refetch}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 transition-all duration-200"
                    >
                      <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                      Reintentar
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : appointmentsData?.results?.length === 0 ? (
          <div className="p-8 text-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <CalendarIcon className={`h-12 w-12 mb-4 ${
                theme === 'dark' ? 'text-neutral-600' : 'text-gray-300'
              }`} />
              <h3 className={`text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-neutral-300' : 'text-gray-900'
              }`}>
                No se encontraron citas con los filtros seleccionados.
              </h3>
              {(searchTerm || statusFilter || dateFilter) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearFilters}
                  className={`mt-4 inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                    theme === 'dark' 
                      ? 'border-neutral-600 text-neutral-300 bg-neutral-800 hover:bg-neutral-700' 
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  Limpiar filtros
                </motion.button>
              )}
            </motion.div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className={theme === 'dark' ? 'bg-neutral-900' : 'bg-gray-50'}>
                <tr>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                  }`}>
                    Paciente
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                  }`}>
                    Doctor
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                  }`}>
                    Especialidad
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                  }`}>
                    Fecha y Hora
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                  }`}>
                    Estado
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                  }`}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                theme === 'dark' 
                  ? 'bg-neutral-800 divide-neutral-700' 
                  : 'bg-white divide-gray-200'
              }`}>
                {appointmentsData?.results?.map((appointment, index) => {
                  const isPast = isAppointmentPast(appointment.appointment_date, appointment.start_time);
                  const isToday = isAppointmentToday(appointment.appointment_date);
                  
                  return (
                    <motion.tr 
                      key={appointment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`transition-colors ${
                        theme === 'dark' 
                          ? isToday ? 'bg-blue-900/10' : isPast ? 'bg-neutral-700/30' : 'hover:bg-neutral-700'
                          : isToday ? 'bg-blue-50' : isPast ? 'bg-gray-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {appointment.patient_name || 'Paciente no especificado'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${
                          theme === 'dark' ? 'text-neutral-300' : 'text-gray-900'
                        }`}>
                          {appointment.doctor_name || 'Doctor no especificado'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${
                          theme === 'dark' ? 'text-neutral-300' : 'text-gray-900'
                        }`}>
                          {appointment.specialty_name || 'Especialidad no especificada'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {formatDate(appointment.appointment_date)}
                        </div>
                        <div className={`text-sm ${
                          theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'
                        }`}>
                          {appointment.start_time || 'Sin hora'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1">{getStatusText(appointment.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleOpenModal(appointment)}
                          className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark' 
                              ? 'text-primary-400 hover:text-primary-300 hover:bg-primary-900/20' 
                              : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50'
                          }`}
                          title="Editar cita"
                        >
                          Editar
                        </motion.button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Paginación (simplificada) */}
      {appointmentsData && appointmentsData.count > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex justify-between items-center"
        >
          <div className={`text-sm ${
            theme === 'dark' ? 'text-neutral-400' : 'text-gray-700'
          }`}>
            Mostrando <span className="font-medium">{appointmentsData.results.length}</span> de{' '}
            <span className="font-medium">{appointmentsData.count}</span> citas
          </div>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!appointmentsData.previous}
              className={`px-3 py-1 border rounded-md text-sm ${
                appointmentsData.previous
                  ? theme === 'dark'
                    ? 'border-neutral-600 bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  : theme === 'dark'
                    ? 'border-neutral-700 bg-neutral-800 text-neutral-600 cursor-not-allowed'
                    : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Anterior
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!appointmentsData.next}
              className={`px-3 py-1 border rounded-md text-sm ${
                appointmentsData.next
                  ? theme === 'dark'
                    ? 'border-neutral-600 bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  : theme === 'dark'
                    ? 'border-neutral-700 bg-neutral-800 text-neutral-600 cursor-not-allowed'
                    : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Siguiente
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Modal de formulario */}
      <AppointmentFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        appointment={selectedAppointment}
      />
    </div>
  );
}

export default AppointmentListPage; 