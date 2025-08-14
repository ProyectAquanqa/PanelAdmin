/**
 * Modal para ver detalles completos de un perfil
 * Siguiendo el diseño de los otros modales de detalles del sistema
 */

import React from 'react';
import PropTypes from 'prop-types';

const ProfileDetailModal = ({
  show,
  onClose,
  profile,
  loading = false
}) => {
  if (!show || !profile) return null;

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[800px] h-[600px] flex flex-col max-w-[95vw] max-h-[95vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4 rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">
                Detalles del Perfil
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                {profile.nombre || profile.name || `Perfil ID ${profile.id}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200"
              title="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-[13px] text-gray-500">Cargando información del perfil...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Información General */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-4">
                  Información General
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">ID</label>
                    <p className="text-[13px] text-gray-900 px-3 py-2 border border-gray-300 rounded-md">
                      {profile.id || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Nombre</label>
                    <p className="text-[13px] text-gray-900 px-3 py-2 border border-gray-300 rounded-md">
                      {profile.nombre || profile.name || '-'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">Descripción</label>
                    <p className="text-[13px] text-gray-900 px-3 py-2 border border-gray-300 rounded-md min-h-[60px]">
                      {profile.descripcion || profile.description || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-4">
                  Estadísticas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">{profile.users_count || 0}</div>
                    <div className="text-[13px] text-gray-600">Usuarios</div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {profile.permissions_count || (profile.permissions ? profile.permissions.length : 0)}
                    </div>
                    <div className="text-[13px] text-gray-600">Permisos</div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {profile.is_active !== undefined ? (profile.is_active ? 'Activo' : 'Inactivo') : 'N/A'}
                    </div>
                    <div className="text-[13px] text-gray-600">Estado</div>
                  </div>
                </div>
              </div>

              {/* Permisos */}
              {profile.permissions && Array.isArray(profile.permissions) && profile.permissions.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-4">
                    Permisos Asignados
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {profile.permissions.map((permission, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center text-[13px] text-gray-700 border border-gray-200 px-2 py-1 rounded"
                      >
                        <svg className="w-3 h-3 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {typeof permission === 'string' ? permission : (permission.name || permission.codename)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Información de Sistema */}
              {(profile.created_at || profile.updated_at) && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-4">
                    Información de Sistema
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.created_at && (
                      <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1">Fecha de Creación</label>
                        <p className="text-[13px] text-gray-900 px-3 py-2 border border-gray-300 rounded-md">
                          {formatDate(profile.created_at)}
                        </p>
                      </div>
                    )}
                    {profile.updated_at && (
                      <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1">Última Modificación</label>
                        <p className="text-[13px] text-gray-900 px-3 py-2 border border-gray-300 rounded-md">
                          {formatDate(profile.updated_at)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 rounded-b-xl flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

ProfileDetailModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  profile: PropTypes.object,
  loading: PropTypes.bool
};

export default ProfileDetailModal;
