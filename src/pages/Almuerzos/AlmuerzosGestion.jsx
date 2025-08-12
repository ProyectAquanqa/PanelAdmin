import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAlmuerzos } from "../../hooks/useAlmuerzos";
import { useSearch } from "../../hooks/useSearch";
import {
  AlmuerzoList,
  LoadingStates,
} from "../../components/Almuerzos";
import AlmuerzoModal from "../../components/Almuerzos/AlmuerzoModal";
import AlmuerzoFilters from "../../components/Almuerzos/AlmuerzoFilters";
import { ConfirmModal } from "../../components/Common/Modal";
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
    alternarEstado,
  } = useAlmuerzos();

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

  // Ref para evitar múltiples llamadas de test
  const hasTestedRef = useRef(false);

  // Usar hook de búsqueda y filtros
  const {
    filteredData: filteredAlmuerzos,
    searchTerm,
    updateSearchTerm,
    filters: searchFilters,
    updateFilter,
  } = useSearch(almuerzos, {
    searchFields: ["entrada", "plato_fondo", "refresco", "dieta"],
    customFilters: {
      selectedStatus: (item, value) => {
        console.log('🔍 Filtro Status - Item:', item, 'Value:', value);
        if (value === '' || value === null || value === undefined) return true;
        return item.active === (value === 'true');
      },
      selectedHoliday: (item, value) => {
        console.log('🔍 Filtro Holiday - Item:', item, 'Value:', value);
        if (value === '' || value === null || value === undefined) return true;
        return item.es_feriado === (value === 'true');
      },
      selectedDiet: (item, value) => {
        console.log('🔍 Filtro Diet - Item:', item, 'Value:', value);
        if (value === '' || value === null || value === undefined) return true;
        if (value === 'with_diet') return Boolean(item.dieta && item.dieta.trim());
        if (value === 'without_diet') return !Boolean(item.dieta && item.dieta.trim());
        return true;
      }
    }
  });

  // Cargar datos iniciales
  useEffect(() => {
    console.log('🚀 AlmuerzosGestion: Cargando datos iniciales');
    loadAlmuerzos();
  }, [loadAlmuerzos]);

  // Debug de datos básico
  useEffect(() => {
    if (almuerzos?.length > 0) {
      console.log('📋 Almuerzos cargados:', almuerzos.length, 'Filtrados:', filteredAlmuerzos.length);
    }
  }, [almuerzos, filteredAlmuerzos]);

  // Test directo de la API - TEMPORAL para debug
  useEffect(() => {
    const testAlmuerzosAPI = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        // Test GET almuerzos
        console.log('🧪 Testing GET /api/web/almuerzos/');
        const getResponse = await fetch('http://172.16.11.29:8000/api/web/almuerzos/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('🧪 GET Status:', getResponse.status);
        if (getResponse.ok) {
          const getData = await getResponse.json();
          console.log('🧪 GET Data:', getData);
          console.log('🧪 GET Data Type:', typeof getData);
          console.log('🧪 GET Is Array:', Array.isArray(getData));
          console.log('🧪 GET Has results:', Boolean(getData?.results));
          console.log('🧪 GET Results length:', getData?.results?.length || 0);
        } else {
          console.log('🧪 GET Error response:', await getResponse.text());
        }
        
        // Test de endpoint disponibles
        console.log('🧪 Testing API endpoints availability...');
        const endpoints = [
          'http://172.16.11.29:8000/api/web/almuerzos/',
          'http://172.16.11.29:8000/api/admin/almuerzos/',
          'http://172.16.11.29:8000/api/mobile/almuerzos/'
        ];
        
        for (const endpoint of endpoints) {
          try {
            const testResponse = await fetch(endpoint, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            console.log(`🧪 ${endpoint} - Status: ${testResponse.status}`);
          } catch (err) {
            console.log(`🧪 ${endpoint} - Error: ${err.message}`);
          }
        }
        
      } catch (error) {
        console.log('🧪 TEST ERROR:', error);
      }
    };

    // Solo hacer test una vez cuando el componente se monta
    if (!hasTestedRef.current) {
      hasTestedRef.current = true;
      testAlmuerzosAPI();
    }
  }, []);

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
      console.error('Error al eliminar almuerzo:', error);
    }
  };

  const handleToggleStatus = useCallback(async (item) => {
    try {
      console.log('🎯 handleToggleStatus - Item:', item);
      console.log('🎯 handleToggleStatus - ID:', item.id, 'Current active:', item.active, 'New active:', !item.active);
      await alternarEstado(item.id, !item.active);
    } catch (error) {
      console.error('❌ Error al cambiar estado del almuerzo:', error);
    }
  }, [alternarEstado]);

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
        console.error('Error al guardar almuerzo:', error);
        
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

  // Manejadores de filtros
  const handleStatusChange = useCallback((value) => {
    console.log('🎛️ handleStatusChange - Value:', value);
    updateFilter('selectedStatus', value);
  }, [updateFilter]);

  const handleHolidayChange = useCallback((value) => {
    console.log('🎛️ handleHolidayChange - Value:', value);
    updateFilter('selectedHoliday', value);
  }, [updateFilter]);

  const handleDietChange = useCallback((value) => {
    console.log('🎛️ handleDietChange - Value:', value);
    updateFilter('selectedDiet', value);
  }, [updateFilter]);

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
          selectedStatus={searchFilters.selectedStatus || ''}
          onStatusChange={handleStatusChange}
          selectedHoliday={searchFilters.selectedHoliday || ''}
          onHolidayChange={handleHolidayChange}
          selectedDiet={searchFilters.selectedDiet || ''}
          onDietChange={handleDietChange}
          totalItems={filteredAlmuerzos.length}
          onCreateNew={handleCreateNew}
        />

        <AlmuerzoList
          almuerzos={filteredAlmuerzos}
          loading={loading}
          error={null}
          totalItems={filteredAlmuerzos.length}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onCreateFirst={handleCreateNew}
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
    </div>
  );
};

export default AlmuerzosGestion;
