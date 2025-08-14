/**
 * Modal para crear/editar conocimientos
 * Componente reutilizable para formularios de knowledge base
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useKnowledgeForm } from '../../../hooks/useKnowledgeForm';
import { CustomDropdown } from '../../Common';
import chatbotService from '../../../services/chatbotService';

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
  // Estado para preguntas disponibles
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
  
  // Cargar preguntas disponibles para recomendaciones
  useEffect(() => {
    if (show) {
      loadAvailableQuestions();
    }
  }, [show]);
  
  const loadAvailableQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const response = await chatbotService.knowledge.list(1, 100); // Cargar más preguntas
      const questions = response.status === 'success' ? response.data.results || response.data : response.results || response;
      
      // Filtrar la pregunta actual para evitar auto-referencia
      const filteredQuestions = questions.filter(q => 
        q.id !== editingItem?.id && q.is_active
      );
      
      setAvailableQuestions(filteredQuestions);
      setFilteredQuestions(filteredQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
      setAvailableQuestions([]);
      setFilteredQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };
  
  // Manejar cambios en preguntas recomendadas
  const handleRecommendedQuestionsChange = (questionId, isSelected) => {
    const currentQuestions = formData.recommended_questions || [];
    const newQuestions = isSelected
      ? [...currentQuestions, parseInt(questionId)]
      : currentQuestions.filter(id => id !== parseInt(questionId));
    
    handleChange({ target: { name: 'recommended_questions', value: newQuestions } });
  };
  
  // Función para normalizar texto removiendo acentos
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remover diacríticos (acentos, tildes, etc.)
  };

  // Función para filtrar preguntas basado en búsqueda
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredQuestions(availableQuestions);
      return;
    }
    
    const searchNormalized = normalizeText(term);
    const filtered = availableQuestions.filter(question => {
      const questionNormalized = normalizeText(question.question || '');
      const categoryNormalized = normalizeText(question.category_name || '');
      const keywordsNormalized = normalizeText(question.keywords || '');
      
      return questionNormalized.includes(searchNormalized) ||
             categoryNormalized.includes(searchNormalized) ||
             keywordsNormalized.includes(searchNormalized);
    });
    
    setFilteredQuestions(filtered);
  };
  
  // Limpiar búsqueda cuando se cierra el modal
  const handleModalClose = () => {
    setSearchTerm('');
    setFilteredQuestions(availableQuestions);
    onClose();
  };

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
            
            {/* Preguntas Recomendadas */}
            <div className="space-y-3">
              <label className="block text-[13px] font-semibold text-gray-700">
                Preguntas Recomendadas
              </label>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <p className="text-[13px] text-gray-600 mb-3">
                  Selecciona preguntas relacionadas que se mostrarán como sugerencias a los usuarios:
                </p>
                
                {/* Campo de búsqueda */}
                <div className="mb-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar preguntas por título, categoría o palabras clave..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full px-3 py-2 pl-9 pr-4 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200 placeholder:text-gray-400"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => handleSearch('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {searchTerm && (
                    <p className="text-[12px] text-gray-500 mt-1">
                      {filteredQuestions.length} de {availableQuestions.length} preguntas encontradas
                    </p>
                  )}
                </div>

                {loadingQuestions ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2D728F]"></div>
                    <span className="ml-2 text-[13px] text-gray-500">Cargando preguntas...</span>
                  </div>
                ) : filteredQuestions.length > 0 ? (
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {filteredQuestions.map((question) => {
                      const isSelected = (formData.recommended_questions || []).includes(question.id);
                      return (
                        <label key={question.id} className="flex items-start space-x-3 p-2 hover:bg-white rounded cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleRecommendedQuestionsChange(question.id, e.target.checked)}
                            className="mt-0.5 h-4 w-4 text-[#2D728F] focus:ring-[#2D728F] border-gray-300 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-gray-900 truncate" title={question.question}>
                              {question.question}
                            </p>
                            {question.category_name && (
                              <p className="text-[12px] text-gray-500 mt-1">
                                Categoría: {question.category_name}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : searchTerm ? (
                  <div className="text-center py-4">
                    <div className="text-gray-400 mb-2">
                      <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-[13px] text-gray-500">
                      No se encontraron preguntas que coincidan con "<span className="font-medium">{searchTerm}</span>"
                    </p>
                    <button
                      type="button"
                      onClick={() => handleSearch('')}
                      className="text-[12px] text-[#2D728F] hover:text-[#235A6F] mt-1 underline"
                    >
                      Limpiar búsqueda
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-[13px] text-gray-500">
                      No hay preguntas disponibles para recomendar
                    </p>
                  </div>
                )}
                
                {(formData.recommended_questions || []).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-[13px] font-medium text-gray-700">
                      {(formData.recommended_questions || []).length} pregunta(s) seleccionada(s)
                    </p>
                  </div>
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
              onClick={handleModalClose}
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