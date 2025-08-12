import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, CustomDropdown } from '../Common';
import LoadingStates from './LoadingStates';

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

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    } else if (formData.titulo.length > 255) {
      newErrors.titulo = 'El título no puede exceder 255 caracteres';
    }

    if (!formData.mensaje.trim()) {
      newErrors.mensaje = 'El mensaje es requerido';
    }

    if (formData.tipo === 'individual' && !formData.destinatario) {
      newErrors.destinatario = 'El destinatario es requerido para notificaciones individuales';
    }

    // Validar JSON de datos si se proporciona
    if (formData.datos.trim()) {
      try {
        JSON.parse(formData.datos);
      } catch (e) {
        newErrors.datos = 'El formato JSON no es válido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  // Título del modal
  const modalTitle = isEditMode ? 'Editar Notificación' : 'Crear Nueva Notificación';

  return (
    <Modal show={show} onClose={onClose} title={modalTitle} size="lg">
      {loading ? (
        <LoadingStates.NotificationModalLoading />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div>
            <label htmlFor="titulo" className="block text-[13px] font-semibold text-gray-700 mb-2">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg text-[13px] focus:outline-none focus:ring-2 transition-all ${
                errors.titulo 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-200 focus:border-[#2D728F] focus:ring-[#2D728F]/20'
              }`}
              placeholder="Título de la notificación"
              maxLength={255}
            />
            {errors.titulo && (
              <p className="text-[13px] text-red-600 mt-1">{errors.titulo}</p>
            )}
          </div>

          {/* Mensaje */}
          <div>
            <label htmlFor="mensaje" className="block text-[13px] font-semibold text-gray-700 mb-2">
              Mensaje <span className="text-red-500">*</span>
            </label>
            <textarea
              id="mensaje"
              name="mensaje"
              value={formData.mensaje}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg text-[13px] focus:outline-none focus:ring-2 transition-all resize-none ${
                errors.mensaje 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-200 focus:border-[#2D728F] focus:ring-[#2D728F]/20'
              }`}
              placeholder="Contenido del mensaje..."
            />
            {errors.mensaje && (
              <p className="text-[13px] text-red-600 mt-1">{errors.mensaje}</p>
            )}
          </div>

          {/* Tipo y Destinatario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo */}
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                Tipo <span className="text-red-500">*</span>
              </label>
              <CustomDropdown
                value={formData.tipo}
                onChange={handleTipoChange}
                options={[
                  { value: 'individual', label: 'Individual' },
                  { value: 'broadcast', label: 'Broadcast (Todos)' },
                  { value: 'evento', label: 'Relacionado a Evento' },
                  { value: 'general', label: 'General' }
                ]}
                placeholder="Seleccionar tipo..."
                className="h-[48px]"
                showIcon={true}
                iconComponent={
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12a1 1 0 011-2h3a1 1 0 011 2v12z" />
                  </svg>
                }
                optionTextSize="text-[13px]"
              />
            </div>

            {/* Destinatario */}
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-2">
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
                className="h-[48px]"
                disabled={formData.tipo === 'broadcast'}
                showIcon={true}
                iconComponent={
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                optionTextSize="text-[13px]"
              />
              {errors.destinatario && (
                <p className="text-[13px] text-red-600 mt-1">{errors.destinatario}</p>
              )}
            </div>
          </div>

          {/* Evento (opcional) */}
          {formData.tipo === 'evento' && (
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                Evento Relacionado
              </label>
              <CustomDropdown
                value={formData.evento}
                onChange={(value) => setFormData(prev => ({ ...prev, evento: value }))}
                options={[
                  { value: '', label: 'Seleccionar evento...' },
                  ...eventos.map(evento => ({
                    value: evento.id.toString(),
                    label: evento.titulo
                  }))
                ]}
                placeholder="Seleccionar evento..."
                className="h-[48px]"
                showIcon={true}
                iconComponent={
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h6l2 2h6a2 2 0 012 2v4m-6 12H6a2 2 0 01-2-2v-7h16v7a2 2 0 01-2 2z" />
                  </svg>
                }
                optionTextSize="text-[13px]"
              />
            </div>
          )}

          {/* Datos adicionales (JSON) */}
          <div>
            <label htmlFor="datos" className="block text-[13px] font-semibold text-gray-700 mb-2">
              Datos Adicionales (JSON)
              <span className="text-gray-500 font-normal ml-1">(Opcional)</span>
            </label>
            <textarea
              id="datos"
              name="datos"
              value={formData.datos}
              onChange={handleChange}
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg text-[13px] focus:outline-none focus:ring-2 transition-all resize-none font-mono ${
                errors.datos 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-gray-200 focus:border-[#2D728F] focus:ring-[#2D728F]/20'
              }`}
              placeholder='{"key": "value", "otro": "dato"}'
            />
            {errors.datos && (
              <p className="text-[13px] text-red-600 mt-1">{errors.datos}</p>
            )}
            <p className="text-[12px] text-gray-500 mt-1">
              Formato JSON válido para datos adicionales de la notificación
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-[13px] text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-[13px] text-white bg-[#2D728F] rounded-lg hover:bg-[#2D728F]/90 focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading && <LoadingStates.ButtonLoading size="small" />}
              {isEditMode ? 'Actualizar' : 'Crear'} Notificación
            </button>
          </div>
        </form>
      )}
    </Modal>
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
