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

function AppointmentListPage() {
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
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Citas Médicas</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestiona las citas médicas del hospital
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#033662] hover:bg-[#022b4f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#033662]"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Nueva Cita
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="mt-6 bg-white shadow rounded-lg p-4">
        <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Búsqueda por texto */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#033662] focus:border-[#033662] sm:text-sm"
              placeholder="Buscar por paciente o doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtro por estado */}
          <div>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#033662] focus:border-[#033662] sm:text-sm"
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
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#033662] focus:border-[#033662] sm:text-sm"
              value={dateFilter}
              onChange={handleDateFilterChange}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-2">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#033662] hover:bg-[#022b4f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#033662]"
            >
              Buscar
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#033662]"
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de citas */}
      <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#033662] mx-auto"></div>
            <p className="mt-4 text-gray-500">Cargando citas...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <XCircleIcon className="h-12 w-12 text-red-500 mx-auto" />
            <p className="mt-4 text-red-500">Error al cargar las citas. Intenta de nuevo más tarde.</p>
            <button
              onClick={refetch}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#033662] hover:bg-[#022b4f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#033662]"
            >
              <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Reintentar
            </button>
          </div>
        ) : appointmentsData?.results?.length === 0 ? (
          <div className="p-8 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="mt-4 text-gray-500">No se encontraron citas con los filtros seleccionados.</p>
            {(searchTerm || statusFilter || dateFilter) && (
              <button
                onClick={handleClearFilters}
                className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#033662]"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especialidad
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha y Hora
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointmentsData?.results?.map((appointment) => {
                  const isPast = isAppointmentPast(appointment.appointment_date, appointment.start_time);
                  const isToday = isAppointmentToday(appointment.appointment_date);
                  
                  return (
                    <tr 
                      key={appointment.id}
                      className={`hover:bg-gray-50 ${
                        isToday ? 'bg-blue-50' : isPast ? 'bg-gray-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.patient_name || 'Paciente no especificado'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.doctor_name || 'Doctor no especificado'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.specialty_name || 'Especialidad no especificada'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(appointment.appointment_date)}
                        </div>
                        <div className="text-sm text-gray-500">
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
                        <button
                          onClick={() => handleOpenModal(appointment)}
                          className="text-[#033662] hover:text-[#022b4f]"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación (simplificada) */}
      {appointmentsData && appointmentsData.count > 0 && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{appointmentsData.results.length}</span> de{' '}
            <span className="font-medium">{appointmentsData.count}</span> citas
          </div>
          <div className="flex space-x-2">
            <button
              disabled={!appointmentsData.previous}
              className={`px-3 py-1 border rounded-md text-sm ${
                appointmentsData.previous
                  ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Anterior
            </button>
            <button
              disabled={!appointmentsData.next}
              className={`px-3 py-1 border rounded-md text-sm ${
                appointmentsData.next
                  ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Siguiente
            </button>
          </div>
        </div>
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