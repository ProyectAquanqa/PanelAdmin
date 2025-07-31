/**
 * Modal para crear/editar conocimientos
 * Componente reutilizable para formularios de knowledge base
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useKnowledgeForm } from '../../../hooks/useKnowledgeForm';
import { CustomDropdown } from '../../Common';

/**
 * Componente de modal para crear/editar conocimientos
 */
const KnowledgeModal = ({
  show,
  onClose,
  onSubmit,
  editingItem,
  categories,
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
  } = useKnowledgeForm(editingItem || {});

  // Manejar envío del formulario
  const handleFormSubmit = async (e) => {
    e.preventDefault(); // Prevenir comportamiento por defecto del formulario
    
    const result = await handleSubmit(onSubmit);
    
    if (result.success) {
      onClose();
    }
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
                {editingItem ? 'Editar Conocimiento' : 'Crear Nuevo Conocimiento'}
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                {editingItem ? 'Modifica la información del conocimiento' : 'Completa los campos para crear el conocimiento'}
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
            {/* Pregunta */}
            <div className="space-y-2">
              <label htmlFor="question" className="block text-[13px] font-semibold text-gray-700">
                Pregunta <span className="text-red-500">*</span>
              </label>
              <input
                {...getInputProps('question')}
                type="text"
                id="question"
                required
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200 placeholder:text-gray-400"
                placeholder="Ingrese la pregunta..."
              />
              {errors.question && (
                <p className="text-[13px] text-red-600">{errors.question}</p>
              )}
            </div>
            
            {/* Respuesta */}
            <div className="space-y-2">
              <label htmlFor="answer" className="block text-[13px] font-semibold text-gray-700">
                Respuesta <span className="text-red-500">*</span>
              </label>
              <textarea
                {...getInputProps('answer')}
                id="answer"
                required
                rows={4}
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200 resize-none placeholder:text-gray-400"
                placeholder="Ingrese la respuesta..."
              />
              {errors.answer && (
                <p className="text-[13px] text-red-600">{errors.answer}</p>
              )}
            </div>
            
            {/* Grid para campos pequeños */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Categoría */}
              <div className="space-y-2">
                <label htmlFor="category" className="block text-[13px] font-semibold text-gray-700">
                  Categoría
                </label>
                <CustomDropdown
                  value={formData.category ? String(formData.category) : ''}
                  onChange={(value) => handleChange({ target: { name: 'category', value } })}
                  options={[
                    { value: '', label: 'Seleccionar categoría...' },
                    ...categories.map(category => ({ value: String(category.id), label: category.name }))
                  ]}
                  placeholder="Seleccionar categoría..."
                />
              </div>
              
              {/* Palabras Clave */}
              <div className="space-y-2">
                <label htmlFor="keywords" className="block text-[13px] font-semibold text-gray-700">
                  Palabras Clave
                </label>
                <input
                  {...getInputProps('keywords')}
                  type="text"
                  id="keywords"
                  className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200 placeholder:text-gray-400"
                  placeholder="Palabras clave separadas por comas..."
                />
                {errors.keywords && (
                  <p className="text-[13px] text-red-600">{errors.keywords}</p>
                )}
              </div>
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
                Activar conocimiento (estará disponible para el chatbot)
              </label>
            </div>
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
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleFormSubmit}
              disabled={loading || !isValid}
              className="px-5 py-2.5 text-[13px] font-medium text-white bg-[#2D728F] hover:bg-[#235A6F] border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              {loading ? 'Guardando...' : (editingItem ? 'Actualizar' : 'Crear')} Conocimiento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

KnowledgeModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  editingItem: PropTypes.object,
  categories: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default React.memo(KnowledgeModal);