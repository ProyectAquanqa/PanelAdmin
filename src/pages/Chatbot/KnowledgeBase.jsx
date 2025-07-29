import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useChatbot } from '../../hooks/useChatbot';
import { KnowledgeActions, KnowledgeList, LoadingStates } from '../../components/Chatbot/KnowledgeBase';
import { CustomDropdown } from '../../components/Common';

/**
 * Página principal de Base de Conocimientos - Completamente modular
 */
const KnowledgeBase = () => {
  const {
    knowledgeBase,
    categories,
    loading,
    pagination,
    fetchKnowledgeBase,
    createKnowledge,
    updateKnowledge,
    deleteKnowledge,
    bulkImportKnowledge,
    regenerateEmbeddings,
    fetchCategories
  } = useChatbot();

  // Estados locales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedEmbedding, setSelectedEmbedding] = useState('');
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    keywords: '',
    is_active: true
  });

  // Cargar datos iniciales
  useEffect(() => {
    fetchKnowledgeBase();
    fetchCategories();
  }, [fetchKnowledgeBase, fetchCategories]);

  // Función para normalizar texto (quitar acentos y caracteres especiales)
  const normalizeText = useCallback((text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quita acentos
      .replace(/[^\w\s]/g, ' ') // Reemplaza caracteres especiales con espacios
      .replace(/\s+/g, ' ') // Normaliza espacios múltiples
      .trim();
  }, []);

  // Filtrar conocimientos basado en búsqueda, categoría y embedding
  const filteredKnowledgeBase = useMemo(() => {
    if (!knowledgeBase) return [];
    
    return knowledgeBase.filter(item => {
      // Filtro por término de búsqueda - MEJORADO
      let searchMatch = true;
      if (searchTerm) {
        const normalizedSearch = normalizeText(searchTerm);
        const normalizedQuestion = normalizeText(item.question);
        const normalizedAnswer = normalizeText(item.answer);
        const normalizedKeywords = normalizeText(item.keywords);
        
        // Buscar cada palabra del término de búsqueda
        const searchWords = normalizedSearch.split(' ').filter(word => word.length > 0);
        searchMatch = searchWords.every(word => 
          normalizedQuestion.includes(word) ||
          normalizedAnswer.includes(word) ||
          normalizedKeywords.includes(word)
        );
      }
      
      // Filtro por categoría
      const categoryMatch = !selectedCategory || 
        (item.category && item.category.id.toString() === selectedCategory);
      
      // Filtro por embedding
      const embeddingMatch = !selectedEmbedding || 
        (selectedEmbedding === 'with' && item.question_embedding && item.question_embedding.length > 0) ||
        (selectedEmbedding === 'without' && (!item.question_embedding || item.question_embedding.length === 0));
      
      return searchMatch && categoryMatch && embeddingMatch;
    });
  }, [knowledgeBase, searchTerm, selectedCategory, selectedEmbedding, normalizeText]);

  // Handlers de acciones
  const handleCreateNew = useCallback(() => {
    setEditingItem(null);
    setFormData({
      question: '',
      answer: '',
      category: '',
      keywords: '',
      is_active: true
    });
    setShowCreateModal(true);
  }, []);

  const handleEdit = useCallback((item) => {
    setEditingItem(item);
    setFormData({
      question: item.question || '',
      answer: item.answer || '',
      category: item.category?.id || '',
      keywords: item.keywords || '',
      is_active: item.is_active !== false
    });
    setShowCreateModal(true);
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este conocimiento? Esta acción no se puede deshacer.')) {
      await deleteKnowledge(id);
    }
  }, [deleteKnowledge]);

  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (file) {
      await bulkImportKnowledge(file);
      e.target.value = '';
    }
  }, [bulkImportKnowledge]);

  const handleRegenerateEmbeddings = useCallback(async () => {
    if (window.confirm('¿Está seguro de que desea regenerar todos los embeddings? Esto puede tomar varios minutos.')) {
      await regenerateEmbeddings();
    }
  }, [regenerateEmbeddings]);

  // Manejar envío del formulario
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      const dataToSubmit = {
        ...formData,
        // Convertir categoría a número entero o null
        category: formData.category ? parseInt(formData.category, 10) : null
      };

      if (editingItem) {
        await updateKnowledge(editingItem.id, dataToSubmit);
      } else {
        await createKnowledge(dataToSubmit);
      }
      
      setShowCreateModal(false);
      setEditingItem(null);
      setFormData({
        question: '',
        answer: '',
        category: '',
        keywords: '',
        is_active: true
      });
    } catch (error) {
      console.error('Error al guardar conocimiento:', error);
    }
  }, [formData, editingItem, updateKnowledge, createKnowledge]);

  // Manejar cambios en inputs - Estable para evitar pérdida de foco
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // Manejar cierre del modal
  const handleCloseModal = useCallback(() => {
    setShowCreateModal(false);
    setEditingItem(null);
    setFormData({
      question: '',
      answer: '',
      category: '',
      keywords: '',
      is_active: true
    });
  }, []);

  // Estado de carga general
  if (loading.knowledge && !knowledgeBase?.length) {
    return (
      <div className="w-full bg-slate-50">
        <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <LoadingStates.KnowledgeListLoading />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50">
      <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <KnowledgeActions
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedEmbedding={selectedEmbedding}
          onEmbeddingChange={setSelectedEmbedding}
          categories={categories}
          onCreateNew={handleCreateNew}
          onBulkImport={handleFileUpload}
          onRegenerateEmbeddings={handleRegenerateEmbeddings}
          totalItems={filteredKnowledgeBase.length}
        />

        <KnowledgeList
          knowledgeBase={filteredKnowledgeBase}
          loading={loading.knowledge}
          error={loading.error}
          totalItems={filteredKnowledgeBase.length}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreateFirst={handleCreateNew}
          onRetry={() => fetchKnowledgeBase()}
        />
      </div>

      {/* Modal de Crear/Editar - Mejorado para evitar pérdida de foco */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-200 scale-100">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingItem ? 'Editar Conocimiento' : 'Crear Nuevo Conocimiento'}
            </h3>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-lg p-1 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
      </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-2">
                <label htmlFor="question" className="block text-[13px] font-semibold text-gray-700">
                  Pregunta <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
                  id="question"
                  name="question"
              value={formData.question}
                  onChange={handleInputChange}
              required
                  className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200 placeholder:text-gray-400"
                  placeholder="Ingrese la pregunta..."
            />
          </div>
          
              <div className="space-y-2">
                <label htmlFor="answer" className="block text-[13px] font-semibold text-gray-700">
                  Respuesta <span className="text-red-500">*</span>
            </label>
            <textarea
                  id="answer"
                  name="answer"
              value={formData.answer}
                  onChange={handleInputChange}
              required
                  rows={4}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200 resize-vertical placeholder:text-gray-400"
                  placeholder="Ingrese la respuesta..."
            />
          </div>
          
              <div className="space-y-2">
                <label htmlFor="category" className="block text-[13px] font-semibold text-gray-700">
                Categoría
              </label>
                <CustomDropdown
                value={formData.category}
                  onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  options={[
                    { value: '', label: 'Seleccionar categoría...' },
                    ...categories.map(category => ({ value: category.id, label: category.name }))
                  ]}
                  placeholder="Seleccionar categoría..."
              />
            </div>
            
              <div className="space-y-2">
                <label htmlFor="keywords" className="block text-[13px] font-semibold text-gray-700">
                Palabras Clave
              </label>
              <input
                type="text"
                  id="keywords"
                  name="keywords"
                value={formData.keywords}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F] transition-all duration-200 placeholder:text-gray-400"
                  placeholder="Palabras clave separadas por comas..."
              />
          </div>
          
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="is_active"
                  name="is_active"
              checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#2D728F] focus:ring-[#2D728F] border-gray-300 rounded transition-all"
            />
                <label htmlFor="is_active" className="text-[13px] font-medium text-gray-700">
                  Activar conocimiento
            </label>
          </div>
          
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100">
            <button
              type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 text-[13px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
            >
              Cancelar
            </button>
                <button
                  type="submit"
                  disabled={loading.knowledge}
                  className="px-6 py-2.5 text-[13px] font-medium text-white bg-[#2D728F] hover:bg-[#235A6F] border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                >
                  {loading.knowledge ? 'Guardando...' : (editingItem ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase; 