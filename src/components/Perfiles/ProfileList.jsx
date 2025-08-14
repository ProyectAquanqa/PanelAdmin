import React from 'react';
import PropTypes from 'prop-types';
import { DataViewSwitcher } from '../Common';
import { LoadingStates } from '.';

/**
 * Componente contenedor para la lista de perfiles
 * Maneja los diferentes estados y la vista de datos
 * Basado en KnowledgeList
 */
const ProfileList = ({
  profiles,
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
  if (loading && !profiles?.length) {
    return <LoadingStates.ProfileListLoading />;
  }

  // Si hay error
  if (error) {
    return <LoadingStates.ErrorState onRetry={onRetry} />;
  }

  // Si no hay datos
  if (!profiles?.length) {
    return <LoadingStates.EmptyState onCreateFirst={onCreateFirst} />;
  }

  // Función para manejar ordenamiento
  const handleSort = (field, direction) => {
    // Por ahora el ordenamiento se hace en el componente DataViewSwitcher
    // En el futuro podríamos llamar al backend para ordenamiento del servidor
  };

  return (
    <div className="space-y-6">
      <DataViewSwitcher
        data={profiles}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        onSort={handleSort}
        itemType="profile"
        initialSortField="name"
        initialSortDirection="asc"
        enableSorting={true}
      />
    </div>
  );
};

ProfileList.propTypes = {
  profiles: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  totalItems: PropTypes.number,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onCreateFirst: PropTypes.func,
  onRetry: PropTypes.func
};

ProfileList.defaultProps = {
  profiles: [],
  loading: false,
  error: null,
  totalItems: 0
};

export default ProfileList;
