/**
 * Página de gestión de áreas del sistema
 * Siguiendo el patrón modular de Users para consistencia
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAreas } from '../../hooks/useAreas';
import { useDataView } from '../../hooks/useDataView';
import { searchInFields } from '../../utils/searchUtils';
import toast from 'react-hot-toast';

// Componentes modulares
import {
  AreaFilters,
  AreaTableView,
  AreaModal,
  LoadingStates
} from '../../components/Areas';

import { ConfirmModal } from '../../components/Common/Modal';
import Pagination from '../../components/Common/DataView/Pagination';

/**
 * Página principal de areas
 */
const Areas = () => {
  const {
    areas,
    cargos,
    loading,
    fetchAreas,
    createArea,
    updateArea,
    deleteArea,
    toggleAreaActiveStatus,
    validateAreaName,
    getAreaCargos,
    getAreaUsuarios
  } = useAreas();

  // Estados del modal y filtros
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [editingArea, setEditingArea] = useState(null);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  
  // Estados de UI
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Estados de modales de confirmación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'warning' // 'warning', 'danger'
  });

  // Cargar areas al montar
  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  // Usar solo datos reales del backend
  const displayAreas = areas || [];

  // Filtrado y procesamiento de areas
  const processedAreas = useMemo(() => {
    let filtered = [...(displayAreas || [])];

    // Filtrar por búsqueda (usando searchUtils para manejar acentos)
    if (searchTerm.trim()) {
      filtered = filtered.filter(area => 
        searchInFields(area, searchTerm, [
          'nombre',
          'descripcion'
        ])
      );
    }

    // Filtrar por estado
    if (selectedStatus && selectedStatus.trim()) {
      const isActive = selectedStatus === 'true';
      filtered = filtered.filter(area => area.is_active === isActive);
    }

    // Filtrar por rango de fechas
    if (selectedDateRange && (selectedDateRange.start || selectedDateRange.end)) {
      filtered = filtered.filter(area => {
        if (!area.created_at) return false;
        
        const areaDate = new Date(area.created_at);
        let isInRange = true;
        
        if (selectedDateRange.start) {
          const startDate = new Date(selectedDateRange.start);
          isInRange = isInRange && areaDate >= startDate;
        }
        
        if (selectedDateRange.end) {
          const endDate = new Date(selectedDateRange.end);
          endDate.setHours(23, 59, 59, 999); // Incluir todo el día
          isInRange = isInRange && areaDate <= endDate;
        }
        
        return isInRange;
      });
    }

    return filtered;
  }, [displayAreas, searchTerm, selectedStatus, selectedDateRange]);

  // Hook para manejo de tabla con DataView
  const {
    sortedData,
    paginatedData,
    pagination,
    sortField,
    sortDirection,
    pageNumbers,
    displayRange,
    navigation,
    handleSort,
    handlePageChange
  } = useDataView(processedAreas, {
    itemsPerPage: 10,
    sortField: 'created_at',
    sortDirection: 'desc'
  });

  // Funciones de manejo de modal
  const handleCreateNew = useCallback(() => {
    setEditingArea(null);
    setModalMode('create');
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((area) => {
    setEditingArea(area);
    setModalMode('edit');
    setShowModal(true);
  }, []);

  const handleView = useCallback((area) => {
    setEditingArea(area);
    setModalMode('view');
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingArea(null);
    setModalMode('create');
  }, []);

  // Funciones CRUD
  const handleSubmit = useCallback(async (areaData) => {
    try {
      let result;
      
      if (modalMode === 'create') {
        result = await createArea(areaData);
      } else if (modalMode === 'edit') {
        result = await updateArea(editingArea.id, areaData);
      }
      
      if (result) {
        handleCloseModal();
        // Los datos se recargan automáticamente en el hook
      }
      
      return result;
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      return false;
    }
  }, [modalMode, editingArea, createArea, updateArea, handleCloseModal]);

  const handleToggleStatus = useCallback(async (areaId) => {
    try {
      await toggleAreaActiveStatus(areaId);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  }, [toggleAreaActiveStatus]);

  const handleDelete = useCallback(async (areaId) => {
    const area = areas.find(a => a.id === areaId);
    if (!area) return;

    // Verificar si tiene cargos o usuarios
    const hasRelations = (area.total_cargos && area.total_cargos > 0) || 
                         (area.total_usuarios && area.total_usuarios > 0);

    if (hasRelations) {
      setConfirmModal({
        isOpen: true,
        title: 'No se puede eliminar',
        message: `El área "${area.nombre}" tiene ${area.total_cargos || 0} cargo(s) y ${area.total_usuarios || 0} usuario(s) asignados. Debe eliminar o reasignar primero los cargos y usuarios antes de eliminar el área.`,
        onConfirm: () => {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        },
        confirmText: 'Entendido',
        type: 'warning',
        showCancel: false
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar el área "${area.nombre}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          await deleteArea(areaId);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Error al eliminar área:', error);
        }
      },
      confirmText: 'Eliminar',
      type: 'danger'
    });
  }, [areas, deleteArea]);

  // Funciones de visualización relacionada
  const handleViewCargos = useCallback(async (area) => {
    try {
      const cargosData = await getAreaCargos(area.id);
      
      // Mostrar modal o navegar a vista de cargos
      toast.success(`Área "${area.nombre}" tiene ${cargosData.length} cargo(s)`);
      
      // TODO: Implementar vista detallada de cargos
      console.log('Cargos del área:', cargosData);
    } catch (error) {
      console.error('Error al ver cargos:', error);
      toast.error('Error al cargar cargos del área');
    }
  }, [getAreaCargos]);

  const handleViewUsuarios = useCallback(async (area) => {
    try {
      const usuariosData = await getAreaUsuarios(area.id);
      
      // Mostrar modal o navegar a vista de usuarios
      toast.success(`Área "${area.nombre}" tiene ${usuariosData.total_usuarios} usuario(s)`);
      
      // TODO: Implementar vista detallada de usuarios
      console.log('Usuarios del área:', usuariosData);
    } catch (error) {
      console.error('Error al ver usuarios:', error);
      toast.error('Error al cargar usuarios del área');
    }
  }, [getAreaUsuarios]);

  // Función para exportar (placeholder)
  const handleExport = useCallback(async () => {
    try {
      toast.success('Función de exportación disponible próximamente');
      
      // TODO: Implementar exportación de areas
      console.log('Exportar areas con filtros:', {
        search: searchTerm,
        status: selectedStatus,
        dateRange: selectedDateRange
      });
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar areas');
    }
  }, [searchTerm, selectedStatus, selectedDateRange]);

  // Función para limpiar filtros
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedDateRange(null);
  }, []);

  // Función para validar nombre de area
  const handleValidateName = useCallback(async (nombre, excludeId) => {
    try {
      return await validateAreaName(nombre, excludeId);
    } catch (error) {
      console.error('Error validando nombre:', error);
      return { exists: false };
    }
  }, [validateAreaName]);

  // Estado de carga
  if (loading.areas && !displayAreas.length) {
    return <LoadingStates.AreasLoading />;
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Áreas</h1>
              <p className="mt-1 text-sm text-gray-600">
                Administra las áreas organizacionales de la empresa
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Total: {displayAreas.length} áreas</span>
                {processedAreas.length !== displayAreas.length && (
                  <span>• Filtradas: {processedAreas.length}</span>
                )}
              </div>
            </div>
          </div>

          {/* Filtros */}
          <AreaFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedDateRange={selectedDateRange}
            onDateRangeChange={setSelectedDateRange}
            onCreateNew={handleCreateNew}
            onExport={handleExport}
            totalItems={processedAreas.length}
            onClearFilters={handleClearFilters}
          />

          {/* Tabla */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <AreaTableView
              data={paginatedData}
              sortField={sortField}
              sortDirection={sortDirection}
              expandedRows={expandedRows}
              onSort={handleSort}
              onToggleExpansion={(id) => {
                const newExpanded = new Set(expandedRows);
                if (newExpanded.has(id)) {
                  newExpanded.delete(id);
                } else {
                  newExpanded.add(id);
                }
                setExpandedRows(newExpanded);
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onView={handleView}
            />
            
            {/* Paginación */}
            <Pagination
              pagination={pagination}
              pageNumbers={pageNumbers}
              displayRange={displayRange}
              navigation={navigation}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      {/* Modal de area */}
      {showModal && (
        <AreaModal
          show={showModal}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          editingArea={editingArea}
          loading={loading.create || loading.update}
          mode={modalMode}
          onValidateName={handleValidateName}
        />
      )}

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
        showCancel={confirmModal.showCancel !== false}
      />

      {/* Modal de carga */}
      {(loading.create || loading.update || loading.delete) && (
        <LoadingStates.ActionLoading 
          message={
            loading.create ? 'Creando área...' :
            loading.update ? 'Actualizando área...' :
            loading.delete ? 'Eliminando área...' :
            'Procesando...'
          }
        />
      )}
    </div>
  );
};

export default Areas;
