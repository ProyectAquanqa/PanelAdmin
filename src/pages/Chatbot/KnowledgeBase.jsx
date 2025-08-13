import React, { useState, useEffect, useCallback } from "react";
import { useChatbot } from "../../hooks/useChatbot";
import { useSearch } from "../../hooks/useSearch";
import {
  KnowledgeList,
  LoadingStates,
} from "../../components/Chatbot/KnowledgeBase";
import KnowledgeModal from "../../components/Chatbot/KnowledgeBase/KnowledgeModal";
import KnowledgeDetailModal from "../../components/Chatbot/KnowledgeBase/KnowledgeDetailModal";
import KnowledgeFilters from "../../components/Chatbot/KnowledgeBase/KnowledgeFilters";
import toast from "react-hot-toast";

/**
 * Página principal de Base de Conocimientos - Refactorizada
 */
const KnowledgeBase = () => {
  const {
    knowledgeBase,
    categories,
    loading,
    fetchKnowledgeBase,
    createKnowledge,
    updateKnowledge,
    deleteKnowledge,
    bulkImportKnowledge,
    regenerateEmbeddings,
    fetchCategories,
  } = useChatbot();

  // Estados locales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Usar hook de búsqueda
  const {
    filteredData: filteredKnowledgeBase,
    searchTerm,
    selectedCategory,
    selectedEmbedding,
    updateSearchTerm,
    updateCategory,
    updateEmbeddingFilter,
  } = useSearch(knowledgeBase, {
    searchFields: ["question", "answer", "keywords"],
  });

  // Cargar datos iniciales
  useEffect(() => {
    fetchKnowledgeBase();
    fetchCategories();
  }, [fetchKnowledgeBase, fetchCategories]);

  // Handlers de acciones
  const handleCreateNew = useCallback(() => {
    setEditingItem(null);
    setShowCreateModal(true);
  }, []);

  const handleEdit = useCallback((item) => {
    setEditingItem(item);
    setShowCreateModal(true);
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      if (
        window.confirm(
          "¿Está seguro de que desea eliminar este conocimiento? Esta acción no se puede deshacer."
        )
      ) {
        await deleteKnowledge(id);
      }
    },
    [deleteKnowledge]
  );

  const handleFileUpload = useCallback(
    async (e) => {
      const file = e.target.files[0];
      if (file) {
        await bulkImportKnowledge(file);
        e.target.value = "";
      }
    },
    [bulkImportKnowledge]
  );

  const handleRegenerateEmbeddings = useCallback(async () => {
    if (
      window.confirm(
        "¿Está seguro de que desea regenerar todos los embeddings? Esto puede tomar varios minutos."
      )
    ) {
      await regenerateEmbeddings();
    }
  }, [regenerateEmbeddings]);

  // Manejar envío del formulario
  const handleSubmit = useCallback(
    async (formData) => {
      const dataToSubmit = {
        ...formData,
        category: formData.category ? parseInt(formData.category, 10) : null,
      };

      // Validación adicional: verificar duplicados antes de enviar (solo al crear)
      if (!editingItem) {
        const questionExists = knowledgeBase.some(
          item => item.question.toLowerCase().trim() === dataToSubmit.question.toLowerCase().trim()
        );
        
        if (questionExists) {
          toast.error('Esta pregunta ya existe en la base de conocimientos');
          return false;
        }
      }

      if (editingItem) {
        return await updateKnowledge(editingItem.id, dataToSubmit);
      } else {
        return await createKnowledge(dataToSubmit);
      }
    },
    [editingItem, updateKnowledge, createKnowledge, knowledgeBase]
  );

  const handleCloseModal = useCallback(() => {
    setShowCreateModal(false);
    setEditingItem(null);
  }, []);

  const handleViewDetails = useCallback((item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedItem(null);
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
        <KnowledgeFilters
          searchTerm={searchTerm}
          onSearchChange={updateSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={updateCategory}
          selectedEmbedding={selectedEmbedding}
          onEmbeddingChange={updateEmbeddingFilter}
          categories={categories}
          totalItems={filteredKnowledgeBase.length}
          onCreateNew={handleCreateNew}
          onBulkImport={handleFileUpload}
          onRegenerateEmbeddings={handleRegenerateEmbeddings}
        />

        <KnowledgeList
          knowledgeBase={filteredKnowledgeBase}
          loading={loading.knowledge}
          error={loading.error}
          totalItems={filteredKnowledgeBase.length}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
          onCreateFirst={handleCreateNew}
          onRetry={() => fetchKnowledgeBase()}
        />
      </div>

      {/* Modal de Crear/Editar usando componente separado */}
      <KnowledgeModal
        show={showCreateModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingItem={editingItem}
        categories={categories}
        loading={loading.knowledge}
      />

      {/* Modal de Ver Detalles */}
      <KnowledgeDetailModal
        show={showDetailModal}
        onClose={handleCloseDetailModal}
        knowledge={selectedItem}
        loading={loading.knowledge}
      />
    </div>
  );
};

export default KnowledgeBase;
