/**
 * Modal para crear/editar Almuerzos
 * Basado en EventoModal, adaptado para almuerzos
 */

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Modal } from '../Common/Modal';
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Almuerzo' : 'Crear Nuevo Almuerzo'}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error general */}
        {allErrors.general && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">
              {allErrors.general}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fecha */}
          <div className="md:col-span-2">
            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha del almuerzo *
            </label>
            <input
              id="fecha"
              name="fecha"
              type="date"
              required
              min={today}
              value={formData.fecha}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2D728F] focus:border-transparent transition-colors ${
                allErrors.fecha
                  ? 'border-red-300 text-red-900 placeholder-red-300'
                  : 'border-gray-300 text-gray-900'
              }`}
            />
            {allErrors.fecha && (
              <p className="mt-1 text-sm text-red-600">{allErrors.fecha}</p>
            )}
          </div>

          {/* Entrada */}
          <div>
            <label htmlFor="entrada" className="block text-sm font-medium text-gray-700 mb-2">
              Entrada *
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
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2D728F] focus:border-transparent transition-colors ${
                allErrors.entrada
                  ? 'border-red-300 text-red-900 placeholder-red-300'
                  : 'border-gray-300 text-gray-900'
              }`}
            />
            {allErrors.entrada && (
              <p className="mt-1 text-sm text-red-600">{allErrors.entrada}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.entrada.length}/100 caracteres
            </p>
          </div>

          {/* Plato de fondo */}
          <div>
            <label htmlFor="plato_fondo" className="block text-sm font-medium text-gray-700 mb-2">
              Plato de fondo *
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
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2D728F] focus:border-transparent transition-colors ${
                allErrors.plato_fondo
                  ? 'border-red-300 text-red-900 placeholder-red-300'
                  : 'border-gray-300 text-gray-900'
              }`}
            />
            {allErrors.plato_fondo && (
              <p className="mt-1 text-sm text-red-600">{allErrors.plato_fondo}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.plato_fondo.length}/100 caracteres
            </p>
          </div>

          {/* Refresco */}
          <div>
            <label htmlFor="refresco" className="block text-sm font-medium text-gray-700 mb-2">
              Refresco *
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
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2D728F] focus:border-transparent transition-colors ${
                allErrors.refresco
                  ? 'border-red-300 text-red-900 placeholder-red-300'
                  : 'border-gray-300 text-gray-900'
              }`}
            />
            {allErrors.refresco && (
              <p className="mt-1 text-sm text-red-600">{allErrors.refresco}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.refresco.length}/50 caracteres
            </p>
          </div>

          {/* Dieta */}
          <div>
            <label htmlFor="dieta" className="block text-sm font-medium text-gray-700 mb-2">
              Menú de dieta (opcional)
            </label>
            <input
              id="dieta"
              name="dieta"
              type="text"
              maxLength={100}
              value={formData.dieta}
              onChange={handleChange}
              placeholder="Ej: Ensalada con pollo sin sal"
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2D728F] focus:border-transparent transition-colors ${
                allErrors.dieta
                  ? 'border-red-300 text-red-900 placeholder-red-300'
                  : 'border-gray-300 text-gray-900'
              }`}
            />
            {allErrors.dieta && (
              <p className="mt-1 text-sm text-red-600">{allErrors.dieta}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.dieta.length}/100 caracteres
            </p>
          </div>

          {/* Link de pedido */}
          <div className="md:col-span-2">
            <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
              Link de pedido (opcional)
            </label>
            <input
              id="link"
              name="link"
              type="url"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://ejemplo.com/pedido"
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2D728F] focus:border-transparent transition-colors ${
                allErrors.link
                  ? 'border-red-300 text-red-900 placeholder-red-300'
                  : 'border-gray-300 text-gray-900'
              }`}
            />
            {allErrors.link && (
              <p className="mt-1 text-sm text-red-600">{allErrors.link}</p>
            )}
          </div>

          {/* Checkboxes */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center">
              <input
                id="active"
                name="active"
                type="checkbox"
                checked={formData.active}
                onChange={handleChange}
                className="h-4 w-4 text-[#2D728F] focus:ring-[#2D728F] border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                Almuerzo activo (disponible para pedidos)
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="es_feriado"
                name="es_feriado"
                type="checkbox"
                checked={formData.es_feriado}
                onChange={handleChange}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="es_feriado" className="ml-2 block text-sm text-gray-900">
                Es feriado (sin servicio)
              </label>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D728F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-[#2D728F] border border-transparent rounded-lg hover:bg-[#235A6F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D728F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading && <ButtonLoader size={4} />}
            {isEditing ? 'Actualizar' : 'Crear'} Almuerzo
          </button>
        </div>
      </form>
    </Modal>
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
