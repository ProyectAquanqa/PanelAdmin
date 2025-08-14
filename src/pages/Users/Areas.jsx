import React, { useState, useEffect, useCallback } from "react";
import { useAreas } from "../../hooks/useAreas";
import { useSearch } from "../../hooks/useSearch";
import {
  AreaActions,
  AreaList,
  LoadingStates,
  AreaDetailModal,
} from "../../components/Areas";
import AreaModal from "../../components/Areas/AreaModal";
import toast from "react-hot-toast";

/**
 * Página principal de Áreas - Refactorizada siguiendo el patrón de KnowledgeBase
 */
const Areas = () => {
  const {
    areas,
    loading,
    fetchAreas,
    createArea,
    updateArea,
    deleteArea,
    toggleAreaActiveStatus,
    validateAreaName,
  } = useAreas();

  // Estados locales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create', 'edit', 'view'

  // Usar hook de búsqueda
  const {
    filteredData: filteredAreas,
    searchTerm,
    selectedStatus,
    dateRange: selectedDateRange,
    updateSearchTerm,
    updateStatus,
    updateDateRange,
  } = useSearch(areas, {
    searchFields: ["nombre", "descripcion"],
  });

  // Cargar datos iniciales
  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  // Handlers de acciones
  const handleCreateNew = useCallback(() => {
    setEditingItem(null);
    setFormMode('create');
    setShowCreateModal(true);
  }, []);

  const handleEdit = useCallback((item) => {
    setEditingItem(item);
    setFormMode('edit');
    setShowCreateModal(true);
  }, []);

  const handleView = useCallback((item) => {
    setViewingItem(item);
    setShowDetailModal(true);
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      const area = areas.find(a => a.id === id);
      if (!area) return;

      // Verificar si tiene cargos o usuarios
      const hasRelations = (area.total_cargos && area.total_cargos > 0) || 
                           (area.total_usuarios && area.total_usuarios > 0);

      if (hasRelations) {
        toast.error(`El área "${area.nombre}" tiene ${area.total_cargos || 0} cargo(s) y ${area.total_usuarios || 0} usuario(s) asignados. Debe eliminar o reasignar primero los elementos relacionados.`);
        return;
      }

      if (
        window.confirm(
          `¿Está seguro de que desea eliminar el área "${area.nombre}"? Esta acción no se puede deshacer.`
        )
      ) {
        await deleteArea(id);
      }
    },
    [deleteArea, areas]
  );

  const handleToggleStatus = useCallback(async (id) => {
    await toggleAreaActiveStatus(id);
  }, [toggleAreaActiveStatus]);

  const handleExport = useCallback(async () => {
    toast.success('Función de exportación próximamente disponible');
  }, []);

  // Manejar envío del formulario
  const handleSubmit = useCallback(
    async (formData) => {
      // Validación adicional: verificar duplicados antes de enviar (solo al crear)
      if (!editingItem) {
        const nameExists = areas.some(
          item => item.nombre.toLowerCase().trim() === formData.nombre.toLowerCase().trim()
        );
        
        if (nameExists) {
          toast.error('Ya existe un área con este nombre');
          return false;
        }
      }

      if (editingItem) {
        return await updateArea(editingItem.id, formData);
      } else {
        return await createArea(formData);
      }
    },
    [editingItem, updateArea, createArea, areas]
  );

  const handleCloseModal = useCallback(() => {
    setShowCreateModal(false);
    setEditingItem(null);
    setFormMode('create');
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setShowDetailModal(false);
    setViewingItem(null);
  }, []);

  // Función para limpiar filtros
  const handleClearFilters = useCallback(() => {
    updateSearchTerm('');
    updateStatus('');
    updateDateRange(null);
  }, [updateSearchTerm, updateStatus, updateDateRange]);

  // Estado de carga general
  if (loading.areas && !areas?.length) {
    return (
      <div className="w-full bg-slate-50">
        <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <LoadingStates.AreaListLoading />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50">
      <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AreaActions
          searchTerm={searchTerm}
          onSearchChange={updateSearchTerm}
          selectedStatus={selectedStatus}
          onStatusChange={updateStatus}
          selectedDateRange={selectedDateRange}
          onDateRangeChange={updateDateRange}
          totalItems={filteredAreas.length}
          onCreateNew={handleCreateNew}
          onExport={handleExport}
          onClearFilters={handleClearFilters}
        />

        <AreaList
          areas={filteredAreas}
          loading={loading.areas}
          error={loading.error}
          totalItems={filteredAreas.length}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onToggleStatus={handleToggleStatus}
          onCreateFirst={handleCreateNew}
          onRetry={() => fetchAreas()}
        />
      </div>

      {/* Modal de Crear/Editar usando componente separado */}
      <AreaModal
        show={showCreateModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingArea={editingItem}
        loading={loading.areas}
        mode={formMode}
        onValidateName={validateAreaName}
      />

      {/* Modal de Ver Detalles */}
      <AreaDetailModal
        show={showDetailModal}
        onClose={handleCloseDetailModal}
        area={viewingItem}
        loading={loading.areas}
      />
    </div>
  );
};

export default Areas;
