import React from 'react';
import PropTypes from 'prop-types';
import CargoTableView from './CargoTableView';
import { LoadingStates } from '.';

/**
 * Componente contenedor para la lista de cargos
 * Maneja los diferentes estados y la vista de datos siguiendo el patrón de AreaList
 */
const CargoList = ({
  cargos,
  loading,
  error,
  totalItems,
  onEdit,
  onDelete,
  onView,
  onCreateFirst,
  onRetry
}) => {
  // Si está cargando y no hay datos
  if (loading && !cargos?.length) {
    return <LoadingStates.CargoListLoading />;
  }

  // Si hay error
  if (error) {
    return <LoadingStates.ErrorState onRetry={onRetry} />;
  }

  // Si no hay datos
  if (!cargos?.length) {
    return <LoadingStates.EmptyState onCreateFirst={onCreateFirst} />;
  }

  // Función para manejar ordenamiento
  const handleSort = (field, direction) => {
    // Por ahora el ordenamiento se hace en el componente DataViewSwitcher
    // En el futuro podríamos llamar al backend para ordenamiento del servidor
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <CargoTableView
          data={cargos}
          sortField={null}
          sortDirection={null}
          expandedRows={new Set()}
          onSort={handleSort}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleExpansion={() => {}}
          onView={onView}
        />
      </div>
    </div>
  );
};

CargoList.propTypes = {
  cargos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
      descripcion: PropTypes.string,
      area: PropTypes.number.isRequired,
      area_detail: PropTypes.shape({
        id: PropTypes.number,
        nombre: PropTypes.string,
        descripcion: PropTypes.string,
        is_active: PropTypes.bool
      }),
      total_usuarios: PropTypes.number,
      created_at: PropTypes.string,
      updated_at: PropTypes.string
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
  totalItems: PropTypes.number,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onView: PropTypes.func,
  onCreateFirst: PropTypes.func,
  onRetry: PropTypes.func
};

export default CargoList;
