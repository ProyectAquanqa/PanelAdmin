import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { LoadingStates } from '.';
import toast from 'react-hot-toast';

/**
 * Modal para crear y editar cargos siguiendo el patrón de EventoModal
 * Diseño profesional con header gradiente y footer consistente
 */
const CargoModal = ({
  show,
  onClose,
  onSubmit,
  editingCargo = null,
  areas = [],
  loading = false,
  mode = 'create',
  onValidateName = null
}) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    area: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingName, setIsValidatingName] = useState(false);

  const isEditing = mode === 'edit' && editingCargo;
  const isViewing = mode === 'view';

  // Resetear formulario cuando cambia el cargo en edición
  useEffect(() => {
    if (show) {
      if (isEditing) {
        setFormData({
          nombre: editingCargo.nombre || '',
          descripcion: editingCargo.descripcion || '',
          area: editingCargo.area?.toString() || ''
        });
      } else {
        setFormData({
          nombre: '',
          descripcion: '',
          area: ''
        });
      }
      setErrors({});
    }
  }, [show, editingCargo, isEditing]);

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error específico cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validar nombre en tiempo real (con debounce)
  useEffect(() => {
    if (!formData.nombre.trim() || isEditing || !onValidateName) return;

    const timeoutId = setTimeout(async () => {
      if (formData.nombre.trim().length >= 2) {
        setIsValidatingName(true);
        try {
          const result = await onValidateName(formData.nombre, isEditing ? editingCargo.id : null);
          if (result.exists) {
            setErrors(prev => ({
              ...prev,
              nombre: 'Ya existe un cargo con este nombre en alguna área'
            }));
          }
        } catch (error) {
          console.error('Error validating name:', error);
        } finally {
          setIsValidatingName(false);
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.nombre, isEditing, editingCargo?.id, onValidateName]);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del cargo es obligatorio';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.area) {
      newErrors.area = 'Debe seleccionar un área';
    }

    if (formData.descripcion && formData.descripcion.length > 150) {
      newErrors.descripcion = 'La descripción no puede exceder 150 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrija los errores en el formulario');
      return;
    }

    if (isValidatingName) {
      toast.error('Esperando validación del nombre...');
      return;
    }

    if (errors.nombre) {
      toast.error('El nombre del cargo ya existe');
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSubmit = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        area: parseInt(formData.area)
      };

      const success = await onSubmit(dataToSubmit);
      
      if (success !== false) {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} el cargo`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Obtener área activa por ID
  const getAreaById = (areaId) => {
    return areas.find(area => area.id === parseInt(areaId));
  };

  // Filtrar solo áreas activas
  const activeAreas = areas.filter(area => area.is_active);

  // Manejar cierre del modal
  const handleClose = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      area: ''
    });
    setErrors({});
    onClose();
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
                {isEditing ? 'Editar Cargo' : 'Crear Nuevo Cargo'}
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                {isEditing ? 'Modifica la información del cargo' : 'Completa los campos para crear el cargo'}
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

        {/* Contenido Principal con scroll controlado */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <LoadingStates.CargoModalLoading />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Nombre */}
              <div className="space-y-2">
                <label htmlFor="nombre" className="block text-[13px] font-semibold text-gray-700">
                  Nombre del Cargo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    disabled={isViewing}
                    className={`block w-full px-4 py-3 border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all duration-200 placeholder:text-gray-400 ${
                      errors.nombre
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200'
                    } ${isViewing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="Ingrese el nombre del cargo..."
                    maxLength={100}
                  />
                  {isValidatingName && (
                    <div className="absolute right-3 top-3.5">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-500"></div>
                    </div>
                  )}
                </div>
                {errors.nombre && (
                  <p className="text-[13px] text-red-600">{errors.nombre}</p>
                )}
                <p className="text-[11px] text-gray-500">
                  {formData.nombre.length}/100 caracteres
                </p>
              </div>

              {/* Campo Área */}
              <div className="space-y-2">
                <label htmlFor="area" className="block text-[13px] font-semibold text-gray-700">
                  Área <span className="text-red-500">*</span>
                </label>
                <select
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  disabled={isViewing}
                  className={`block w-full px-4 py-3 border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all duration-200 ${
                    errors.area
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200'
                  } ${isViewing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">Seleccionar área...</option>
                  {activeAreas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.nombre}
                    </option>
                  ))}
                </select>
                {errors.area && (
                  <p className="text-[13px] text-red-600">{errors.area}</p>
                )}
                {formData.area && !getAreaById(formData.area)?.is_active && (
                  <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-[13px] text-orange-700">
                      El área seleccionada está inactiva
                    </p>
                  </div>
                )}
              </div>

              {/* Campo Descripción */}
              <div className="space-y-2">
                <label htmlFor="descripcion" className="block text-[13px] font-semibold text-gray-700">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  disabled={isViewing}
                  rows={3}
                  className={`block w-full px-4 py-3 border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all duration-200 resize-none placeholder:text-gray-400 ${
                    errors.descripcion
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200'
                  } ${isViewing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  placeholder="Descripción opcional del cargo..."
                  maxLength={150}
                />
                {errors.descripcion && (
                  <p className="text-[13px] text-red-600">{errors.descripcion}</p>
                )}
                <p className="text-[11px] text-gray-500">
                  {formData.descripcion.length}/150 caracteres
                </p>
              </div>

              {/* Errores generales */}
              {Object.keys(errors).length > 0 && Object.keys(errors).some(key => !['nombre', 'area', 'descripcion'].includes(key)) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-[13px] text-red-600">Por favor, corrija los errores indicados</p>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer con botones - Igual que eventos */}
        {!isViewing && !loading && (
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl flex-shrink-0">
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || isValidatingName || !!errors.nombre}
                className="px-5 py-2.5 text-[13px] font-medium text-white bg-slate-600 hover:bg-slate-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isEditing ? 'Actualizando...' : 'Creando...'}
                  </div>
                ) : (
                  `${isEditing ? 'Actualizar' : 'Crear'} Cargo`
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

CargoModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editingCargo: PropTypes.shape({
    id: PropTypes.number,
    nombre: PropTypes.string,
    descripcion: PropTypes.string,
    area: PropTypes.number
  }),
  areas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
      descripcion: PropTypes.string,
      is_active: PropTypes.bool
    })
  ),
  loading: PropTypes.bool,
  mode: PropTypes.oneOf(['create', 'edit', 'view']),
  onValidateName: PropTypes.func
};

export default CargoModal;
