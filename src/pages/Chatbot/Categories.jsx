/**
 * Página de gestión de categorías del chatbot
 * Siguiendo el diseño minimalista y profesional de Knowledge Base
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useChatbot } from '../../hooks/useChatbot';
import { useDataView } from '../../hooks/useDataView';
import toast from 'react-hot-toast';

// Componentes modulares
import CategoryModal from '../../components/Chatbot/Categories/CategoryModal';
import CategoryActions from '../../components/Chatbot/Categories/CategoryActions';
import CategoryTableView from '../../components/Chatbot/Categories/CategoryTableView';
import LoadingStates from '../../components/Chatbot/Categories/LoadingStates';

/**
 * Página principal de categorías
 */
const Categories = () => {
  const {
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  } = useChatbot();

  // Estados del formulario y modal
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Cargar categorías al montar
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Filtrado y ordenamiento de categorías
  const processedCategories = useMemo(() => {
    let filtered = [...categories];

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(category => 
        category.name.toLowerCase().includes(searchLower) ||
        (category.description && category.description.toLowerCase().includes(searchLower))
      );
    }

    // Filtrar por estado
    if (selectedStatus === 'active') {
      filtered = filtered.filter(category => category.is_active !== false);
    } else if (selectedStatus === 'inactive') {
      filtered = filtered.filter(category => category.is_active === false);
    }

    // Ordenar
    if (sortOrder === 'asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      // Ordenar por último agregado (ID más alto primero) por defecto
      filtered.sort((a, b) => b.id - a.id);
    }

    return filtered;
  }, [categories, searchTerm, selectedStatus, sortOrder]);

  // Hook personalizado para manejo de vista de datos
  const {
    paginatedData: paginatedCategories,
    sortField,
    sortDirection,
    pagination,
    pageNumbers,
    displayRange,
    navigation,
    handleSort,
    handlePageChange
  } = useDataView(processedCategories, {
    initialSortField: null,
    initialSortDirection: null,
    itemsPerPage: 10
  });

  // Handlers de acciones
  const handleCreateNew = useCallback(() => {
    setEditingCategory(null);
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((category) => {
    setEditingCategory(category);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.')) {
      await deleteCategory(id);
    }
  }, [deleteCategory]);

  // Handler de exportar
  const handleExport = useCallback(() => {
    try {
      const dataToExport = processedCategories.map(category => ({
        id: category.id,
        nombre: category.name,
        descripcion: category.description || '',
        activa: category.is_active ? 'Sí' : 'No',
        preguntas: category.knowledge_count || 0,
        fecha_creacion: category.created_at || ''
      }));

      const csvContent = [
        ['ID', 'Nombre', 'Descripción', 'Activa', 'Preguntas', 'Fecha Creación'],
        ...dataToExport.map(item => [
          item.id,
          `"${item.nombre}"`,
          `"${item.descripcion}"`,
          item.activa,
          item.preguntas,
          item.fecha_creacion
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `categorias_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${dataToExport.length} categorías exportadas exitosamente`);
    } catch (error) {
      toast.error('Error al exportar categorías');
      console.error('Export error:', error);
    }
  }, [processedCategories]);

  // Handler del formulario
  const handleSubmit = useCallback(async (formData) => {
    const dataToSubmit = {
      ...formData,
    };

    // Validación preventiva de duplicados
    if (!editingCategory) {
      const categoryExists = categories.some(
        cat => cat.name.toLowerCase().trim() === dataToSubmit.name.toLowerCase().trim()
      );
      
      if (categoryExists) {
        toast.error('Ya existe una categoría con este nombre');
        return false;
      }
    }

    if (editingCategory) {
      return await updateCategory(editingCategory.id, dataToSubmit);
    } else {
      return await createCategory(dataToSubmit);
    }
  }, [editingCategory, updateCategory, createCategory, categories]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingCategory(null);
  }, []);

  const handleToggleExpansion = useCallback((categoryId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  // Estados de carga
  if (loading.categories && !categories?.length) {
    return <LoadingStates.CategoriesLoading />;
  }

  return (
    <div className="bg-gray-50">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Actions con filtros */}
          <CategoryActions
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            onCreateNew={handleCreateNew}
            totalItems={processedCategories.length}
            loading={loading.categories}
            onExport={handleExport}
          />

          {/* Categories Table */}
          <CategoryTableView
            data={paginatedCategories}
            loading={loading.categories}
            totalItems={processedCategories.length}
            sortField={sortField}
            sortDirection={sortDirection}
            expandedRows={expandedRows}
            pagination={pagination}
            pageNumbers={pageNumbers}
            displayRange={displayRange}
            navigation={navigation}
            onSort={handleSort}
            onPageChange={handlePageChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleExpansion={handleToggleExpansion}
            onCreateFirst={handleCreateNew}
          />
        </div>
      </div>

      {/* Modal de Crear/Editar */}
      <CategoryModal
        show={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingCategory={editingCategory}
        loading={loading.categories}
      />
    </div>
  );
};

export default Categories; 