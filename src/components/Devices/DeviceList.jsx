import React from 'react';
import PropTypes from 'prop-types';
import { DataViewSwitcher } from '../Common';
import { LoadingStates } from '.';

/**
 * Componente contenedor para la lista de dispositivos
 * Maneja los diferentes estados y la vista de datos
 */
const DeviceList = ({
  devices,
  loading,
  error,
  totalItems,
  onEdit,
  onDelete,
  onViewDetails,
  onToggleStatus,
  onCreateFirst,
  onRetry
}) => {
  // Si está cargando y no hay datos
  if (loading && !devices?.length) {
    return <LoadingStates.DeviceListLoading />;
  }

  // Si hay error
  if (error) {
    return <LoadingStates.ErrorState onRetry={onRetry} />;
  }

  // Si no hay datos
  if (!devices?.length) {
    return <LoadingStates.EmptyState onCreateFirst={onCreateFirst} />;
  }

  // Función para manejar ordenamiento
  const handleSort = (field, direction) => {
    // Por ahora el ordenamiento se hace en el componente DataViewSwitcher
    // En el futuro podríamos llamar al backend para ordenamiento del servidor
    console.log(`Ordenando por ${field} en dirección ${direction}`);
  };

  return (
    <div className="space-y-6">
      <DataViewSwitcher
        data={devices}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewDetails={onViewDetails}
        onToggleStatus={onToggleStatus}
        onSort={handleSort}
        itemType="device"
      />
    </div>
  );
};

DeviceList.propTypes = {
  devices: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      token: PropTypes.string.isRequired,
      device_type: PropTypes.string.isRequired,
      device_type_display: PropTypes.string,
      is_active: PropTypes.bool,
      created_at: PropTypes.string,
      updated_at: PropTypes.string,
      user: PropTypes.shape({
        id: PropTypes.number,
        username: PropTypes.string,
        full_name: PropTypes.string,
        email: PropTypes.string,
        first_name: PropTypes.string,
        last_name: PropTypes.string
      })
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
  totalItems: PropTypes.number,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onViewDetails: PropTypes.func,
  onToggleStatus: PropTypes.func,
  onCreateFirst: PropTypes.func,
  onRetry: PropTypes.func
};

export default DeviceList;
