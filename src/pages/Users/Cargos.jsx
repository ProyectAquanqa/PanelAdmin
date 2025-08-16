import React, { useState, useEffect, useCallback } from "react";
import { useCargos } from "../../hooks/useCargos";
import {
  CargoActions,
  CargoList,
  LoadingStates,
  CargoDetailModal,
} from "../../components/Cargos";
import CargoModal from "../../components/Cargos/CargoModal";
import toast from "react-hot-toast";

/**
 * Página principal de Cargos - Siguiendo el patrón de Areas
 */
const Cargos = () => {
  const {
    cargos,
    areas,
    loading,
    fetchCargos,
    fetchAreas,
    createCargo,
    updateCargo,
    deleteCargo,
    validateCargoName,
  } = useCargos();

  // Estados locales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create', 'edit', 'view'

  // Estados locales para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState(null);

  // Filtrar cargos basado en los criterios de búsqueda
  const filteredCargos = React.useMemo(() => {
    let filtered = [...cargos];

    // Filtro de búsqueda por texto
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(cargo => 
        cargo.nombre.toLowerCase().includes(searchLower) ||
        (cargo.descripcion && cargo.descripcion.toLowerCase().includes(searchLower)) ||
        (cargo.area_detail?.nombre && cargo.area_detail.nombre.toLowerCase().includes(searchLower))
      );
    }

    // Filtro por estado
    if (selectedStatus) {
      switch (selectedStatus) {
        case "active_area":
          filtered = filtered.filter(item => item.area_detail?.is_active === true);
          break;
        case "inactive_area":
          filtered = filtered.filter(item => item.area_detail?.is_active === false);
          break;
        case "with_users":
          filtered = filtered.filter(item => (item.total_usuarios || 0) > 0);
          break;
        case "without_users":
          filtered = filtered.filter(item => (item.total_usuarios || 0) === 0);
          break;
      }
    }

    // Filtro por fecha
    if (selectedDateRange?.start || selectedDateRange?.end) {
      filtered = filtered.filter(cargo => {
        const cargoDate = new Date(cargo.created_at);
        const startDate = selectedDateRange.start ? new Date(selectedDateRange.start) : null;
        const endDate = selectedDateRange.end ? new Date(selectedDateRange.end) : null;
        
        if (startDate && endDate) {
          return cargoDate >= startDate && cargoDate <= endDate;
        } else if (startDate) {
          return cargoDate >= startDate;
        } else if (endDate) {
          return cargoDate <= endDate;
        }
        return true;
      });
    }

    return filtered;
  }, [cargos, searchTerm, selectedStatus, selectedDateRange]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchCargos(),
        fetchAreas()
      ]);
    };
    loadData();
  }, [fetchCargos, fetchAreas]);

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
      const cargo = cargos.find(c => c.id === id);
      if (!cargo) return;

      // Verificar si tiene usuarios asignados
      const hasUsers = cargo.total_usuarios && cargo.total_usuarios > 0;

      if (hasUsers) {
        toast.error(`El cargo "${cargo.nombre}" tiene ${cargo.total_usuarios} usuario(s) asignados. Debe reasignar o eliminar primero los usuarios relacionados.`);
        return;
      }

      if (
        window.confirm(
          `¿Está seguro de que desea eliminar el cargo "${cargo.nombre}"? Esta acción no se puede deshacer.`
        )
      ) {
        await deleteCargo(id);
      }
    },
    [deleteCargo, cargos]
  );

  const handleExport = useCallback(async () => {
    toast.success('Función de exportación próximamente disponible');
  }, []);

  // Manejar envío del formulario
  const handleSubmit = useCallback(
    async (formData) => {
      // Validación adicional: verificar duplicados antes de enviar (solo al crear)
      if (!editingItem) {
        const nameExists = cargos.some(
          item => item.nombre.toLowerCase().trim() === formData.nombre.toLowerCase().trim() &&
                  item.area === formData.area
        );
        
        if (nameExists) {
          toast.error('Ya existe un cargo con este nombre en esta área');
          return false;
        }
      }

      if (editingItem) {
        return await updateCargo(editingItem.id, formData);
      } else {
        return await createCargo(formData);
      }
    },
    [editingItem, updateCargo, createCargo, cargos]
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
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedDateRange(null);
  }, []);

  // Estado de carga general
  if (loading.cargos && !cargos?.length) {
    return (
      <div className="w-full bg-slate-50">
        <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <LoadingStates.CargoListLoading />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50">
      <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CargoActions
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedDateRange={selectedDateRange}
          onDateRangeChange={setSelectedDateRange}
          totalItems={filteredCargos.length}
          onCreateNew={handleCreateNew}
          onExport={handleExport}
          onClearFilters={handleClearFilters}
        />

        <CargoList
          cargos={filteredCargos}
          loading={loading.cargos}
          error={loading.error}
          totalItems={filteredCargos.length}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onCreateFirst={handleCreateNew}
          onRetry={() => fetchCargos()}
        />
      </div>

      {/* Modal de Crear/Editar usando componente separado */}
      <CargoModal
        show={showCreateModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingCargo={editingItem}
        areas={areas}
        loading={loading.cargos}
        mode={formMode}
        onValidateName={validateCargoName}
      />

      {/* Modal de Ver Detalles */}
      <CargoDetailModal
        show={showDetailModal}
        onClose={handleCloseDetailModal}
        cargo={viewingItem}
        loading={loading.cargos}
      />
    </div>
  );
};

export default Cargos;

