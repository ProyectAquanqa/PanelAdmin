/**
 * Modal para gestión de áreas siguiendo el patrón de ProfileModalNew
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../Common';

const AreaModal = ({
  show,
  onClose,
  onSubmit,
  editingArea,
  loading,
  mode = 'create',
  onValidateName
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    is_active: true
  });

  const [errors, setErrors] = useState({});
  const [validating, setValidating] = useState(false);

  // Derivar estados del mode
  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';
  const isViewMode = mode === 'view';

  // Resetear formulario cuando cambie el área editada o el mode
  useEffect(() => {
    if (isCreateMode) {
      setFormData({
        nombre: '',
        descripcion: '',
        is_active: true
      });
    } else if (editingArea && (isEditMode || isViewMode)) {
      setFormData({
        nombre: editingArea.nombre || '',
        descripcion: editingArea.descripcion || '',
        is_active: editingArea.is_active !== undefined ? editingArea.is_active : true
      });
    }
    setErrors({});
  }, [editingArea, mode, isCreateMode, isEditMode, isViewMode]);

  // Validar formulario
  const validateForm = async () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.nombre.trim().length > 100) {
      newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
    } else if (onValidateName) {
      // Validar nombre único si se proporciona la función
      setValidating(true);
      try {
        const validation = await onValidateName(formData.nombre.trim(), editingArea?.id);
        if (validation.exists) {
          newErrors.nombre = 'Ya existe un área con este nombre';
        }
      } catch (error) {
        console.error('Error validando nombre:', error);
      } finally {
        setValidating(false);
      }
    }

    // Validar descripción
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    } else if (formData.descripcion.trim().length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    } else if (formData.descripcion.trim().length > 500) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres';
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

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isViewMode) {
      onClose();
      return;
    }

    const isValid = await validateForm();
    if (!isValid || validating) return;

    const dataToSubmit = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim(),
      is_active: formData.is_active
    };

    const success = await onSubmit(dataToSubmit);
    if (success) {
      onClose();
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Crear Nueva Área';
      case 'edit': return 'Editar Área';
      case 'view': return 'Detalles del Área';
      default: return 'Gestionar Área';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'create': return 'Crea una nueva área organizacional para la empresa';
      case 'edit': return 'Modifica la información del área seleccionada';
      case 'view': return 'Información completa del área y sus estadísticas';
      default: return '';
    }
  };

  return (
    <Modal show={show} onClose={onClose} size="2xl">
      <div className="flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">
            {getTitle()}
          </h3>
          <p className="text-[13px] text-gray-500 mt-1">
            {getDescription()}
          </p>
        </div>

        {/* Contenido del formulario */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Vista de solo lectura */}
            {isViewMode && (
              <div className="space-y-4">
                {/* ID y Estado */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                      #{editingArea?.id}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        editingArea?.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {editingArea?.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total de Cargos
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                      {editingArea?.total_cargos || 0}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total de Usuarios
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                      {editingArea?.total_usuarios || 0}
                    </div>
                  </div>
                </div>

                {/* Fechas */}
                {editingArea?.created_at && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Creación
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                        {new Date(editingArea.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    {editingArea?.updated_at && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Última Actualización
                        </label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                          {new Date(editingArea.updated_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Nombre del área */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Área *
              </label>
              {isViewMode ? (
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  {editingArea?.nombre}
                </div>
              ) : (
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Recursos Humanos, Tecnología, Ventas..."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.nombre ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={loading || validating}
                />
              )}
              {errors.nombre && (
                <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              {isViewMode ? (
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 min-h-[80px]">
                  {editingArea?.descripcion}
                </div>
              ) : (
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Describe las responsabilidades y funciones principales de esta área..."
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                    errors.descripcion ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
              )}
              {errors.descripcion && (
                <p className="text-red-600 text-sm mt-1">{errors.descripcion}</p>
              )}
            </div>

            {/* Estado activo */}
            {!isViewMode && (
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    disabled={loading}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Área activa
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Las áreas inactivas no aparecerán en las listas de selección
                </p>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={loading}
              >
                {isViewMode ? 'Cerrar' : 'Cancelar'}
              </button>
              
              {!isViewMode && (
                <button
                  type="submit"
                  disabled={loading || validating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading || validating ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{validating ? 'Validando...' : 'Guardando...'}</span>
                    </div>
                  ) : (
                    isCreateMode ? 'Crear Área' : 'Guardar Cambios'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

AreaModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editingArea: PropTypes.object,
  loading: PropTypes.bool,
  mode: PropTypes.oneOf(['create', 'edit', 'view']),
  onValidateName: PropTypes.func
};

export default AreaModal;