import React, { useState, useEffect, useCallback } from "react";
import { useEventos } from "../../hooks/useEventos";
import { useCategorias } from "../../hooks/useCategorias";
import { useSearch } from "../../hooks/useSearch";
import {
  EventoList,
  LoadingStates,
} from "../../components/Eventos";
import EventoModal from "../../components/Eventos/EventoModal";
import EventoFilters from "../../components/Eventos/EventoFilters";
import { ConfirmModal } from "../../components/Common/Modal";
import toast from "react-hot-toast";

/**
 * Página principal de Gestión de Eventos - Basada en KnowledgeBase
 * Refactorizada para seguir el mismo patrón de diseño y estructura
 */
const EventosGestion = () => {
  const {
    eventos,
    loading,
    loadEventos,
    crearEvento,
    actualizarEvento,
    eliminarEvento,
    alternarPublicacion,
  } = useEventos();

  const { categorias, loadCategorias } = useCategorias();

  // Estados locales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalErrors, setModalErrors] = useState({});

  // Estados del modal de confirmación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  // Usar hook de búsqueda y filtros
  const {
    filteredData: filteredEventos,
    searchTerm,
    selectedCategory,
    updateSearchTerm,
    updateCategory,
    filters: searchFilters,
    updateFilter,
  } = useSearch(eventos, {
    searchFields: ["titulo", "descripcion"],
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadEventos();
    loadCategorias();
  }, [loadEventos, loadCategorias]);

  // Handlers de acciones
  const handleCreateNew = useCallback(() => {
    setEditingItem(null);
    setModalErrors({});
    setShowCreateModal(true);
  }, []);

  const handleEdit = useCallback((item) => {
    setEditingItem(item);
    setModalErrors({});
    setShowCreateModal(true);
  }, []);

  const handleDelete = useCallback((item) => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirmar eliminación',
      message: `¿Está seguro de que desea eliminar el evento "${item.titulo}"? Esta acción no se puede deshacer.`,
      onConfirm: () => confirmDelete(item.id),
    });
  }, []);

  const confirmDelete = async (eventoId) => {
    try {
      await eliminarEvento(eventoId);
      setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
    } catch (error) {
      console.error('Error al eliminar evento:', error);
    }
  };





  // Manejar envío del formulario
  const handleSubmit = useCallback(
    async (formData) => {
      setModalLoading(true);
      setModalErrors({});

      try {
        if (editingItem) {
          await actualizarEvento(editingItem.id, formData);
        } else {
          await crearEvento(formData);
        }
        
        handleCloseModal();
        return true;
      } catch (error) {
        console.error('Error al guardar evento:', error);
        
        if (error.status === 422 && error.data?.error?.details) {
          // Errores de validación
          setModalErrors(error.data.error.details);
        } else {
          setModalErrors({ 
            general: error.message || 'Error al guardar el evento' 
          });
        }
        return false;
      } finally {
        setModalLoading(false);
      }
    },
    [editingItem, actualizarEvento, crearEvento]
  );

  const handleCloseModal = useCallback(() => {
    setShowCreateModal(false);
    setEditingItem(null);
    setModalErrors({});
    setModalLoading(false);
  }, []);

  // Manejadores de filtros
  const handleStatusChange = useCallback((value) => {
    updateFilter('publicado', value);
  }, [updateFilter]);



  // Estado de carga general
  if (loading && !eventos?.length) {
    return (
      <div className="w-full bg-slate-50">
        <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <LoadingStates.TableSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50">
      <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <EventoFilters
          searchTerm={searchTerm}
          onSearchChange={updateSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={updateCategory}
          selectedStatus={searchFilters.publicado || ''}
          onStatusChange={handleStatusChange}
  

          categories={categorias}
          totalItems={filteredEventos.length}
          onCreateNew={handleCreateNew}
        />

        <EventoList
          eventos={filteredEventos}
          loading={loading}
          error={null}
          totalItems={filteredEventos.length}
          onEdit={handleEdit}
          onDelete={handleDelete}

          onCreateFirst={handleCreateNew}
          onRetry={() => loadEventos()}
        />
      </div>

      {/* Modal de Crear/Editar usando componente separado */}
      <EventoModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        evento={editingItem}
        loading={modalLoading}
        errors={modalErrors}
      />

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Eliminar"
        confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      />
    </div>
  );
};

export default EventosGestion;