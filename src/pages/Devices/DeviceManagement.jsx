import React, { useState } from 'react';
import { 
  DeviceFilters, 
  DeviceList, 
  DeviceModal, 
  DeviceDetailModal 
} from '../../components/Devices';
import useDevices from '../../hooks/useDevices';
import useBreadcrumbs from '../../hooks/useBreadcrumbs';

/**
 * Página principal de gestión de dispositivos registrados
 * Sigue las pautas de desarrollo y arquitectura establecidas
 */
const DeviceManagement = () => {
  // Hook principal de dispositivos
  const {
    devices,
    deviceTypes,
    users,
    loading,
    error,
    filters,
    totalDevices,
    activeDevices,
    inactiveDevices,
    updateFilters,
    clearFilters,
    createDevice,
    updateDevice,
    deleteDevice,
    toggleDeviceStatus,
    bulkImportDevices,
    exportDevices,
    isCreateModalOpen,
    isEditModalOpen,
    isDetailModalOpen,
    selectedDevice,
    modalLoading,
    openCreateModal,
    openEditModal,
    openDetailModal,
    closeModals,
    refresh
  } = useDevices();

  // Estados locales (Modal de confirmación eliminado)

  // Configurar breadcrumbs
  useBreadcrumbs([
    { label: 'Inicio', path: '/' },
    { label: 'Notificaciones', path: '/notificaciones' },
    { label: 'Dispositivos Registrados', path: '/notificaciones/dispositivos' }
  ]);

  // Manejar filtros
  const handleSearchChange = (value) => {
    updateFilters({ search: value });
  };

  const handleTypeChange = (value) => {
    updateFilters({ type: value });
  };

  const handleStatusChange = (value) => {
    updateFilters({ status: value });
  };

  // Manejadores de acciones principales
  const handleCreateDevice = async (deviceData) => {
    await createDevice(deviceData);
    closeModals();
  };

  const handleUpdateDevice = async (deviceData) => {
    if (selectedDevice) {
      await updateDevice(selectedDevice.id, deviceData);
      closeModals();
    }
  };

  // Eliminación directa sin modal de confirmación
  const handleDeleteDevice = async (device) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el token de ${device.device_type}?`)) {
      await deleteDevice(device.id);
    }
  };

  const handleToggleStatus = async (id, newStatus) => {
    await toggleDeviceStatus(id, newStatus);
  };

  // Manejadores de acciones secundarias
  const handleBulkImport = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // bulkImportDevices(file);
      console.log('Importación de dispositivos deshabilitada');
    }
  };

  const handleExportData = async () => {
    try {
      await exportDevices('csv');
    } catch (error) {
      console.error('Error al exportar:', error);
    }
  };

  // Manejar edición desde modal de detalles
  const handleEditFromDetail = (device) => {
    closeModals();
    openEditModal(device);
  };

  return (
    <div className="space-y-6">
        {/* Filtros */}
        <DeviceFilters
          searchTerm={filters.search}
          onSearchChange={(value) => updateFilters({ search: value })}
          selectedType={filters.type}
          onTypeChange={(value) => updateFilters({ type: value })}
          selectedStatus={filters.status}
          onStatusChange={(value) => updateFilters({ status: value })}
          deviceTypes={deviceTypes}
          totalItems={totalDevices}
          onExportData={handleExportData}
        />

        {/* Lista de dispositivos */}
        <DeviceList
          devices={devices}
          loading={loading}
          error={error}
          totalItems={totalDevices}
          onEdit={openEditModal}
          onDelete={handleDeleteDevice}
          onViewDetails={openDetailModal}
          onToggleStatus={handleToggleStatus}
          onCreateFirst={openCreateModal}
          onRetry={refresh}
        />

        {/* Modal de creación */}
        <DeviceModal
          isOpen={isCreateModalOpen}
          onClose={closeModals}
          onSubmit={handleCreateDevice}
          deviceTypes={deviceTypes}
          users={users}
          loading={modalLoading}
        />

        {/* Modal de edición */}
        <DeviceModal
          isOpen={isEditModalOpen}
          onClose={closeModals}
          onSubmit={handleUpdateDevice}
          device={selectedDevice}
          deviceTypes={deviceTypes}
          users={users}
          loading={modalLoading}
        />

        {/* Modal de detalles */}
        <DeviceDetailModal
          isOpen={isDetailModalOpen}
          onClose={closeModals}
          device={selectedDevice}
          onEdit={handleEditFromDetail}
          onToggleStatus={handleToggleStatus}
        />

    </div>
  );
};

export default DeviceManagement;