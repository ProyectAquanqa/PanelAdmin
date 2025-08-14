/**
 * Componente para la pestaña de Organización del modal de usuarios
 */

import React from 'react';
import PropTypes from 'prop-types';

const UserModalOrganizacion = ({
  formData,
  errors,
  isViewMode,
  getSelectProps,
  cargos
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h4 className="text-lg font-medium text-slate-800 mb-2">🏢 Organización</h4>
        <p className="text-sm text-slate-600">Asigna el cargo y la información organizacional</p>
      </div>

      {/* Información organizacional */}
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <h5 className="text-sm font-semibold text-slate-800 mb-4">Información Organizacional</h5>
        
        {/* Cargo */}
        <div className="space-y-2 mb-6">
          <label htmlFor="cargo" className="block text-sm font-semibold text-slate-700">
            Cargo <span className="text-red-500">*</span>
          </label>
          <select
            {...getSelectProps('cargo')}
            disabled={isViewMode}
            className={`w-full px-4 py-3 text-sm border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-slate-500/20 ${
              errors.cargo 
                ? 'border-red-300 bg-red-50 focus:border-red-400' 
                : 'border-slate-200 bg-white focus:border-slate-400'
            } ${isViewMode ? 'bg-slate-50 cursor-not-allowed' : ''}`}
          >
            <option value="">Seleccionar cargo</option>
            {cargos.map(cargo => (
              <option key={cargo.id} value={cargo.id}>
                {cargo.nombre} - {cargo.area_nombre || cargo.area?.nombre || 'Sin área'}
              </option>
            ))}
          </select>
          {errors.cargo && (
            <p className="text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.cargo}
            </p>
          )}
          <p className="text-xs text-slate-500">
            Selecciona el cargo del usuario. Se muestra junto al área correspondiente para dar contexto.
          </p>
        </div>

        {/* Empresa */}
        <div className="space-y-2">
          <label htmlFor="empresa" className="block text-sm font-semibold text-slate-700">
            Empresa
          </label>
          <select
            {...getSelectProps('empresa')}
            disabled={isViewMode}
            className={`w-full px-4 py-3 text-sm border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-slate-500/20 ${
              errors.empresa 
                ? 'border-red-300 bg-red-50 focus:border-red-400' 
                : 'border-slate-200 bg-white focus:border-slate-400'
            } ${isViewMode ? 'bg-slate-50 cursor-not-allowed' : ''}`}
          >
            <option value="">Seleccionar empresa</option>
            <option value="AQUANQA_1">AQUANQA 1</option>
            <option value="AQUANQA_2">AQUANQA 2</option>
          </select>
          {errors.empresa && (
            <p className="text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.empresa}
            </p>
          )}
          <p className="text-xs text-slate-500">
            Empresa a la que pertenece el usuario dentro del grupo AQUANQA
          </p>
        </div>
      </div>

      {/* Información de cargos disponibles */}
      {cargos.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h6 className="text-sm font-medium text-slate-800 mb-3">Cargos Disponibles por Área</h6>
          <div className="max-h-40 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {cargos.map(cargo => (
                <div key={cargo.id} className="text-xs text-slate-600 py-1">
                  <span className="font-medium">{cargo.nombre}</span>
                  {cargo.area_nombre && (
                    <span className="text-slate-500"> - {cargo.area_nombre}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Estructura organizacional */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h6 className="text-sm font-medium text-slate-800 mb-3">Estructura Organizacional</h6>
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-3 mt-1 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-slate-800">AQUANQA 1</p>
              <p className="text-xs text-slate-500">División principal de operaciones</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-3 mt-1 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-slate-800">AQUANQA 2</p>
              <p className="text-xs text-slate-500">División secundaria de operaciones</p>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h6 className="text-sm font-medium text-green-800">Información organizacional</h6>
            <p className="text-xs text-green-700 mt-1">
              • El cargo determina las responsabilidades del usuario<br/>
              • El área se asigna automáticamente según el cargo seleccionado<br/>
              • La empresa puede ser AQUANQA 1 o AQUANQA 2<br/>
              • No es necesario seleccionar área por separado, se obtiene del cargo
            </p>
          </div>
        </div>
      </div>

      {/* Ejemplo de cargo seleccionado */}
      {formData.cargo && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-purple-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <div>
              <h6 className="text-sm font-medium text-purple-800">Cargo Seleccionado</h6>
              <p className="text-xs text-purple-700 mt-1">
                El usuario será asignado al cargo seleccionado y automáticamente pertenecerá al área correspondiente.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

UserModalOrganizacion.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  isViewMode: PropTypes.bool.isRequired,
  getSelectProps: PropTypes.func.isRequired,
  cargos: PropTypes.array.isRequired
};

export default UserModalOrganizacion;
