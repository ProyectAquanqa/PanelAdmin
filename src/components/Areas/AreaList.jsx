import React from 'react';
import PropTypes from 'prop-types';
import { DataViewSwitcher } from '../Common';
import { LoadingStates } from '.';

/**
 * Componente contenedor para la lista de áreas
 * Maneja los diferentes estados y la vista de datos siguiendo el patrón de KnowledgeList
 */
const AreaList = ({
  areas,
  loading,
  error,
  totalItems,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
  onCreateFirst,
  onRetry
}) => {
  // Si está cargando y no hay datos
  if (loading && !areas?.length) {
    return <LoadingStates.AreaListLoading />;
  }

  // Si hay error
  if (error) {
    return <LoadingStates.ErrorState onRetry={onRetry} />;
  }

  // Si no hay datos
  if (!areas?.length) {
    return <LoadingStates.EmptyState onCreateFirst={null} />;
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
        data={areas}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewDetails={onView}
        onToggleStatus={onToggleStatus}
        onSort={handleSort}
        itemType="area"
      />
    </div>
  );
};

AreaList.propTypes = {
  areas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
      descripcion: PropTypes.string,
      is_active: PropTypes.bool,
      total_cargos: PropTypes.number,
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
  onToggleStatus: PropTypes.func,
  onCreateFirst: PropTypes.func,
  onRetry: PropTypes.func
};

export default AreaList;
