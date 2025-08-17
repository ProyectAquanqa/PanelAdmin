import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAreas } from "../../hooks/useAreas";
import { searchInFields } from "../../utils/searchUtils";
import {
  AreaActions,
  AreaList,
  LoadingStates,
  AreaDetailModal,
} from "../../components/Areas";
import AreaModal from "../../components/Areas/AreaModal";
import toast from "react-hot-toast";

/**
 * Página principal de Áreas - Refactorizada siguiendo el patrón de Cargos
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

  // Estados locales para filtros (mismo patrón que Cargos)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState(null);

  // Filtrar áreas basado en los criterios de búsqueda (mismo patrón que Cargos)
  const filteredAreas = useMemo(() => {
    let filtered = [...areas];

    // Filtro de búsqueda por texto
    if (searchTerm) {
      filtered = filtered.filter(item => searchInFields(item, searchTerm, ['nombre', 'descripcion']));
    }

    // Filtro por estado
    if (selectedStatus) {
      switch (selectedStatus) {
        case "true":
          filtered = filtered.filter(item => item.is_active === true);
          break;
        case "false":
          filtered = filtered.filter(item => item.is_active === false);
          break;
      }
    }

    // Filtro por fecha
    if (selectedDateRange?.start || selectedDateRange?.end) {
      filtered = filtered.filter(area => {
        const areaDate = new Date(area.created_at);
        const startDate = selectedDateRange.start ? new Date(selectedDateRange.start) : null;
        const endDate = selectedDateRange.end ? new Date(selectedDateRange.end) : null;
        
        if (startDate && endDate) {
          return areaDate >= startDate && areaDate <= endDate;
        } else if (startDate) {
          return areaDate >= startDate;
        } else if (endDate) {
          return areaDate <= endDate;
        }
        return true;
      });
    }

    return filtered;
  }, [areas, searchTerm, selectedStatus, selectedDateRange]);

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

      // Verificar si tiene cargos
      const hasRelations = (area.total_cargos && area.total_cargos > 0);

      if (hasRelations) {
        toast.error(`El área "${area.nombre}" tiene ${area.total_cargos || 0} cargo(s) asignados. Debe eliminar o reasignar primero los cargos relacionados.`);
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

  // Función para limpiar filtros
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedDateRange(null);
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
          onSearchChange={setSearchTerm}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedDateRange={selectedDateRange}
          onDateRangeChange={setSelectedDateRange}
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
