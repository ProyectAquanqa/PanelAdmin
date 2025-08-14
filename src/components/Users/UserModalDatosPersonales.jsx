/**
 * Componente para la pestaña de Datos Personales del modal de usuarios
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';

const UserModalDatosPersonales = ({
  formData,
  errors,
  isViewMode,
  isCreateMode,
  isEditMode,
  getInputProps,
  setFieldValue,
  loadingDni,
  fieldsFromDni,
  onDniBlur,
  onClearAutoFields
}) => {
  const [imagePreview, setImagePreview] = useState(null);

  // Manejar upload de imagen
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
        setFieldValue('foto_perfil', file);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h4 className="text-lg font-medium text-slate-800 mb-2">👤 Información Personal</h4>
        <p className="text-sm text-slate-600">Completa los datos básicos del usuario</p>
      </div>

      {/* Foto de perfil centrada */}
      <div className="flex justify-center mb-8">
        <div className="relative group">
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 overflow-hidden border-4 border-white shadow-xl transition-all duration-300 group-hover:shadow-2xl">
            {imagePreview || formData?.foto_perfil ? (
              <img 
                src={imagePreview || formData?.foto_perfil} 
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-12 h-12 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            )}
          </div>
          {!isViewMode && (
            <label className="absolute -bottom-2 -right-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl p-3 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Grid de campos principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DNI (Username) */}
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-semibold text-slate-700">
            DNI (Documento de Identidad) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              {...getInputProps('username')}
              type="text"
              placeholder="12345678"
              maxLength="8"
              disabled={isViewMode || isEditMode}
              onBlur={(e) => {
                if (isCreateMode && e.target.value) {
                  onDniBlur(e.target.value);
                }
              }}
              className={`w-full px-4 py-3 text-sm border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-slate-500/20 ${
                errors.username 
                  ? 'border-red-300 bg-red-50 focus:border-red-400' 
                  : 'border-slate-200 bg-white focus:border-slate-400'
              } ${(isViewMode || isEditMode) ? 'bg-slate-50 cursor-not-allowed text-slate-500' : ''}`}
            />
            {loadingDni && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-500 border-t-transparent"></div>
              </div>
            )}
          </div>
          {errors.username && (
            <p className="text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.username}
            </p>
          )}
          {fieldsFromDni && (
            <p className="text-sm text-green-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Datos autocompletados desde RENIEC
            </p>
          )}
          <p className="text-xs text-slate-500">
            El DNI será usado como nombre de usuario para acceder al sistema
          </p>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
            Correo Electrónico
          </label>
          <input
            {...getInputProps('email')}
            type="email"
            placeholder="usuario@empresa.com"
            disabled={isViewMode}
            className={`w-full px-4 py-3 text-sm border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-slate-500/20 ${
              errors.email 
                ? 'border-red-300 bg-red-50 focus:border-red-400' 
                : 'border-slate-200 bg-white focus:border-slate-400'
            } ${isViewMode ? 'bg-slate-50 text-slate-500' : ''}`}
          />
          {errors.email && (
            <p className="text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.email}
            </p>
          )}
          <p className="text-xs text-slate-500">
            Correo electrónico para notificaciones del sistema
          </p>
        </div>

        {/* Nombres */}
        <div className="space-y-2">
          <label htmlFor="first_name" className="block text-sm font-semibold text-slate-700">
            Nombres <span className="text-red-500">*</span>
            {fieldsFromDni && <span className="text-green-600 text-xs ml-2">(Autocompletado)</span>}
          </label>
          <input
            {...getInputProps('first_name')}
            type="text"
            placeholder="Juan Carlos"
            disabled={isViewMode}
            className={`w-full px-4 py-3 text-sm border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-slate-500/20 ${
              errors.first_name 
                ? 'border-red-300 bg-red-50 focus:border-red-400' 
                : 'border-slate-200 bg-white focus:border-slate-400'
            } ${isViewMode ? 'bg-slate-50 text-slate-500' : ''}`}
          />
          {errors.first_name && (
            <p className="text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.first_name}
            </p>
          )}
        </div>

        {/* Apellidos */}
        <div className="space-y-2">
          <label htmlFor="last_name" className="block text-sm font-semibold text-slate-700">
            Apellidos <span className="text-red-500">*</span>
            {fieldsFromDni && <span className="text-green-600 text-xs ml-2">(Autocompletado)</span>}
          </label>
          <input
            {...getInputProps('last_name')}
            type="text"
            placeholder="Pérez Rodríguez"
            disabled={isViewMode}
            className={`w-full px-4 py-3 text-sm border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-slate-500/20 ${
              errors.last_name 
                ? 'border-red-300 bg-red-50 focus:border-red-400' 
                : 'border-slate-200 bg-white focus:border-slate-400'
            } ${isViewMode ? 'bg-slate-50 text-slate-500' : ''}`}
          />
          {errors.last_name && (
            <p className="text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.last_name}
            </p>
          )}
        </div>
      </div>

      {/* Mensaje de autocompletado */}
      {fieldsFromDni && !isViewMode && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-green-800">
                Datos cargados automáticamente desde RENIEC
              </span>
            </div>
            <button
              type="button"
              onClick={onClearAutoFields}
              className="text-sm text-green-700 hover:text-green-800 underline font-medium"
            >
              Editar manualmente
            </button>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h6 className="text-sm font-medium text-blue-800">Información sobre datos personales</h6>
            <p className="text-xs text-blue-700 mt-1">
              • Los campos marcados con <span className="text-red-500">*</span> son obligatorios<br/>
              • El DNI debe tener exactamente 8 dígitos numéricos<br/>
              • Al ingresar un DNI válido, los nombres se cargan automáticamente desde RENIEC<br/>
              • La foto de perfil es opcional y se puede subir en formato JPG, PNG o GIF
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

UserModalDatosPersonales.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  isViewMode: PropTypes.bool.isRequired,
  isCreateMode: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  getInputProps: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  loadingDni: PropTypes.bool,
  fieldsFromDni: PropTypes.bool,
  onDniBlur: PropTypes.func.isRequired,
  onClearAutoFields: PropTypes.func.isRequired
};

export default UserModalDatosPersonales;
