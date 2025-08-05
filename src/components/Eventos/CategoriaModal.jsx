/**
 * Modal para crear/editar categorías de eventos
 * Siguiendo el diseño de KnowledgeModal para consistencia
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente CategoriaModal - Modal para crear/editar categorías
 */
const CategoriaModal = ({
  isOpen,
  onClose,
  onSubmit,
  categoria,
  loading = false,
  errors = {}
}) => {
  const isEditing = !!categoria;

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    is_active: true
  });

  // Cargar datos de la categoría si está editando
  useEffect(() => {
    if (categoria) {
      setFormData({
        nombre: categoria.nombre || '',
        descripcion: categoria.descripcion || '',
        is_active: categoria.is_active !== undefined ? categoria.is_active : true
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        is_active: true
      });
    }
  }, [categoria]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Manejar envío del formulario
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    const result = await onSubmit(formData);
    if (result !== false) {
      handleClose();
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      is_active: true
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header Profesional */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-5 rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">
                {isEditing ? 'Editar Categoría' : 'Crear Nueva Categoría'}
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                {isEditing ? 'Modifica la información de la categoría' : 'Completa los campos para crear la categoría'}
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
            {/* Nombre */}
            <div className="space-y-2">
              <label htmlFor="nombre" className="block text-[13px] font-semibold text-gray-700">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200 placeholder:text-gray-400"
                placeholder="Ingrese el nombre de la categoría..."
              />
              {errors.nombre && (
                <p className="text-[13px] text-red-600">{errors.nombre}</p>
              )}
            </div>
            
            {/* Descripción */}
            <div className="space-y-2">
              <label htmlFor="descripcion" className="block text-[13px] font-semibold text-gray-700">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200 resize-none placeholder:text-gray-400"
                placeholder="Describa la categoría (opcional)..."
              />
              {errors.descripcion && (
                <p className="text-[13px] text-red-600">{errors.descripcion}</p>
              )}
            </div>

            {/* Checkbox de activación - Igual que el is_active de knowledge base */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-[#2D728F] focus:ring-[#2D728F] border-gray-300 rounded transition-all"
              />
              <label htmlFor="is_active" className="text-[13px] font-medium text-gray-700">
                Activar categoría (estará disponible para asignar a eventos)
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
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')} Categoría
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

CategoriaModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  categoria: PropTypes.object,
  loading: PropTypes.bool,
  errors: PropTypes.object
};

export default React.memo(CategoriaModal);