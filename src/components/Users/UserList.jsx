import React from 'react';
import PropTypes from 'prop-types';
import { DataViewSwitcher } from '../Common';
import { LoadingStates } from '.';

/**
 * Componente contenedor para la lista de usuarios
 * Maneja los diferentes estados y la vista de datos
 * Basado en KnowledgeList y ProfileList
 */
const UserList = ({
  users = [],
  loading = false,
  error = null,
  totalItems = 0,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
  onCreateFirst,
  onRetry
}) => {
  // Si está cargando y no hay datos
  if (loading && !users?.length) {
    return <LoadingStates.UserListLoading />;
  }

  // Si hay error
  if (error) {
    return <LoadingStates.ErrorState onRetry={onRetry} />;
  }

  // Si no hay datos
  if (!users?.length) {
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
        data={users}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        onToggleStatus={onToggleStatus}
        onSort={handleSort}
        itemType="user"
        initialSortField="created_at"
        initialSortDirection="desc"
        enableSorting={true}
      />
    </div>
  );
};

UserList.propTypes = {
  users: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  totalItems: PropTypes.number,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func,
  onCreateFirst: PropTypes.func,
  onRetry: PropTypes.func
};



export default UserList;
