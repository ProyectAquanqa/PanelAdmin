import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { BellIcon } from '@heroicons/react/24/solid';
import { CustomDropdown } from '../Common';
import LoadingStates from './LoadingStates';
import notificationsService from '../../services/notificationsService';

/**
 * Modal para crear/editar notificaciones
 * Sigue el patrón de KnowledgeModal con adaptaciones para notificaciones
 */
const NotificationModal = ({
  show,
  onClose,
  onSubmit,
  editingItem = null,
  usuarios = [],
  eventos = [],
  loading = false
}) => {
  const isEditMode = !!editingItem;
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    mensaje: '',
    tipo: 'individual',
    destinatario: '',
    evento: '',
    datos: ''
  });

  // Estado de validación
  const [errors, setErrors] = useState({});

  // Efecto para poblar formulario cuando se edita
  useEffect(() => {
    if (editingItem) {
      setFormData({
        titulo: editingItem.titulo || '',
        mensaje: editingItem.mensaje || '',
        tipo: editingItem.tipo || 'individual',
        destinatario: editingItem.destinatario?.id || '',
        evento: editingItem.evento?.id || '',
        datos: editingItem.datos ? JSON.stringify(editingItem.datos, null, 2) : ''
      });
    } else {
      setFormData({
        titulo: '',
        mensaje: '',
        tipo: 'individual',
        destinatario: '',
        evento: '',
        datos: ''
      });
    }
    setErrors({});
  }, [editingItem, show]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Manejar cambio de tipo
  const handleTipoChange = (value) => {
    setFormData(prev => ({
      ...prev,
      tipo: value,
      // Si cambia a broadcast, limpiar destinatario
      destinatario: value === 'broadcast' ? '' : prev.destinatario
    }));
  };

  // Validar formulario usando el servicio
  const validateForm = () => {
    const validation = notificationsService.validateNotificationData(formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Preparar datos para envío
    const submitData = {
      titulo: formData.titulo.trim(),
      mensaje: formData.mensaje.trim(),
      tipo: formData.tipo,
      destinatario: formData.tipo === 'broadcast' ? null : (formData.destinatario || null),
      evento: formData.evento || null,
      datos: formData.datos.trim() ? JSON.parse(formData.datos) : null
    };

    const success = await onSubmit(submitData);
    if (success) {
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-50 flex items-center justify-center p-4 opacity-100 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform scale-100 transition-transform duration-300">
        {/* Header Profesional con gradiente slate */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-5 rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Icono de campanita */}
              <div className="w-8 h-8 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                <BellIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">
                  {isEditMode ? 'Editar Notificación' : 'Crear Nueva Notificación'}
                </h3>
                <p className="text-[13px] text-gray-500 mt-1">
                  {isEditMode ? 'Modifica la información de la notificación' : 'Completa los campos para crear la notificación'}
                </p>
              </div>
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
          {loading ? (
            <LoadingStates.NotificationModalLoading />
          ) : (
            <form id="notification-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Título */}
              <div className="space-y-2">
                <label htmlFor="titulo" className="block text-[13px] font-semibold text-gray-700">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 border rounded-lg text-[13px] focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-gray-400 ${
                    errors.titulo 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:border-slate-600 focus:ring-slate-600/20'
                  }`}
                  placeholder="Título de la notificación"
                  maxLength={255}
                />
                {errors.titulo && (
                  <p className="text-[13px] text-red-600">{errors.titulo}</p>
                )}
              </div>

              {/* Mensaje */}
              <div className="space-y-2">
                <label htmlFor="mensaje" className="block text-[13px] font-semibold text-gray-700">
                  Mensaje <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  rows={4}
                  className={`block w-full px-4 py-3 border rounded-lg text-[13px] focus:outline-none focus:ring-2 transition-all duration-200 resize-none placeholder:text-gray-400 ${
                    errors.mensaje 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:border-slate-600 focus:ring-slate-600/20'
                  }`}
                  placeholder="Contenido del mensaje..."
                />
                {errors.mensaje && (
                  <p className="text-[13px] text-red-600">{errors.mensaje}</p>
                )}
              </div>

              {/* Grid para campos pequeños */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo */}
                <div className="space-y-2">
                  <label className="block text-[13px] font-semibold text-gray-700">
                    Tipo <span className="text-red-500">*</span>
                  </label>
                  <CustomDropdown
                    value={formData.tipo}
                    onChange={handleTipoChange}
                    options={[
                      { value: 'individual', label: 'Individual' },
                      { value: 'broadcast', label: 'Broadcast' }
                    ]}
                    placeholder="Seleccionar tipo..."
                  />
                </div>

                {/* Destinatario */}
                <div className="space-y-2">
                  <label className="block text-[13px] font-semibold text-gray-700">
                    Destinatario {formData.tipo === 'individual' && <span className="text-red-500">*</span>}
                  </label>
                  <CustomDropdown
                    value={formData.destinatario}
                    onChange={(value) => setFormData(prev => ({ ...prev, destinatario: value }))}
                    options={[
                      { value: '', label: formData.tipo === 'broadcast' ? 'Todos los usuarios' : 'Seleccionar usuario...' },
                      ...usuarios.map(usuario => ({
                        value: usuario.id.toString(),
                        label: `${usuario.first_name} ${usuario.last_name}`.trim() || usuario.username
                      }))
                    ]}
                    placeholder="Seleccionar destinatario..."
                    disabled={formData.tipo === 'broadcast'}
                  />
                  {errors.destinatario && (
                    <p className="text-[13px] text-red-600">{errors.destinatario}</p>
                  )}
                </div>
              </div>

              {/* Evento (opcional) */}
              <div className="space-y-2">
                <label className="block text-[13px] font-semibold text-gray-700">
                  Evento Relacionado <span className="text-gray-500 font-normal">(Opcional)</span>
                </label>
                <CustomDropdown
                  value={formData.evento}
                  onChange={(value) => setFormData(prev => ({ ...prev, evento: value }))}
                  options={[
                    { value: '', label: 'Sin evento relacionado' },
                    ...eventos.map(evento => ({
                      value: evento.id.toString(),
                      label: evento.titulo
                    }))
                  ]}
                  placeholder="Seleccionar evento..."
                />
              </div>

              {/* Datos adicionales (JSON) */}
              <div className="space-y-2">
                <label htmlFor="datos" className="block text-[13px] font-semibold text-gray-700">
                  Datos Adicionales (JSON) <span className="text-gray-500 font-normal">(Opcional)</span>
                </label>
                <textarea
                  id="datos"
                  name="datos"
                  value={formData.datos}
                  onChange={handleChange}
                  rows={3}
                  className={`block w-full px-4 py-3 border rounded-lg text-[13px] focus:outline-none focus:ring-2 transition-all duration-200 resize-none font-mono placeholder:text-gray-400 ${
                    errors.datos 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-200 focus:border-slate-600 focus:ring-slate-600/20'
                  }`}
                  placeholder='{"key": "value", "otro": "dato"}'
                />
                {errors.datos && (
                  <p className="text-[13px] text-red-600">{errors.datos}</p>
                )}
                <p className="text-[12px] text-gray-500">
                  Formato JSON válido para datos adicionales de la notificación
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Footer con botones - Estilo knowledge base */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl flex-shrink-0">
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="notification-form"
              className="px-5 py-2.5 text-[13px] font-medium text-white bg-slate-600 hover:bg-slate-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center gap-2"
              disabled={loading}
            >
              {loading && <LoadingStates.ButtonLoading size="small" />}
              {isEditMode ? 'Actualizar' : 'Crear'} Notificación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

NotificationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editingItem: PropTypes.object,
  usuarios: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      username: PropTypes.string.isRequired,
      first_name: PropTypes.string,
      last_name: PropTypes.string
    })
  ),
  eventos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      titulo: PropTypes.string.isRequired
    })
  ),
  loading: PropTypes.bool
};

export default NotificationModal;