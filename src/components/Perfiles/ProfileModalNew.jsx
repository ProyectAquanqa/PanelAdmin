import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../Common';
import ProfileFormNew from './ProfileFormNew';

/**
 * Modal simple para crear/editar grupos de Django
 * Wrapper alrededor de ProfileFormNew
 */
const ProfileModalNew = ({
  show,
  onClose,
  onSubmit,
  editingProfile,
  loading,
  mode = 'create'
}) => {
  const handleSubmit = (data) => {
    onSubmit(data);
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Crear Nuevo Grupo';
      case 'edit': return 'Editar Grupo';
      case 'view': return 'Detalles del Grupo';
      default: return 'Gestionar Grupo';
    }
  };

  return (
    <Modal show={show} onClose={onClose} size="4xl">
      <div className="flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">
            {getTitle()}
          </h3>
          <p className="text-[13px] text-gray-500 mt-1">
            {mode === 'create' && 'Crea un nuevo grupo con permisos específicos para el sistema'}
            {mode === 'edit' && 'Modifica el nombre y permisos del grupo'}
            {mode === 'view' && 'Información completa del grupo y sus permisos asignados'}
          </p>
        </div>

        {/* Contenido del formulario */}
        <div className="flex-1 overflow-y-auto">
          <ProfileFormNew
            mode={mode}
            editingProfile={editingProfile}
            onSubmit={handleSubmit}
            onCancel={onClose}
            loading={loading}
          />
        </div>
      </div>
    </Modal>
  );
};

ProfileModalNew.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editingProfile: PropTypes.object,
  loading: PropTypes.bool,
  mode: PropTypes.oneOf(['create', 'edit', 'view'])
};

export default ProfileModalNew;