/**
 * Componente para la pestaña de Acceso y Perfil del modal de usuarios
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';

const UserModalAccesoPerfil = ({
  formData,
  errors,
  isViewMode,
  isCreateMode,
  getInputProps,
  getSelectProps,
  getCheckboxProps,
  groupsDisponibles,
  loadingGroups
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h4 className="text-lg font-medium text-slate-800 mb-2">Acceso y Perfil</h4>
        <p className="text-sm text-slate-600">Configura el acceso al sistema y asigna el perfil correspondiente</p>
      </div>

      {/* Configuración de acceso */}
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <h5 className="text-sm font-semibold text-slate-800 mb-4">Configuración de Acceso</h5>
        
        {/* Contraseñas (solo para creación) */}
        {isCreateMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...getInputProps('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  className={`w-full px-4 py-3 pr-12 text-sm border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-slate-500/20 ${
                    errors.password 
                      ? 'border-red-300 bg-red-50 focus:border-red-400' 
                      : 'border-slate-200 bg-white focus:border-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password}
                </p>
              )}
              <p className="text-xs text-slate-500">
                Debe tener al menos 6 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
                Confirmar Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                {...getInputProps('confirmPassword')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Repetir contraseña"
                className={`w-full px-4 py-3 text-sm border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-slate-500/20 ${
                  errors.confirmPassword 
                    ? 'border-red-300 bg-red-50 focus:border-red-400' 
                    : 'border-slate-200 bg-white focus:border-slate-400'
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.confirmPassword}
                </p>
              )}
              <p className="text-xs text-slate-500">
                Debe coincidir con la contraseña
              </p>
            </div>
          </div>
        )}

        {/* Perfil/Rol */}
        <div className="space-y-2 mb-6">
          <label htmlFor="groups" className="block text-sm font-semibold text-slate-700">
            Perfil/Rol <span className="text-red-500">*</span>
          </label>
          <select
            {...getSelectProps('groups')}
            disabled={isViewMode || loadingGroups}
            className={`w-full px-4 py-3 text-sm border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-slate-500/20 ${
              errors.groups 
                ? 'border-red-300 bg-red-50 focus:border-red-400' 
                : 'border-slate-200 bg-white focus:border-slate-400'
            } ${(isViewMode || loadingGroups) ? 'bg-slate-50 cursor-not-allowed' : ''}`}
          >
            <option value="">
              {loadingGroups ? 'Cargando perfiles...' : 'Seleccionar perfil/rol'}
            </option>
            {groupsDisponibles.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          {errors.groups && (
            <p className="text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.groups}
            </p>
          )}
          <p className="text-xs text-slate-500">
            El perfil determina los permisos y accesos del usuario en el sistema
          </p>
        </div>

        {/* Estado del usuario */}
        <div className="flex items-center justify-between p-4 bg-white border-2 border-slate-200 rounded-lg">
          <div>
            <span className="text-sm font-medium text-slate-700">Estado del Usuario</span>
            <p className="text-xs text-slate-500 mt-1">Determina si el usuario puede acceder al sistema</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              {...getCheckboxProps('is_active')}
              type="checkbox"
              disabled={isViewMode}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-600">
            </div>
            <span className="ml-3 text-sm font-medium text-slate-700">
              {formData.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </label>
        </div>
      </div>

      {/* Información de perfiles disponibles */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h6 className="text-sm font-medium text-slate-800 mb-3">Perfiles Disponibles</h6>
        <div className="space-y-2">
          <div className="flex items-center text-xs text-slate-600">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            <strong>Trabajador:</strong> Acceso básico solo a funciones móviles
          </div>
          <div className="flex items-center text-xs text-slate-600">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <strong>Editor de Contenido:</strong> Gestión de eventos y contenido básico
          </div>
          <div className="flex items-center text-xs text-slate-600">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
            <strong>Administrador de Contenido:</strong> Control completo sobre contenido y usuarios
          </div>
          <div className="flex items-center text-xs text-slate-600">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
            <strong>Gestor de Chatbot:</strong> Gestión de la base de conocimiento del chatbot
          </div>
        </div>
      </div>

      {/* Información adicional de acceso */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h6 className="text-sm font-medium text-blue-800">Información sobre el acceso</h6>
            <p className="text-xs text-blue-700 mt-1">
              • El DNI será usado como nombre de usuario para iniciar sesión<br/>
              • El perfil asignado determinará los permisos del usuario<br/>
              • Los usuarios inactivos no podrán acceder al sistema<br/>
              • La contraseña debe cumplir con los requisitos de seguridad mínimos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

UserModalAccesoPerfil.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  isViewMode: PropTypes.bool.isRequired,
  isCreateMode: PropTypes.bool.isRequired,
  getInputProps: PropTypes.func.isRequired,
  getSelectProps: PropTypes.func.isRequired,
  getCheckboxProps: PropTypes.func.isRequired,
  groupsDisponibles: PropTypes.array.isRequired,
  loadingGroups: PropTypes.bool
};

export default UserModalAccesoPerfil;
