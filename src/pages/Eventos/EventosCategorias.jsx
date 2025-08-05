import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useCategorias } from "../../hooks/useCategorias";

import {
  CategoriaList,
  LoadingStates,
} from "../../components/Eventos";
import CategoriaModal from "../../components/Eventos/CategoriaModal";
import CategoriaActions from "../../components/Eventos/CategoriaActions";
import { ConfirmModal } from "../../components/Common/Modal";
import toast from "react-hot-toast";

/**
 * Página principal de Gestión de Categorías - Basada en KnowledgeBase
 * Refactorizada para seguir el mismo patrón de diseño y estructura
 */
const EventosCategorias = () => {
  const {
    categorias,
    loading,
    loadCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
  } = useCategorias();

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

  // Estados de filtros simplificados
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  // Filtrado y procesamiento de categorías - SIMPLIFICADO
  const processedCategorias = useMemo(() => {
    let filtered = [...categorias];

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(categoria => 
        categoria.nombre.toLowerCase().includes(searchLower) ||
        (categoria.descripcion && categoria.descripcion.toLowerCase().includes(searchLower))
      );
    }

    // Filtrar por estado
    if (selectedStatus === 'active') {
      filtered = filtered.filter(categoria => categoria.is_active !== false);
    } else if (selectedStatus === 'inactive') {
      filtered = filtered.filter(categoria => categoria.is_active === false);
    }

    // Ordenar
    if (sortOrder === 'nombre_asc') {
      filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (sortOrder === 'nombre_desc') {
      filtered.sort((a, b) => b.nombre.localeCompare(a.nombre));
    } else {
      // Ordenar por último agregado por defecto
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return filtered;
  }, [categorias, searchTerm, selectedStatus, sortOrder]);

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
      message: `¿Está seguro de que desea eliminar la categoría "${item.nombre}"? Esta acción no se puede deshacer.`,
      onConfirm: () => confirmDelete(item.id),
    });
  }, []);

  const confirmDelete = async (categoriaId) => {
    try {
      await eliminarCategoria(categoriaId);
      setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
    }
  };

  // Manejar envío del formulario
  const handleSubmit = useCallback(
    async (formData) => {
      setModalLoading(true);
      setModalErrors({});

      try {
        if (editingItem) {
          await actualizarCategoria(editingItem.id, formData);
        } else {
          await crearCategoria(formData);
        }
        
        handleCloseModal();
        return true;
      } catch (error) {
        console.error('Error al guardar categoría:', error);
        
        if (error.status === 422 && error.data?.error?.details) {
          // Errores de validación
          setModalErrors(error.data.error.details);
        } else {
          setModalErrors({ 
            general: error.message || 'Error al guardar la categoría' 
          });
        }
        return false;
      } finally {
        setModalLoading(false);
      }
    },
    [editingItem, actualizarCategoria, crearCategoria]
  );

  const handleCloseModal = useCallback(() => {
    setShowCreateModal(false);
    setEditingItem(null);
    setModalErrors({});
    setModalLoading(false);
  }, []);

  // Estado de carga general
  if (loading && !categorias?.length) {
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
        <CategoriaActions
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          onCreateNew={handleCreateNew}
          onExport={() => toast.success('Función de exportar próximamente')}
          totalItems={processedCategorias.length}
          loading={loading}
        />

        <CategoriaList
          categorias={processedCategorias}
          loading={loading}
          error={null}
          totalItems={processedCategorias.length}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreateFirst={handleCreateNew}
          onRetry={() => loadCategorias()}
        />
      </div>

      {/* Modal de Crear/Editar usando componente separado */}
      <CategoriaModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        categoria={editingItem}
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

export default EventosCategorias;