import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAlmuerzos } from "../../hooks/useAlmuerzos";
import { useSearch } from "../../hooks/useSearch";
import {
  AlmuerzoList,
  LoadingStates,
} from "../../components/Almuerzos";
import AlmuerzoModal from "../../components/Almuerzos/AlmuerzoModal";
import AlmuerzoDetailModal from "../../components/Almuerzos/AlmuerzoDetailModal";
import AlmuerzoFilters from "../../components/Almuerzos/AlmuerzoFilters";
import { ConfirmModal } from "../../components/Common/Modal";
import { getDateRangeFromOption } from "../../utils/dateRangeHelpers.js";
import toast from "react-hot-toast";

/**
 * Página principal de Gestión de Almuerzos - Basada en EventosGestion
 * Refactorizada para seguir el mismo patrón de diseño y estructura
 */
const AlmuerzosGestion = () => {
  const {
    almuerzos,
    loading,
    loadAlmuerzos,
    crearAlmuerzo,
    actualizarAlmuerzo,
    eliminarAlmuerzo,
  } = useAlmuerzos();

  // Estados locales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalErrors, setModalErrors] = useState({});
  
  // Estados para modal de detalles
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAlmuerzo, setSelectedAlmuerzo] = useState(null);

  // Estados del modal de confirmación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });



  // Usar hook de búsqueda - COPIADO EXACTAMENTE DEL CHATBOT
  const {
    filteredData: filteredAlmuerzos,
    searchTerm,
    selectedStatus,
    selectedEmbedding: selectedDiet,
    updateSearchTerm,
    updateStatusFilter,
    updateEmbeddingFilter: updateDietFilter,
  } = useSearch(almuerzos, {
    searchFields: ["entrada", "plato_fondo", "refresco", "dieta"],
    customFilters: {
      selectedStatus: (item, value) => {
        if (value === '' || value === null || value === undefined) return true;
        return item.active === (value === 'true');
      },
      selectedEmbedding: (item, value) => {
        if (value === '' || value === null || value === undefined) return true;
        if (value === 'with') return Boolean(item.dieta && item.dieta.trim());
        if (value === 'without') return !Boolean(item.dieta && item.dieta.trim());
        return true;
      }
    }
  });

  // Estado para filtro de fecha predefinido (como en conversaciones)
  const [selectedDateRange, setSelectedDateRange] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    loadAlmuerzos();
  }, [loadAlmuerzos]);

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
      message: `¿Está seguro de que desea eliminar el almuerzo del ${item.nombre_dia} ${new Date(item.fecha).toLocaleDateString('es-ES')}? Esta acción no se puede deshacer.`,
      onConfirm: () => confirmDelete(item.id),
    });
  }, []);

  const confirmDelete = async (almuerzoId) => {
    try {
      await eliminarAlmuerzo(almuerzoId);
      setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
    } catch (error) {
      // Error al eliminar almuerzo
    }
  };

  const handleViewDetails = useCallback((item) => {
    setSelectedAlmuerzo(item);
    setShowDetailModal(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedAlmuerzo(null);
  }, []);

  // Manejar envío del formulario
  const handleSubmit = useCallback(
    async (formData) => {
      setModalLoading(true);
      setModalErrors({});

      try {
        if (editingItem) {
          await actualizarAlmuerzo(editingItem.id, formData);
        } else {
          await crearAlmuerzo(formData);
        }
        
        handleCloseModal();
        return true;
      } catch (error) {
        if (error.status === 422 && error.data?.error?.details) {
          // Errores de validación
          setModalErrors(error.data.error.details);
        } else if (error.status === 400 && error.data?.error?.details) {
          // Errores de validación del backend
          const backendErrors = error.data.error.details;
          const processedErrors = {};
          
          // Procesar errores del backend
          Object.keys(backendErrors).forEach(key => {
            const errorList = backendErrors[key];
            if (Array.isArray(errorList) && errorList.length > 0) {
              processedErrors[key] = errorList[0]; // Tomar el primer error
            }
          });
          
          setModalErrors(processedErrors);
        } else {
          setModalErrors({ 
            general: error.message || 'Error al guardar el almuerzo' 
          });
        }
        return false;
      } finally {
        setModalLoading(false);
      }
    },
    [editingItem, actualizarAlmuerzo, crearAlmuerzo]
  );

  const handleCloseModal = useCallback(() => {
    setShowCreateModal(false);
    setEditingItem(null);
    setModalErrors({});
    setModalLoading(false);
  }, []);

  // Manejadores de filtros - COPIADO EXACTAMENTE DEL CHATBOT
  const handleStatusChange = useCallback((value) => {
    updateStatusFilter(value);
  }, [updateStatusFilter]);

  const handleDateRangeChange = useCallback((value) => {
    setSelectedDateRange(value);
  }, []);

  const handleDietChange = useCallback((value) => {
    updateDietFilter(value);
  }, [updateDietFilter]);

  // Derivados con useMemo (deben declararse antes de cualquier return condicional)
  const almuerzosFiltradosPorFecha = useMemo(() => {
    if (!selectedDateRange) return filteredAlmuerzos;
    
    const dateRange = getDateRangeFromOption(selectedDateRange);
    const from = dateRange.from ? new Date(dateRange.from) : null;
    const to = dateRange.to ? new Date(dateRange.to) : null;
    
    if (!from && !to) return filteredAlmuerzos;
    
    return filteredAlmuerzos.filter(item => {
      const d = new Date(item.fecha);
      if (Number.isNaN(d.getTime())) return true;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [filteredAlmuerzos, selectedDateRange]);

  const totalFiltradosPorFecha = useMemo(() => almuerzosFiltradosPorFecha.length, [almuerzosFiltradosPorFecha]);

  // Estado de carga general
  if (loading && !almuerzos?.length) {
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
        <AlmuerzoFilters
          searchTerm={searchTerm}
          onSearchChange={updateSearchTerm}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          selectedDateRange={selectedDateRange}
          onDateRangeChange={handleDateRangeChange}
          selectedDiet={selectedDiet}
          onDietChange={handleDietChange}
          totalItems={totalFiltradosPorFecha}
          onCreateNew={handleCreateNew}
        />

        <AlmuerzoList
          almuerzos={almuerzosFiltradosPorFecha}
          loading={loading}
          error={null}
          totalItems={totalFiltradosPorFecha}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
          onRetry={() => loadAlmuerzos()}
        />
      </div>

      {/* Modal de Crear/Editar usando componente separado */}
      <AlmuerzoModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        almuerzo={editingItem}
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

      {/* Modal de detalles */}
      <AlmuerzoDetailModal
        show={showDetailModal}
        onClose={handleCloseDetailModal}
        almuerzo={selectedAlmuerzo}
        loading={false}
      />
    </div>
  );
};

export default AlmuerzosGestion;
