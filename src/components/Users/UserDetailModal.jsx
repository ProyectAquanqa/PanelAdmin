/**
 * Modal para ver detalles completos de un usuario
 * Siguiendo exactamente el diseño del modal de crear/editar UserModalNew
 * Con las mismas tabs y estructura visual
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';

const UserDetailModal = ({
  show,
  onClose,
  user,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState('datos');

  if (!show) return null;

  // Mismas tabs que UserModalNew para consistencia
  const tabs = [
    { 
      id: 'datos', 
      label: 'Datos Personales', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      id: 'acceso', 
      label: 'Acceso y Perfil', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    { 
      id: 'organizacion', 
      label: 'Organización', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    }
  ];

  // Función para obtener el tipo de usuario basado en grupos
  const getTipoUsuarioFromGroup = () => {
    if (!user?.groups || !Array.isArray(user.groups) || user.groups.length === 0) {
      return 'Sin definir';
    }
    
    const groupName = typeof user.groups[0] === 'string' ? user.groups[0] : user.groups[0]?.name;
    
    const adminGroups = [
      'Administrador de Contenido',
      'Editor de Contenido', 
      'Gestor de Chatbot',
      'Admin',
      'Administrador'
    ];
    
    if (adminGroups.includes(groupName)) {
      return 'Administrativo';
    } else if (groupName === 'Trabajador') {
      return 'Trabajador';
    } else {
      return 'Sin definir';
    }
  };

  // Renderizado de pestaña Datos Personales (proporción equilibrada sin scroll)
  const renderDatosPersonales = () => (
    <div className="h-full">
      {/* Layout equilibrado de 2 columnas */}
      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Columna Izquierda - Foto de Perfil y Firma (más compacta) */}
        <div className="col-span-4 flex flex-col items-center justify-start pt-4">
          <div className="w-full space-y-4">
            {/* Foto de Perfil - Compacta */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 text-center">
                Foto de Perfil
              </label>
              
              <div className="relative">
                <div className="w-full h-32 bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
                  <div className="flex flex-col items-center justify-center h-full p-3">
                    {user?.foto_perfil ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={user.foto_perfil} 
                          alt="Foto de perfil" 
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div style={{display: 'none'}} className="flex flex-col items-center justify-center h-full">
                          <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <p className="text-xs text-gray-500">Sin foto</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className="text-xs text-gray-600 font-medium">Sin foto de perfil</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Firma Digital - Compacta */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 text-center">
                Firma Digital
              </label>
              
              <div className="relative">
                <div className="w-full h-20 bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
                  <div className="flex flex-col items-center justify-center h-full p-2">
                    {user?.firma ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={user.firma} 
                          alt="Firma digital" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div style={{display: 'none'}} className="flex flex-col items-center justify-center h-full">
                          <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <p className="text-xs text-gray-500">Sin firma</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <p className="text-xs text-gray-600 font-medium">Sin firma digital</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha - Datos del Usuario (más espacio) */}
        <div className="col-span-8 flex flex-col justify-start pt-4">
          <div className="space-y-4">
            {/* DNI */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Documento de Identidad
              </label>
              <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 font-mono">
                {user?.username || 'No especificado'}
              </div>
            </div>

            {/* Nombres y Apellidos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nombres
                </label>
                <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50">
                  {user?.first_name || 'No especificado'}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Apellidos
                </label>
                <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50">
                  {user?.last_name || 'No especificado'}
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 font-mono">
                {user?.email || 'No especificado'}
              </div>
            </div>

            {/* Información adicional */}
            <div className="pt-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${user?.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      {user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Usuario'}
                    </p>
                    <p className="text-xs text-blue-600">
                      Estado: {user?.is_active ? 'Activo en el sistema' : 'Inactivo'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizado de pestaña Acceso y Perfil (sin estado de cuenta - ya está en datos personales)
  const renderAccesoPerfil = () => (
    <div className="space-y-6">
      {/* Perfil/Rol Principal */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Perfil/Rol Asignado
        </label>
        <div className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-gray-50">
          {user?.groups && Array.isArray(user.groups) && user.groups.length > 0 
            ? (typeof user.groups[0] === 'string' ? user.groups[0] : user.groups[0]?.name || 'Sin definir')
            : 'Sin perfil asignado'}
        </div>
      </div>



      {/* Resumen de permisos */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Resumen de Permisos
        </label>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm text-gray-700">Total de permisos asignados</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {user?.permissions?.length || 0}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Permisos heredados del perfil asignado
          </p>
        </div>
      </div>

      {/* Información de sesiones */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Información de Acceso
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs font-medium text-gray-600">Último acceso</p>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {user?.last_login ? new Date(user.last_login).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Nunca'}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm6-2a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              <p className="text-xs font-medium text-gray-600">Fecha de registro</p>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {user?.date_joined ? new Date(user.date_joined).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }) : 'No disponible'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizado de pestaña Organización (sin estadísticas)
  const renderOrganizacion = () => (
    <div className="space-y-6">
      {/* Empresa */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Empresa
        </label>
        <div className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-gray-50">
          {user?.empresa_display || user?.empresa || 'No especificada'}
        </div>
      </div>

      {/* Cargo */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Cargo
        </label>
        <div className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg bg-gray-50">
          {user?.cargo_detail?.nombre || user?.cargo_nombre || 'No asignado'}
        </div>
      </div>

      {/* Información del cargo seleccionado */}
      {(user?.cargo_detail || user?.area_nombre) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H8a2 2 0 00-2-2V6m8 0H8m8 0v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6" />
            </svg>
            Información del Cargo
          </h4>
          <div className="text-sm text-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-base">{user?.cargo_detail?.nombre || 'Cargo no especificado'}</p>
                <p className="text-sm mt-1">Área: {user?.area_nombre || user?.cargo_detail?.area_nombre || 'Sin área definida'}</p>
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
                ✓ Asignado
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional de registro */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Información del Sistema
        </label>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm6-2a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              <p className="text-xs font-medium text-gray-600">Fecha de registro</p>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {user?.date_joined ? new Date(user.date_joined).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'No disponible'}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-xs font-medium text-gray-600">Creado por</p>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {user?.created_by?.full_name || user?.created_by?.username || 'Sistema'}
            </p>
          </div>

          {user?.updated_at && (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-center mb-2">
                <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p className="text-xs font-medium text-gray-600">Última modificación</p>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {new Date(user.updated_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-[900px] h-[550px] flex flex-col max-w-[95vw] max-h-[95vh]">
        {/* Header minimalista igual que UserModalNew */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">
                Detalles del Usuario
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                Información completa del usuario organizada por categorías
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-lg p-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sistema de Pestañas minimalista igual que UserModalNew */}
        <div className="bg-gray-50 border-b border-gray-200 flex-shrink-0">
          <div className="px-6">
            <nav className="flex space-x-0" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center px-4 py-3 text-[13px] font-medium border-b-2 transition-all duration-200
                    ${activeTab === tab.id 
                      ? 'border-blue-500 text-blue-600 bg-white' 
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                    }
                    cursor-pointer
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenido de las pestañas */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{minHeight: '0'}}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-[13px] text-gray-500">Cargando información del usuario...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'datos' && renderDatosPersonales()}
              {activeTab === 'acceso' && renderAccesoPerfil()}
              {activeTab === 'organizacion' && renderOrganizacion()}
            </>
          )}
        </div>

        {/* Footer igual que UserModalNew */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Indicador de pestaña con estado */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-[13px] text-gray-600 font-medium">
                  Pestaña {tabs.findIndex(tab => tab.id === activeTab) + 1} de {tabs.length}
                </span>
                <span className="text-[13px] text-gray-500">
                  ({tabs.find(tab => tab.id === activeTab)?.label})
                </span>
              </div>
              <div className="flex items-center text-[13px] text-green-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Solo lectura
              </div>
            </div>

            {/* Botón de cerrar */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-100 hover:text-gray-900 hover:border-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
              >
                Cerrar
              </button>
            </div>
          </div>
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
