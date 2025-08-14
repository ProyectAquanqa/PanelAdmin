/**
 * Modal para ver detalles completos de un usuario
 * Siguiendo el diseño de los modales de detalles del sistema
 * Con tabs para organizar la información
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';

const UserDetailModal = ({
  show,
  onClose,
  user,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState('general');

  if (!show) return null;

  const tabs = [
    {
      id: 'general',
      name: 'Información General',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'permissions',
      name: 'Perfiles y Permisos',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      id: 'activity',
      name: 'Actividad y Sesiones',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  const renderGeneralTab = () => (
    <div className="space-y-6">
      {/* Información Personal */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-4">
          Información Personal
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Nombre Completo</label>
            <p className="text-[13px] text-gray-900 px-3 py-2 border border-gray-300 rounded-md">
              {user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'No especificado'}
            </p>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">DNI/Username</label>
            <p className="text-[13px] text-gray-900 px-3 py-2 border border-gray-300 rounded-md">
              {user?.username || 'No especificado'}
            </p>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Email</label>
            <p className="text-[13px] text-gray-900 px-3 py-2 border border-gray-300 rounded-md">
              {user?.email || 'No especificado'}
            </p>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Estado</label>
            <p className="text-[13px] text-gray-900 px-3 py-2 border border-gray-300 rounded-md">
              {user?.is_active ? 'Activo' : 'Inactivo'}
            </p>
          </div>
        </div>
      </div>

      {/* Información Laboral */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-4">
          Información Laboral
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Cargo</label>
            <p className="text-[13px] text-gray-900 px-3 py-2 border border-gray-300 rounded-md">
              {user?.cargo_detail?.nombre || 'No asignado'}
            </p>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Área</label>
            <p className="text-[13px] text-gray-900 px-3 py-2 border border-gray-300 rounded-md">
              {user?.area_nombre || user?.cargo_detail?.area_nombre || 'No asignado'}
            </p>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Empresa</label>
            <p className="text-[13px] text-gray-900 px-3 py-2 border border-gray-300 rounded-md">
              {user?.empresa_display || 'No especificada'}
            </p>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Tipo de Usuario</label>
            <p className="text-[13px] text-gray-900 px-3 py-2 border border-gray-300 rounded-md">
              {user?.is_staff ? 'Staff/Administrador' : user?.is_superuser ? 'Superusuario' : 'Usuario Regular'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPermissionsTab = () => (
    <div className="space-y-6">
      {/* Perfiles/Grupos */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-4">
          Perfiles Asignados
        </h3>
        {user?.groups && Array.isArray(user.groups) && user.groups.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {user.groups.map((group, idx) => (
              <span 
                key={idx} 
                className="inline-flex items-center px-3 py-1 text-[13px] text-gray-700 border border-gray-300 rounded"
              >
                <svg className="w-3 h-3 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {typeof group === 'string' ? group : (group.name || group.nombre)}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-gray-500 italic">Sin perfiles asignados</p>
        )}
      </div>

      {/* Permisos Efectivos */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-4">
          Permisos Efectivos
        </h3>
        {user?.permissions && Array.isArray(user.permissions) && user.permissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {user.permissions.map((permission, idx) => (
              <div 
                key={idx} 
                className="flex items-center text-[13px] text-gray-700 px-2 py-1 border border-gray-300 rounded"
              >
                <svg className="w-3 h-3 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {permission}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-gray-500 italic">Sin permisos específicos</p>
        )}
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-6">
      {/* Información de Registro */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-4">
          Información de Registro
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Fecha de Registro</label>
            <p className="text-[13px] text-gray-900 px-3 py-2 border border-gray-300 rounded-md">
              {user?.date_joined_formatted || (user?.date_joined ? new Date(user.date_joined).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'No disponible')}
            </p>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Último Acceso</label>
            <p className="text-[13px] text-gray-900 px-3 py-2 border border-gray-300 rounded-md">
              {user?.last_login_formatted || (user?.last_login ? new Date(user.last_login).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Nunca')}
            </p>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Creado Por</label>
            <p className="text-[13px] text-gray-900 px-3 py-2 border border-gray-300 rounded-md">
              {user?.created_by?.full_name || user?.created_by?.username || 'Sistema'}
            </p>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Última Modificación</label>
            <p className="text-[13px] text-gray-900 px-3 py-2 border border-gray-300 rounded-md">
              {user?.updated_at ? new Date(user.updated_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'No disponible'}
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-4">
          Estadísticas de Usuario
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">{user?.groups_count || 0}</div>
            <div className="text-[13px] text-gray-600">Perfiles</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {user?.permissions?.length || 0}
            </div>
            <div className="text-[13px] text-gray-600">Permisos</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {user?.is_active ? 'Activo' : 'Inactivo'}
            </div>
            <div className="text-[13px] text-gray-600">Estado</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[1000px] h-[700px] flex flex-col max-w-[95vw] max-h-[95vh]">
        
        {/* Header Profesional */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4 rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">
                Detalles del Usuario
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                {user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'Usuario'}
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

        {/* Tabs de Navegación */}
        <div className="border-b border-gray-200 px-6 bg-white flex-shrink-0">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-[13px] flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-[13px] text-gray-500">Cargando información del usuario...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'general' && renderGeneralTab()}
              {activeTab === 'permissions' && renderPermissionsTab()}
              {activeTab === 'activity' && renderActivityTab()}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

UserDetailModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
  loading: PropTypes.bool
};

export default UserDetailModal;
