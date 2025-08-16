import React from 'react';
import PropTypes from 'prop-types';
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  CalendarIcon,
  DocumentTextIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { Modal } from '../Common';

/**
 * Modal para mostrar detalles de un cargo siguiendo el patrón de AreaDetailModal
 */
const CargoDetailModal = ({
  show,
  onClose,
  cargo,
  loading = false
}) => {
  if (!cargo) return null;

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title={`Detalles: ${cargo.nombre}`}
      size="lg"
    >
      {loading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Información Principal */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre del Cargo */}
              <div className="flex items-start gap-3">
                <TagIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Cargo
                  </label>
                  <p className="text-gray-900 font-medium">{cargo.nombre}</p>
                </div>
              </div>

              {/* Área */}
              <div className="flex items-start gap-3">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Área
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 font-medium">
                      {cargo.area_detail?.nombre || 'N/A'}
                    </p>
                    {cargo.area_detail?.is_active === false && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Área inactiva
                      </span>
                    )}
                  </div>
                  {cargo.area_detail?.descripcion && (
                    <p className="text-sm text-gray-500 mt-1">
                      {cargo.area_detail.descripcion}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Descripción */}
          {cargo.descripcion && (
            <div className="flex items-start gap-3">
              <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {cargo.descripcion}
                </p>
              </div>
            </div>
          )}

          {/* Estadísticas */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <UserGroupIcon className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-gray-900">Estadísticas</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {cargo.total_usuarios || 0}
                </div>
                <div className="text-sm text-gray-600">
                  Usuario{(cargo.total_usuarios || 0) !== 1 ? 's' : ''} asignado{(cargo.total_usuarios || 0) !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {cargo.area_detail?.is_active ? 'Activa' : 'Inactiva'}
                </div>
                <div className="text-sm text-gray-600">
                  Estado del área
                </div>
              </div>
            </div>
          </div>

          {/* Información de Auditoría */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-3 mb-3">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <h4 className="font-medium text-gray-900">Información de Auditoría</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Fecha de Creación
                </label>
                <p className="text-gray-600">{formatDate(cargo.created_at)}</p>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Última Actualización
                </label>
                <p className="text-gray-600">{formatDate(cargo.updated_at)}</p>
              </div>
              {cargo.created_by && (
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Creado por
                  </label>
                  <p className="text-gray-600">{cargo.created_by}</p>
                </div>
              )}
              {cargo.updated_by && (
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Actualizado por
                  </label>
                  <p className="text-gray-600">{cargo.updated_by}</p>
                </div>
              )}
            </div>
          </div>

          {/* Botón de cerrar */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

CargoDetailModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  cargo: PropTypes.shape({
    id: PropTypes.number,
    nombre: PropTypes.string,
    descripcion: PropTypes.string,
    area: PropTypes.number,
    area_detail: PropTypes.shape({
      id: PropTypes.number,
      nombre: PropTypes.string,
      descripcion: PropTypes.string,
      is_active: PropTypes.bool
    }),
    total_usuarios: PropTypes.number,
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
    created_by: PropTypes.string,
    updated_by: PropTypes.string
  }),
  loading: PropTypes.bool
};

export default CargoDetailModal;
