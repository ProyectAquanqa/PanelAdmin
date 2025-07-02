import React, { useState } from 'react';
import { useGetAppointments } from '../../hooks/appointment';
import AppointmentFormModal from '../../components/appointments/AppointmentFormModal';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';

// Componentes refactorizados
import AppointmentHeader from '../../components/appointments/AppointmentHeader';
import AppointmentFilters from '../../components/appointments/AppointmentFilters';
import AppointmentTable from '../../components/appointments/AppointmentTable';

/**
 * Página de listado de citas
 * @returns {JSX.Element} Página de listado de citas
 */
function AppointmentListPage() {
  const { theme } = useTheme();
  
  // Estado del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Estado de los filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Consulta de citas
  const { 
    data: appointmentsData, 
    isLoading, 
    isError, 
    refetch 
  } = useGetAppointments({
    search: searchTerm,
    status: statusFilter,
    date: dateFilter
  });

  // Manejadores de eventos
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

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFilter('');
    refetch();
  };

  // Manejadores de acciones de citas
  const handleEditAppointment = (appointment) => {
    handleOpenModal(appointment);
  };

  const handleCancelAppointment = (appointment) => {
    // Implementar lógica para cancelar cita
    toast.success(`Cancelando cita ${appointment.id}...`);
  };

  const handleCompleteAppointment = (appointment) => {
    // Implementar lógica para completar cita
    toast.success(`Completando cita ${appointment.id}...`);
  };

  const handleNoShowAppointment = (appointment) => {
    // Implementar lógica para marcar como no presentada
    toast.success(`Marcando cita ${appointment.id} como no presentada...`);
  };

  const handleRescheduleAppointment = (appointment) => {
    // Implementar lógica para reprogramar cita
    toast.success(`Reprogramando cita ${appointment.id}...`);
  };

  const handleViewAppointment = (appointment) => {
    // Implementar lógica para ver detalles
    toast.success(`Ver detalles de cita ${appointment.id}...`);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      {/* Encabezado */}
      <AppointmentHeader 
        onNewAppointment={() => handleOpenModal()} 
        theme={theme} 
      />
      
      {/* Filtros */}
      <AppointmentFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        handleSearch={handleSearch}
        handleClearFilters={handleClearFilters}
        theme={theme}
      />
      
      {/* Tabla */}
      <div className={`${
          theme === 'dark' 
            ? 'bg-neutral-800 border-neutral-700' 
            : 'bg-white border-gray-200'
      } shadow-sm border rounded-xl overflow-hidden`}>
        <AppointmentTable 
          appointments={appointmentsData?.results || []}
          isLoading={isLoading}
          isError={isError}
          onEdit={handleEditAppointment}
          onCancel={handleCancelAppointment}
          onComplete={handleCompleteAppointment}
          onNoShow={handleNoShowAppointment}
          onReschedule={handleRescheduleAppointment}
          onView={handleViewAppointment}
          theme={theme}
            />
          </div>

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