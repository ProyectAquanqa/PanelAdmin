/**
 * Modal para crear/editar eventos
 * Siguiendo el diseño de KnowledgeModal para consistencia
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useCategorias } from '../../hooks/useCategorias';
import { CustomDropdown } from '../Common';

/**
 * Componente EventoModal - Modal para crear/editar eventos
 */
const EventoModal = ({
  isOpen,
  onClose,
  onSubmit,
  evento,
  loading = false,
  errors = {}
}) => {
  const { categorias, loadCategorias } = useCategorias();
  const [imagePreview, setImagePreview] = useState(null);
  
  const isEditing = !!evento;

  // Estado del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    categoria_id: '',
    publicado: false,
    imagen: null
  });

  // Cargar categorías al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadCategorias();
    }
  }, [isOpen, loadCategorias]);

  // Cargar datos del evento si está editando
  useEffect(() => {
    if (evento) {
      setFormData({
        titulo: evento.titulo || '',
        descripcion: evento.descripcion || '',
        fecha: evento.fecha ? new Date(evento.fecha).toISOString().slice(0, 16) : '',
        categoria_id: evento.categoria?.id || '',
        publicado: evento.publicado || false,
        imagen: null
      });
      
      // Mostrar imagen existente
      if (evento.imagen_url) {
        setImagePreview(evento.imagen_url);
      }
    } else {
      setFormData({
        titulo: '',
        descripcion: '',
        fecha: '',
        categoria_id: '',
        publicado: false,
        imagen: null
      });
      setImagePreview(null);
    }
  }, [evento]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Manejar cambio de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imagen: file
      }));

      // Mostrar vista previa
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Manejar envío del formulario
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append('titulo', formData.titulo);
    submitData.append('descripcion', formData.descripcion);
    submitData.append('fecha', formData.fecha);
    submitData.append('publicado', formData.publicado);
    
    if (formData.categoria_id) {
      submitData.append('categoria_id', formData.categoria_id);
    }
    
    if (formData.imagen) {
      submitData.append('imagen', formData.imagen);
    }

    const result = await onSubmit(submitData);
    if (result !== false) {
      handleClose();
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      fecha: '',
      categoria_id: '',
      publicado: false,
      imagen: null
    });
    setImagePreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header Profesional */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-5 rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">
                {isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                {isEditing ? 'Modifica la información del evento' : 'Completa los campos para crear el evento'}
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
          <form onSubmit={handleFormSubmit} className="space-y-6">
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
                required
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200 placeholder:text-gray-400"
                placeholder="Ingrese el título del evento..."
              />
              {errors.titulo && (
                <p className="text-[13px] text-red-600">{errors.titulo}</p>
              )}
            </div>
            
            {/* Descripción */}
            <div className="space-y-2">
              <label htmlFor="descripcion" className="block text-[13px] font-semibold text-gray-700">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                required
                rows={4}
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200 resize-none placeholder:text-gray-400"
                placeholder="Describa el evento..."
              />
              {errors.descripcion && (
                <p className="text-[13px] text-red-600">{errors.descripcion}</p>
              )}
            </div>
            
            {/* Grid para campos pequeños */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha */}
              <div className="space-y-2">
                <label htmlFor="fecha" className="block text-[13px] font-semibold text-gray-700">
                  Fecha y Hora <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="fecha"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200"
                />
                {errors.fecha && (
                  <p className="text-[13px] text-red-600">{errors.fecha}</p>
                )}
              </div>
              
              {/* Categoría */}
              <div className="space-y-2">
                <label htmlFor="categoria" className="block text-[13px] font-semibold text-gray-700">
                  Categoría
                </label>
                <CustomDropdown
                  value={formData.categoria_id ? String(formData.categoria_id) : ''}
                  onChange={(value) => handleChange({ target: { name: 'categoria_id', value } })}
                  options={[
                    { value: '', label: 'Seleccionar categoría...' },
                    ...categorias.map(categoria => ({ value: String(categoria.id), label: categoria.nombre }))
                  ]}
                  placeholder="Seleccionar categoría..."
                />
                {errors.categoria_id && (
                  <p className="text-[13px] text-red-600">{errors.categoria_id}</p>
                )}
              </div>
            </div>

            {/* Imagen */}
            <div className="space-y-2">
              <label htmlFor="imagen" className="block text-[13px] font-semibold text-gray-700">
                Imagen del evento
              </label>
              <input
                type="file"
                id="imagen"
                name="imagen"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200"
              />
              {errors.imagen && (
                <p className="text-[13px] text-red-600">{errors.imagen}</p>
              )}
              
              {/* Vista previa de imagen */}
              {imagePreview && (
                <div className="mt-3">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="w-full h-40 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
            
            {/* Checkbox de publicación - Igual que el is_active de knowledge base */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="publicado"
                name="publicado"
                checked={formData.publicado}
                onChange={handleChange}
                className="h-4 w-4 text-[#2D728F] focus:ring-[#2D728F] border-gray-300 rounded transition-all"
              />
              <label htmlFor="publicado" className="text-[13px] font-medium text-gray-700">
                Publicar evento (estará visible para todos los usuarios)
              </label>
            </div>

            {/* Errores generales */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-[13px] text-red-600">{errors.general}</p>
              </div>
            )}
          </form>
        </div>

        {/* Footer con botones - Igual que knowledge base */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl flex-shrink-0">
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleFormSubmit}
              disabled={loading}
              className="px-5 py-2.5 text-[13px] font-medium text-white bg-[#2D728F] hover:bg-[#235A6F] border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')} Evento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

EventoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  evento: PropTypes.object,
  loading: PropTypes.bool,
  errors: PropTypes.object
};

export default React.memo(EventoModal);