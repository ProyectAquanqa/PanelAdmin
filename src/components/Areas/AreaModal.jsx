/**
 * Modal para crear/editar áreas siguiendo el diseño de KnowledgeModal
 * Diseño profesional y consistente con el patrón del sistema
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

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
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del área es obligatorio';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (formData.descripcion && formData.descripcion.trim().length > 0 && formData.descripcion.trim().length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en los campos
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Validar nombre único (debounced)
  const validateUniqueName = async (nombre) => {
    if (!nombre.trim() || nombre === editingArea?.nombre) {
      return;
    }

    setValidating(true);
    try {
      const result = await onValidateName(nombre, editingArea?.id);
      if (result.exists) {
        setErrors(prev => ({
          ...prev,
          nombre: 'Ya existe un área con este nombre'
        }));
      }
    } catch (error) {
      console.error('Error validando nombre:', error);
    } finally {
      setValidating(false);
    }
  };

  // Manejar envío del formulario
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (validating) {
      return;
    }

    // Datos a enviar
    const dataToSend = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim(),
      is_active: formData.is_active
    };

    try {
      const result = await onSubmit(dataToSend);
      if (result) {
        onClose();
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    }
  };

  // Función para verificar si el formulario es válido
  const isValid = () => {
    return formData.nombre.trim().length >= 3 && 
           Object.keys(errors).length === 0 && 
           !validating;
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header Profesional */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-5 rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">
                {isCreateMode && 'Crear Nueva Área'}
                {isEditMode && 'Editar Área'}
                {isViewMode && 'Ver Información del Área'}
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                {isCreateMode && 'Complete los campos para crear una nueva área organizacional'}
                {isEditMode && 'Modifique la información del área según sea necesario'}
                {isViewMode && 'Información completa del área y sus estadísticas'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-lg p-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido Principal con scroll controlado */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Nombre del área */}
            <div className="space-y-2">
              <label htmlFor="nombre" className="block text-[13px] font-semibold text-gray-700">
                Nombre del Área <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                onBlur={(e) => validateUniqueName(e.target.value)}
                disabled={isViewMode || loading}
                required
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Ingrese el nombre del área..."
              />
              {errors.nombre && (
                <p className="text-[13px] text-red-600">{errors.nombre}</p>
              )}
              {validating && (
                <p className="text-[13px] text-[#2D728F]">Validando nombre...</p>
              )}
            </div>
            
            {/* Descripción */}
            <div className="space-y-2">
              <label htmlFor="descripcion" className="block text-[13px] font-semibold text-gray-700">
                Descripción
              </label>
              <textarea
                id="descripcion"
                rows={4}
                value={formData.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                disabled={isViewMode || loading}
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200 placeholder:text-gray-400 resize-none disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Ingrese la descripción del área..."
              />
              {errors.descripcion && (
                <p className="text-[13px] text-red-600">{errors.descripcion}</p>
              )}
            </div>
            
            {/* Checkbox de activación */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                disabled={isViewMode || loading}
                className="h-4 w-4 text-[#2D728F] focus:ring-[#2D728F] border-gray-300 rounded transition-all"
              />
              <label htmlFor="is_active" className="text-[13px] font-medium text-gray-700">
                Activar área (estará disponible para asignar cargos y usuarios)
              </label>
            </div>

            {/* Información adicional en modo ver */}
            {isViewMode && editingArea && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h4 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">
                  Estadísticas del Área
                </h4>
                <div className="grid grid-cols-2 gap-4 text-[13px]">
                  <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-600">Total de Cargos:</span>
                    <span className="font-semibold text-blue-700">{editingArea.total_cargos || 0}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-600">Total de Usuarios:</span>
                    <span className="font-semibold text-green-700">{editingArea.total_usuarios || 0}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Fecha de Creación:</span>
                    <span className="font-semibold text-gray-700">
                      {editingArea.created_at ? new Date(editingArea.created_at).toLocaleDateString('es-ES') : 'No disponible'}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Última Actualización:</span>
                    <span className="font-semibold text-gray-700">
                      {editingArea.updated_at ? new Date(editingArea.updated_at).toLocaleDateString('es-ES') : 'No disponible'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer con botones */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl flex-shrink-0">
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
            >
              {isViewMode ? 'Cerrar' : 'Cancelar'}
            </button>
            {!isViewMode && (
              <button
                type="submit"
                onClick={handleFormSubmit}
                disabled={loading || !isValid()}
                className="px-5 py-2.5 text-[13px] font-medium text-white bg-[#2D728F] hover:bg-[#235A6F] border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                {loading ? 'Guardando...' : (isCreateMode ? 'Crear' : 'Actualizar')} Área
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
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

export default React.memo(AreaModal);