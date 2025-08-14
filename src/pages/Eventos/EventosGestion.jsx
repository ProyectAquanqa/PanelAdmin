import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useEventos } from "../../hooks/useEventos";
import { useCategorias } from "../../hooks/useCategorias";
import { searchInFields } from "../../utils/searchUtils";
import {
  EventoList,
  EventoDetailModal,
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
    fijarEvento,
    desfijarEvento,
  } = useEventos();

  const { categorias, loadCategorias } = useCategorias();

  // Estados locales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalErrors, setModalErrors] = useState({});
  
  // Estados para modal de detalles
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingEvento, setViewingEvento] = useState(null);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState({ start: '', end: '' });

  // Estados del modal de confirmación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  // Filtrado y procesamiento de eventos
  const filteredEventos = useMemo(() => {
    let filtered = [...(eventos || [])];

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(evento => 
        searchInFields(evento, searchTerm, [
          'titulo',
          'descripcion',
          'categoria.nombre',
          'autor.full_name'
        ])
      );
    }

    // Filtrar por categoría
    if (selectedCategory.trim()) {
      filtered = filtered.filter(evento => 
        evento.categoria?.id?.toString() === selectedCategory
      );
    }

    // Filtrar por estado de publicación
    if (selectedStatus === 'publicado') {
      filtered = filtered.filter(evento => evento.publicado === true);
    } else if (selectedStatus === 'borrador') {
      filtered = filtered.filter(evento => evento.publicado === false);
    }



    // Filtrar por rango de fecha del evento
    if (selectedDateRange.start || selectedDateRange.end) {
      filtered = filtered.filter(evento => {
        if (!evento.fecha) return false;
        
        const eventoDate = new Date(evento.fecha);
        let isInRange = true;

        if (selectedDateRange.start) {
          const startDate = new Date(selectedDateRange.start);
          isInRange = isInRange && eventoDate >= startDate;
        }

        if (selectedDateRange.end) {
          const endDate = new Date(selectedDateRange.end);
          endDate.setHours(23, 59, 59, 999); // Final del día
          isInRange = isInRange && eventoDate <= endDate;
        }

        return isInRange;
      });
    }

    // Ordenar por fecha del evento (más recientes primero)
    filtered.sort((a, b) => {
      return new Date(b.fecha || b.created_at) - new Date(a.fecha || a.created_at);
    });

    return filtered;
  }, [eventos, searchTerm, selectedCategory, selectedStatus, selectedDateRange]);

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

  const handleViewDetails = useCallback((evento) => {
    setViewingEvento(evento);
    setShowDetailModal(true);
  }, []);

  // Manejar pin/unpin de eventos
  const handlePin = useCallback(async (evento) => {
    await fijarEvento(evento.id);
  }, [fijarEvento]);

  const handleUnpin = useCallback(async (evento) => {
    await desfijarEvento(evento.id);
  }, [desfijarEvento]);

  const handleCloseDetailModal = useCallback(() => {
    setShowDetailModal(false);
    setViewingEvento(null);
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
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleCategoryChange = useCallback((value) => {
    setSelectedCategory(value);
  }, []);

  const handleStatusChange = useCallback((value) => {
    setSelectedStatus(value);
  }, []);



  const handleDateRangeChange = useCallback((dateRange) => {
    setSelectedDateRange(dateRange);
  }, []);



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
          onSearchChange={handleSearchChange}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          selectedDateRange={selectedDateRange}
          onDateRangeChange={handleDateRangeChange}
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
          onViewDetails={handleViewDetails}
          onPin={handlePin}
          onUnpin={handleUnpin}
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

      {/* Modal de Ver Detalles */}
      <EventoDetailModal
        show={showDetailModal}
        onClose={handleCloseDetailModal}
        evento={viewingEvento}
        loading={loading}
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