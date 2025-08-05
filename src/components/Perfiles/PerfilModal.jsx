/**
 * Modal para crear y editar perfiles
 * Componente completo con validaciones y manejo de permisos
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../Common';
import { perfilesService } from '../../services/perfilesService';

const PerfilModal = ({
  isOpen,
  onClose,
  perfil = null,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo_acceso: 'AMBOS',
    is_active: true,
    is_admin_profile: false,
    is_worker_profile: false,
    permisos_eventos: 'NONE',
    permisos_chatbot: 'NONE',
    permisos_usuarios: 'NONE',
    permisos_core: 'NONE',
    permisos_notificaciones: 'NONE'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isEditing = !!perfil;

  // Cargar datos del perfil al abrir para edición
  useEffect(() => {
    if (isOpen && perfil) {
      setFormData({
        nombre: perfil.nombre || '',
        descripcion: perfil.descripcion || '',
        tipo_acceso: perfil.tipo_acceso || 'AMBOS',
        is_active: perfil.is_active ?? true,
        is_admin_profile: perfil.is_admin_profile || false,
        is_worker_profile: perfil.is_worker_profile || false,
        permisos_eventos: perfil.permisos_eventos || 'NONE',
        permisos_chatbot: perfil.permisos_chatbot || 'NONE',
        permisos_usuarios: perfil.permisos_usuarios || 'NONE',
        permisos_core: perfil.permisos_core || 'NONE',
        permisos_notificaciones: perfil.permisos_notificaciones || 'NONE'
      });
    } else if (isOpen && !perfil) {
      // Resetear formulario para creación
      setFormData({
        nombre: '',
        descripcion: '',
        tipo_acceso: 'AMBOS',
        is_active: true,
        is_admin_profile: false,
        is_worker_profile: false,
        permisos_eventos: 'NONE',
        permisos_chatbot: 'NONE',
        permisos_usuarios: 'NONE',
        permisos_core: 'NONE',
        permisos_notificaciones: 'NONE'
      });
    }
    setErrors({});
  }, [isOpen, perfil]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar error del campo modificado
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Validaciones especiales
    if (name === 'is_admin_profile' && checked) {
      setFormData(prev => ({ ...prev, is_worker_profile: false }));
    } else if (name === 'is_worker_profile' && checked) {
      setFormData(prev => ({ ...prev, is_admin_profile: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    const validation = perfilesService.validatePerfilData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);

    try {
      let result;
      if (isEditing) {
        result = await perfilesService.updatePerfil(perfil.id, formData);
      } else {
        result = await perfilesService.createPerfil(formData);
      }

      if (result.success) {
        onSuccess?.(result.data);
        onClose();
      } else {
        if (typeof result.error === 'object') {
          setErrors(result.error);
        } else {
          setErrors({ general: result.error });
        }
      }
    } catch (error) {
      setErrors({ general: 'Error inesperado al guardar el perfil' });
    } finally {
      setLoading(false);
    }
  };

  const permisosOptions = perfilesService.getPermisosOptions();
  const tipoAccesoOptions = perfilesService.getTipoAccesoOptions();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Perfil' : 'Crear Nuevo Perfil'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error general */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Perfil *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.nombre ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Ej: Admin, QA, Supervisor"
            />
            {errors.nombre && (
              <p className="text-red-600 text-xs mt-1">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Acceso
            </label>
            <select
              name="tipo_acceso"
              value={formData.tipo_acceso}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tipoAccesoOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.descripcion ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Describe las responsabilidades y funciones de este perfil..."
          />
          {errors.descripcion && (
            <p className="text-red-600 text-xs mt-1">{errors.descripcion}</p>
          )}
        </div>

        {/* Tipo de perfil */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Perfil *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_admin_profile"
                checked={formData.is_admin_profile}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Perfil Administrativo</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_worker_profile"
                checked={formData.is_worker_profile}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Perfil de Trabajador</span>
            </label>
          </div>
          {errors.tipo_perfil && (
            <p className="text-red-600 text-xs mt-1">{errors.tipo_perfil}</p>
          )}
        </div>

        {/* Permisos por módulo */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Permisos por Módulo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'permisos_eventos', label: 'Eventos' },
              { key: 'permisos_chatbot', label: 'Chatbot' },
              { key: 'permisos_usuarios', label: 'Usuarios' },
              { key: 'permisos_core', label: 'Configuración' },
              { key: 'permisos_notificaciones', label: 'Notificaciones' }
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {label}
                </label>
                <select
                  name={key}
                  value={formData[key]}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={formData.is_worker_profile && (key === 'permisos_usuarios' || key === 'permisos_core')}
                >
                  {permisosOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {errors.permisos && (
            <p className="text-red-600 text-xs mt-2">{errors.permisos}</p>
          )}
        </div>

        {/* Estado activo */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Perfil activo</span>
          </label>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

PerfilModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  perfil: PropTypes.object,
  onSuccess: PropTypes.func
};

export default PerfilModal;