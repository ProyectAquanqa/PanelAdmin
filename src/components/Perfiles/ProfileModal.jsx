/**
 * Modal para gestión de perfiles siguiendo el patrón KnowledgeBase
 * Sistema híbrido Django Groups + GroupProfile
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../Common';

const ProfileModal = ({
  show,
  onClose,
  onSubmit,
  editingProfile,
  loading,
  mode = 'edit' // 'create', 'edit', 'view'
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo_acceso: 'AMBOS',
    is_admin_group: false,
    is_worker_group: false,
    is_active: true
  });

  const [errors, setErrors] = useState({});

  // Derivar estados del mode
  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';
  const isViewMode = mode === 'view';

  // Resetear formulario cuando cambie el perfil editado o el mode
  useEffect(() => {
    if (isCreateMode) {
      setFormData({
        nombre: '',
        descripcion: '',
        tipo_acceso: 'AMBOS',
        is_admin_group: false,
        is_worker_group: false,
        is_active: true
      });
    } else if (editingProfile && (isEditMode || isViewMode)) {
      setFormData({
        nombre: editingProfile.nombre || editingProfile.name || '',
        descripcion: editingProfile.descripcion || '',
        tipo_acceso: editingProfile.tipo_acceso || 'AMBOS',
        is_admin_group: editingProfile.is_admin_group || false,
        is_worker_group: editingProfile.is_worker_group || false,
        is_active: editingProfile.is_active !== undefined ? editingProfile.is_active : true
      });
    }
    setErrors({});
  }, [editingProfile, mode, isCreateMode, isEditMode, isViewMode]);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    // Validar que sea admin O worker, no ambos ni ninguno
    if (!formData.is_admin_group && !formData.is_worker_group) {
      newErrors.tipo_perfil = 'Debe seleccionar al menos un tipo de perfil';
    }

    if (formData.is_admin_group && formData.is_worker_group) {
      newErrors.tipo_perfil = 'No puede ser administrador y trabajador a la vez';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en campos
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar error del campo específico
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Manejar tipo de perfil (mutuamente excluyente)
  const handleProfileTypeChange = (type) => {
    if (type === 'admin') {
      setFormData(prev => ({
        ...prev,
        is_admin_group: !prev.is_admin_group,
        is_worker_group: false // Desactivar worker si se activa admin
      }));
    } else if (type === 'worker') {
      setFormData(prev => ({
        ...prev,
        is_worker_group: !prev.is_worker_group,
        is_admin_group: false // Desactivar admin si se activa worker
      }));
    }

    // Limpiar error de tipo de perfil
    if (errors.tipo_perfil) {
      setErrors(prev => ({ ...prev, tipo_perfil: '' }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isViewMode && validateForm()) {
      onSubmit(formData);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      tipo_acceso: 'AMBOS',
      is_admin_group: false,
      is_worker_group: false,
      is_active: true
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal show={show} onClose={handleClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-0">
        {/* Header Minimalista */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">
                {isCreateMode && 'Crear Nuevo Perfil'}
                {isEditMode && 'Editar Perfil'}
                {isViewMode && 'Detalles del Perfil'}
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                {isCreateMode && 'Completa los campos para crear un nuevo perfil'}
                {isEditMode && 'Modifica los datos del perfil'}
                {isViewMode && 'Información completa del perfil'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-lg p-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body del formulario */}
        <div className="px-6 py-6 space-y-6">
          
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nombre del perfil */}
            <div className="md:col-span-1">
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Perfil *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500/30 transition-all ${
                  errors.nombre ? 'border-red-300' : 'border-gray-300'
                } ${isViewMode ? 'bg-gray-50' : 'bg-white'}`}
                placeholder="Ej: Administrador, Editor, Supervisor..."
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
              )}
            </div>

            {/* Tipo de acceso */}
            <div className="md:col-span-1">
              <label htmlFor="tipo_acceso" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Acceso *
              </label>
              <select
                id="tipo_acceso"
                name="tipo_acceso"
                value={formData.tipo_acceso}
                onChange={handleInputChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500/30 transition-all ${
                  isViewMode ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-300'
                }`}
              >
                <option value="WEB">Solo Web</option>
                <option value="MOVIL">Solo Móvil</option>
                <option value="AMBOS">Web y Móvil</option>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              disabled={isViewMode}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500/30 transition-all ${
                errors.descripcion ? 'border-red-300' : 'border-gray-300'
              } ${isViewMode ? 'bg-gray-50' : 'bg-white'}`}
              placeholder="Describe las responsabilidades y permisos de este perfil..."
            />
            {errors.descripcion && (
              <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
            )}
          </div>

          {/* Tipo de perfil */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Perfil *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Administrador */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  formData.is_admin_group 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${isViewMode ? 'cursor-not-allowed opacity-75' : ''}`}
                onClick={() => !isViewMode && handleProfileTypeChange('admin')}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_admin_group}
                    onChange={() => !isViewMode && handleProfileTypeChange('admin')}
                    disabled={isViewMode}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      Administrador
                    </div>
                    <div className="text-sm text-gray-500">
                      Gestión y administración del panel web
                    </div>
                  </div>
                </div>
              </div>

              {/* Trabajador */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  formData.is_worker_group 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${isViewMode ? 'cursor-not-allowed opacity-75' : ''}`}
                onClick={() => !isViewMode && handleProfileTypeChange('worker')}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_worker_group}
                    onChange={() => !isViewMode && handleProfileTypeChange('worker')}
                    disabled={isViewMode}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      Trabajador
                    </div>
                    <div className="text-sm text-gray-500">
                      Usuario final que consume contenido
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {errors.tipo_perfil && (
              <p className="mt-2 text-sm text-red-600">{errors.tipo_perfil}</p>
            )}
          </div>

          {/* Estado activo */}
          {!isCreateMode && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                disabled={isViewMode}
                className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Perfil activo (los usuarios con este perfil podrán usar el sistema)
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isViewMode && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-600 border border-transparent rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                isCreateMode ? 'Crear Perfil' : 'Guardar Cambios'
              )}
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
};

ProfileModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editingProfile: PropTypes.object,
  loading: PropTypes.bool,
  mode: PropTypes.oneOf(['create', 'edit', 'view'])
};

export default ProfileModal;
 