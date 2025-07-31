/**
 * Modal para crear/editar categorías del chatbot
 * Siguiendo el diseño minimalista y profesional de Knowledge Base
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useKnowledgeForm } from '../../../hooks/useKnowledgeForm';

/**
 * Componente de modal para crear/editar categorías
 */
const CategoryModal = ({
  show,
  onClose,
  onSubmit,
  editingCategory,
  loading
}) => {
  // Usar hook de formulario
  const {
    formData,
    errors,
    handleChange,
    handleSubmit,
    getInputProps,
    getCheckboxProps,
    isValid
  } = useKnowledgeForm(editingCategory || {}, { formType: 'category' });

  // Manejar envío del formulario
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    const result = await handleSubmit(onSubmit);
    
    if (result.success) {
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        {/* Header Profesional */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-5 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">
                {editingCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                {editingCategory ? 'Modifica los datos de la categoría' : 'Completa los campos requeridos'}
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

        {/* Contenido Principal sin scroll */}
        <div className="px-6 py-6">
          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* Nombre de la categoría */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-[13px] font-semibold text-gray-700">
                Nombre de la Categoría <span className="text-red-500">*</span>
              </label>
              <input
                {...getInputProps('name')}
                type="text"
                id="name"
                required
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200 placeholder:text-gray-400"
                placeholder="Ej: Información General, Soporte Técnico..."
              />
              {errors.name && (
                <p className="text-[13px] text-red-600">{errors.name}</p>
              )}
            </div>
            
            {/* Descripción */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-[13px] font-semibold text-gray-700">
                Descripción (Opcional)
              </label>
              <textarea
                {...getInputProps('description')}
                id="description"
                rows={4}
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200 resize-none placeholder:text-gray-400"
                placeholder="Describe qué tipo de preguntas incluye esta categoría..."
              />
              {errors.description && (
                <p className="text-[13px] text-red-600">{errors.description}</p>
              )}
            </div>
            
            {/* Checkbox de activación */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input
                {...getCheckboxProps('is_active')}
                type="checkbox"
                id="is_active"
                className="h-4 w-4 text-[#2D728F] focus:ring-[#2D728F] border-gray-300 rounded transition-all"
              />
              <label htmlFor="is_active" className="text-[13px] font-medium text-gray-700">
                Categoría activa (estará disponible para asignar a conocimientos)
              </label>
            </div>
          </form>
        </div>

        {/* Footer con botones */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleFormSubmit}
              disabled={loading || !isValid}
              className="px-5 py-2.5 text-[13px] font-medium text-white bg-[#2D728F] hover:bg-[#235A6F] border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              {loading ? 'Guardando...' : (editingCategory ? 'Actualizar' : 'Crear')} Categoría
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

CategoryModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editingCategory: PropTypes.object,
  loading: PropTypes.bool
};

export default CategoryModal; 