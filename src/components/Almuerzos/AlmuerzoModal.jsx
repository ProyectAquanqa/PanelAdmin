/**
 * Modal para crear/editar Almuerzos
 * Basado en EventoModal, adaptado para almuerzos
 */

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ButtonLoader } from './LoadingStates';

/**
 * Componente AlmuerzoModal - Modal para gestión de almuerzos
 */
const AlmuerzoModal = ({
  isOpen,
  onClose,
  onSubmit,
  almuerzo = null,
  loading = false,
  errors = {}
}) => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    fecha: '',
    entrada: '',
    plato_fondo: '',
    refresco: '',
    dieta: '',
    active: true,
    es_feriado: false,
    link: ''
  });

  // Estados de validación local
  const [localErrors, setLocalErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Modo edición
  const isEditing = Boolean(almuerzo);

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (almuerzo) {
        // Modo edición: cargar datos del almuerzo
        setFormData({
          fecha: almuerzo.fecha || '',
          entrada: almuerzo.entrada || '',
          plato_fondo: almuerzo.plato_fondo || '',
          refresco: almuerzo.refresco || '',
          dieta: almuerzo.dieta || '',
          active: almuerzo.active !== undefined ? almuerzo.active : true,
          es_feriado: almuerzo.es_feriado !== undefined ? almuerzo.es_feriado : false,
          link: almuerzo.link || ''
        });
      } else {
        // Modo creación: resetear formulario
        setFormData({
          fecha: '',
          entrada: '',
          plato_fondo: '',
          refresco: '',
          dieta: '',
          active: true,
          es_feriado: false,
          link: ''
        });
      }
      setLocalErrors({});
      setTouched({});
    }
  }, [isOpen, almuerzo]);

  // Validación en tiempo real
  const validateField = useCallback((name, value) => {
    const errors = {};

    switch (name) {
      case 'fecha':
        if (!value) {
          errors.fecha = 'La fecha es requerida';
        } else {
          // Validar formato de fecha
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(value)) {
            errors.fecha = 'Formato de fecha inválido';
          }
        }
        break;
      case 'entrada':
        if (!value.trim()) {
          errors.entrada = 'La entrada es requerida';
        } else if (value.trim().length > 100) {
          errors.entrada = 'La entrada no puede exceder 100 caracteres';
        }
        break;
      case 'plato_fondo':
        if (!value.trim()) {
          errors.plato_fondo = 'El plato de fondo es requerido';
        } else if (value.trim().length > 100) {
          errors.plato_fondo = 'El plato de fondo no puede exceder 100 caracteres';
        }
        break;
      case 'refresco':
        if (!value.trim()) {
          errors.refresco = 'El refresco es requerido';
        } else if (value.trim().length > 50) {
          errors.refresco = 'El refresco no puede exceder 50 caracteres';
        }
        break;
      case 'dieta':
        if (value && value.length > 100) {
          errors.dieta = 'La dieta no puede exceder 100 caracteres';
        }
        break;
      case 'link':
        if (value && value.length > 0) {
          try {
            new URL(value);
          } catch {
            errors.link = 'El link debe ser una URL válida';
          }
        }
        break;
    }

    return errors;
  }, []);

  // Manejar cambios en el formulario
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Marcar campo como tocado
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validar campo si ya fue tocado
    if (touched[name] || value !== '') {
      const fieldErrors = validateField(name, fieldValue);
      setLocalErrors(prev => ({
        ...prev,
        ...fieldErrors,
        // Remover error si el campo es válido
        ...(Object.keys(fieldErrors).length === 0 && { [name]: undefined })
      }));
    }
  }, [validateField, touched]);

  // Validar formulario completo
  const validateForm = useCallback(() => {
    const errors = {};

    Object.keys(formData).forEach(key => {
      const fieldErrors = validateField(key, formData[key]);
      Object.assign(errors, fieldErrors);
    });

    return errors;
  }, [formData, validateField]);

  // Manejar envío del formulario
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Marcar todos los campos como tocados
    const allFields = Object.keys(formData);
    setTouched(Object.fromEntries(allFields.map(field => [field, true])));

    // Validar formulario
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setLocalErrors(validationErrors);
      return;
    }

    // Preparar datos para envío
    const submitData = {
      ...formData,
      // Limpiar campos vacíos opcionales
      dieta: formData.dieta.trim() || null,
      link: formData.link.trim() || null,
    };

    // Enviar datos
    const success = await onSubmit(submitData);

    // Si fue exitoso, el modal se cerrará desde el componente padre
    if (success) {
      // El modal se cierra automáticamente desde el componente padre
    }
  }, [formData, validateForm, onSubmit]);

  // Combinar errores locales y del servidor
  const allErrors = { ...localErrors, ...errors };

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header Profesional */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-5 rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">
                {isEditing ? 'Editar Almuerzo' : 'Crear Nuevo Almuerzo'}
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                {isEditing ? 'Modifica la información del almuerzo' : 'Completa los campos para crear el almuerzo'}
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
          <form id="almuerzo-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Error general */}
            {allErrors.general && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="text-[13px] text-red-700">
                  {allErrors.general}
                </div>
              </div>
            )}

            {/* Fecha */}
            <div className="space-y-2">
              <label htmlFor="fecha" className="block text-[13px] font-semibold text-gray-700">
                Fecha del almuerzo <span className="text-red-500">*</span>
              </label>
              <input
                id="fecha"
                name="fecha"
                type="date"
                required
                min={isEditing ? undefined : today}
                value={formData.fecha}
                onChange={handleChange}
                className={`block w-full px-4 py-3 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200 ${allErrors.fecha
                    ? 'border-red-300 text-red-900'
                    : 'border-gray-200 text-gray-900'
                  }`}
              />
              {allErrors.fecha && (
                <p className="text-[13px] text-red-600">{allErrors.fecha}</p>
              )}
            </div>

            {/* Grid para campos principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Entrada */}
              <div className="space-y-2">
                <label htmlFor="entrada" className="block text-[13px] font-semibold text-gray-700">
                  Entrada <span className="text-red-500">*</span>
                </label>
                <input
                  id="entrada"
                  name="entrada"
                  type="text"
                  required
                  maxLength={100}
                  value={formData.entrada}
                  onChange={handleChange}
                  placeholder="Ej: Sopa de verduras"
                  className={`block w-full px-4 py-3 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200 placeholder:text-gray-400 ${allErrors.entrada
                      ? 'border-red-300 text-red-900'
                      : 'border-gray-200 text-gray-900'
                    }`}
                />
                {allErrors.entrada && (
                  <p className="text-[13px] text-red-600">{allErrors.entrada}</p>
                )}
                <p className="text-[13px] text-gray-500">
                  {formData.entrada.length}/100 caracteres
                </p>
              </div>

              {/* Plato de fondo */}
              <div className="space-y-2">
                <label htmlFor="plato_fondo" className="block text-[13px] font-semibold text-gray-700">
                  Plato de fondo <span className="text-red-500">*</span>
                </label>
                <input
                  id="plato_fondo"
                  name="plato_fondo"
                  type="text"
                  required
                  maxLength={100}
                  value={formData.plato_fondo}
                  onChange={handleChange}
                  placeholder="Ej: Pollo a la plancha con arroz"
                  className={`block w-full px-4 py-3 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200 placeholder:text-gray-400 ${allErrors.plato_fondo
                      ? 'border-red-300 text-red-900'
                      : 'border-gray-200 text-gray-900'
                    }`}
                />
                {allErrors.plato_fondo && (
                  <p className="text-[13px] text-red-600">{allErrors.plato_fondo}</p>
                )}
                <p className="text-[13px] text-gray-500">
                  {formData.plato_fondo.length}/100 caracteres
                </p>
              </div>
            </div>

            {/* Grid para campos secundarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Refresco */}
              <div className="space-y-2">
                <label htmlFor="refresco" className="block text-[13px] font-semibold text-gray-700">
                  Refresco <span className="text-red-500">*</span>
                </label>
                <input
                  id="refresco"
                  name="refresco"
                  type="text"
                  required
                  maxLength={50}
                  value={formData.refresco}
                  onChange={handleChange}
                  placeholder="Ej: Jugo de naranja"
                  className={`block w-full px-4 py-3 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200 placeholder:text-gray-400 ${allErrors.refresco
                      ? 'border-red-300 text-red-900'
                      : 'border-gray-200 text-gray-900'
                    }`}
                />
                {allErrors.refresco && (
                  <p className="text-[13px] text-red-600">{allErrors.refresco}</p>
                )}
                <p className="text-[13px] text-gray-500">
                  {formData.refresco.length}/50 caracteres
                </p>
              </div>

              {/* Dieta */}
              <div className="space-y-2">
                <label htmlFor="dieta" className="block text-[13px] font-semibold text-gray-700">
                  Menú de dieta
                </label>
                <input
                  id="dieta"
                  name="dieta"
                  type="text"
                  maxLength={100}
                  value={formData.dieta}
                  onChange={handleChange}
                  placeholder="Ej: Ensalada con pollo sin sal"
                  className={`block w-full px-4 py-3 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200 placeholder:text-gray-400 ${allErrors.dieta
                      ? 'border-red-300 text-red-900'
                      : 'border-gray-200 text-gray-900'
                    }`}
                />
                {allErrors.dieta && (
                  <p className="text-[13px] text-red-600">{allErrors.dieta}</p>
                )}
                <p className="text-[13px] text-gray-500">
                  {formData.dieta.length}/100 caracteres
                </p>
              </div>
            </div>

            {/* Link de pedido */}
            <div className="space-y-2">
              <label htmlFor="link" className="block text-[13px] font-semibold text-gray-700">
                Link de pedido
              </label>
              <input
                id="link"
                name="link"
                type="url"
                value={formData.link}
                onChange={handleChange}
                placeholder="https://ejemplo.com/pedido"
                className={`block w-full px-4 py-3 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200 placeholder:text-gray-400 ${allErrors.link
                    ? 'border-red-300 text-red-900'
                    : 'border-gray-200 text-gray-900'
                  }`}
              />
              {allErrors.link && (
                <p className="text-[13px] text-red-600">{allErrors.link}</p>
              )}
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  id="active"
                  name="active"
                  type="checkbox"
                  checked={formData.active}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#2D728F] focus:ring-[#2D728F] border-gray-300 rounded transition-all"
                />
                <label htmlFor="active" className="text-[13px] font-medium text-gray-700">
                  Almuerzo activo (disponible para pedidos)
                </label>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <input
                  id="es_feriado"
                  name="es_feriado"
                  type="checkbox"
                  checked={formData.es_feriado}
                  onChange={handleChange}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-all"
                />
                <label htmlFor="es_feriado" className="text-[13px] font-medium text-gray-700">
                  Es feriado (sin servicio)
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Footer con botones */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl flex-shrink-0">
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Cancelar
            </button>

            <button
              type="submit"
              form="almuerzo-form"
              disabled={loading}
              className="px-5 py-2.5 text-[13px] font-medium text-white bg-[#2D728F] hover:bg-[#235A6F] border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center gap-2"
            >
              {loading && <ButtonLoader size={4} />}
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')} Almuerzo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

AlmuerzoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  almuerzo: PropTypes.shape({
    id: PropTypes.number,
    fecha: PropTypes.string,
    entrada: PropTypes.string,
    plato_fondo: PropTypes.string,
    refresco: PropTypes.string,
    dieta: PropTypes.string,
    active: PropTypes.bool,
    es_feriado: PropTypes.bool,
    link: PropTypes.string,
  }),
  loading: PropTypes.bool,
  errors: PropTypes.object,
};

export default React.memo(AlmuerzoModal);
