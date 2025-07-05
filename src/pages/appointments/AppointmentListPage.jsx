import React, { useState } from 'react';
import { useGetAppointments } from '../../hooks/appointment';
import { useCancelAppointment, useCompleteAppointment } from '../../hooks/appointment/useAppointmentMutations';
import AppointmentFormModal from '../../components/appointments/AppointmentFormModal';
import MedicalRecordFormModal from '../../components/medical/MedicalRecordFormModal';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';

// Componentes refactorizados
import AppointmentHeader from '../../components/appointments/AppointmentHeader';
import AppointmentFilters from '../../components/appointments/AppointmentFilters';
import AppointmentTable from '../../components/appointments/AppointmentTable';
import AppointmentDetailsModal from '../../components/appointments/AppointmentDetailsModal';

/**
 * Página de listado de citas
 * @returns {JSX.Element} Página de listado de citas
 */
function AppointmentListPage() {
  const { theme } = useTheme();
  const cancelAppointmentMutation = useCancelAppointment();
  const completeAppointmentMutation = useCompleteAppointment();
  
  // Estado del modal de formulario de citas
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Estado del modal de detalles
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingAppointment, setViewingAppointment] = useState(null);

  // Estado del modal de historial médico
  const [isMedicalRecordModalOpen, setIsMedicalRecordModalOpen] = useState(false);
  const [appointmentForRecord, setAppointmentForRecord] = useState(null);

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

  // Manejadores de eventos del modal de formulario
  const handleOpenFormModal = (appointment = null) => {
    setSelectedAppointment(appointment);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedAppointment(null);
    refetch(); // Recargar datos después de cerrar el modal
  };
  
  // Manejadores de eventos del modal de detalles
  const handleOpenDetailsModal = (appointment) => {
    setViewingAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setViewingAppointment(null);
  };

  const handleOpenMedicalRecordModal = (appointment) => {
    setAppointmentForRecord(appointment);
    setIsMedicalRecordModalOpen(true);
  };

  const handleCloseMedicalRecordModal = () => {
    setIsMedicalRecordModalOpen(false);
    setAppointmentForRecord(null);
    refetch(); // Recargar citas por si el estado cambió
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
    handleOpenFormModal(appointment);
  };

  const handleCancelAppointment = (appointment) => {
    if (window.confirm(`¿Estás seguro de que deseas cancelar la cita #${appointment.id}? Esta acción no se puede deshacer.`)) {
      cancelAppointmentMutation.mutate({ id: appointment.id });
    }
  };

  const handleCompleteAppointment = (appointment) => {
    if (window.confirm(`¿Estás seguro de que deseas marcar la cita #${appointment.id} como completada?`)) {
      completeAppointmentMutation.mutate(appointment.id);
    }
  };

  const handleNoShowAppointment = (appointment) => {
    // Implementar lógica para marcar como no presentada
    toast.success(`Marcando cita ${appointment.id} como no presentada...`);
  };

  const handleViewAppointment = (appointment) => {
    handleOpenDetailsModal(appointment);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      {/* Encabezado */}
      <AppointmentHeader 
        onNewAppointment={() => handleOpenFormModal()} 
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
          onView={handleViewAppointment}
          onCreateMedicalRecord={handleOpenMedicalRecordModal}
          theme={theme}
            />
          </div>

      {/* Modal de formulario */}
      <AppointmentFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        appointment={selectedAppointment}
      />

      {/* Modal de historial médico */}
      {appointmentForRecord && (
        <MedicalRecordFormModal
          isOpen={isMedicalRecordModalOpen}
          onClose={handleCloseMedicalRecordModal}
          appointmentId={appointmentForRecord.id}
        />
      )}

      {/* Modal de detalles */}
      <AppointmentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        appointment={viewingAppointment}
      />
    </div>
  );
}

export default AppointmentListPage; 