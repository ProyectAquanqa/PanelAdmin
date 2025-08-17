/**
 * Página de gestión de usuarios del sistema
 * Siguiendo el patrón modular de Conversations y KnowledgeBase
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../hooks/useUsers';
import { useDataView } from '../../hooks/useDataView';
import { searchInFields } from '../../utils/searchUtils';
import toast from 'react-hot-toast';

// Componentes modulares
import {
  UserFilters,
  UserTableView,
  UserModal,
  LoadingStates
} from '../../components/Users';

/**
 * Página principal de usuarios
 */
const Users = () => {
  const navigate = useNavigate();
  const {
    users,
    userStats,
    groups,
    loading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserActiveStatus,
    exportUsers
  } = useUsers();

  // Estados del modal y filtros
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [editingUser, setEditingUser] = useState(null);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  
  // Estados de UI
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Cargar usuarios al montar
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Usar solo datos reales del backend
  const displayUsers = users || [];

  // Roles disponibles del backend AquanQ (auth.groups)
  const availableRoles = useMemo(() => {
    return groups || [];
  }, [groups]);

  // Filtrado y procesamiento de usuarios
  const processedUsers = useMemo(() => {
    let filtered = [...(displayUsers || [])];

    // Filtrar por búsqueda (usando searchUtils para manejar acentos)
    if (searchTerm.trim()) {
      filtered = filtered.filter(user => 
        searchInFields(user, searchTerm, [
          'username',
          'first_name',
          'last_name',
          'email',
          'full_name'
        ])
      );
    }

    // Filtrar por rol (auth.groups)
    if (selectedRole && selectedRole.trim()) {
      filtered = filtered.filter(user => 
        user.groups && user.groups.some(group => 
          (typeof group === 'string' ? group : group.name) === selectedRole
        )
      );
    }

    // Filtrar por rango de fechas
    if (selectedDateRange && (selectedDateRange.from || selectedDateRange.to)) {
      filtered = filtered.filter(user => {
        const userDate = new Date(user.date_joined);
        let isInRange = true;
        
        if (selectedDateRange.from) {
          const fromDate = new Date(selectedDateRange.from);
          isInRange = isInRange && userDate >= fromDate;
        }
        
        if (selectedDateRange.to) {
          const toDate = new Date(selectedDateRange.to);
          toDate.setHours(23, 59, 59, 999); // Incluir todo el día
          isInRange = isInRange && userDate <= toDate;
        }
        
        return isInRange;
      });
    }



    return filtered;
  }, [displayUsers, searchTerm, selectedRole, selectedDateRange]);

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
  } = useDataView(processedUsers, {
    itemsPerPage: 10,
    sortField: 'date_joined',
    sortDirection: 'desc'
  });

  // Funciones de manejo de modal
  const handleCreateNew = useCallback(() => {
    setEditingUser(null);
    setModalMode('create');
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((user) => {
    setEditingUser(user);
    setModalMode('edit');
    setShowModal(true);
  }, []);

  const handleView = useCallback((user) => {
    setEditingUser(user);
    setModalMode('view');
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingUser(null);
    setModalMode('create');
  }, []);

  // Funciones CRUD
  const handleSubmit = useCallback(async (userData) => {
    try {
      let result;
      
      if (modalMode === 'create') {
        result = await createUser(userData);
      } else if (modalMode === 'edit') {
        result = await updateUser(editingUser.id, userData);
      }
      
      if (result) {
        handleCloseModal();
        // Recargar datos
        fetchUsers();
      }
      
      return result;
    } catch (error) {
      // Error en handleSubmit
      toast.error('Error al guardar usuario');
      return false;
    }
  }, [modalMode, editingUser, createUser, updateUser, handleCloseModal, fetchUsers]);

  const handleToggleStatus = useCallback(async (userId) => {
    try {
      await toggleUserActiveStatus(userId);
      // Los datos se actualizan automáticamente en el hook
    } catch (error) {
      toast.error('Error al cambiar estado del usuario');
    }
  }, [toggleUserActiveStatus]);

  const handleDelete = useCallback(async (userId) => {
    if (window.confirm('¿Estás seguro de que deseas desactivar este usuario?')) {
      try {
        await deleteUser(userId);
        // Los datos se actualizan automáticamente en el hook
      } catch (error) {
        toast.error('Error al desactivar usuario');
      }
    }
  }, [deleteUser]);

  // Funciones de utilidades
  const handleExport = useCallback(async () => {
    try {
      const filters = {
        search: searchTerm,
        groups__name: selectedRole,
        date_from: selectedDateRange?.from || '',
        date_to: selectedDateRange?.to || ''
      };
      
      await exportUsers(filters);
    } catch (error) {
      toast.error('Error al exportar usuarios');
    }
  }, [exportUsers, searchTerm, selectedRole, selectedDateRange]);

  const handleImport = useCallback(() => {
    // Navegar a la página de importación
    navigate('/usuarios/importar');
  }, [navigate]);

  // Función para limpiar filtros
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedRole('');
    setSelectedDateRange(null);
  }, []);

  // Estado de carga
  if (loading.users) {
    return <LoadingStates.UsersLoading />;
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">

          {/* Filtros */}
          <UserFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
            selectedDateRange={selectedDateRange}
            onDateRangeChange={setSelectedDateRange}
            roles={availableRoles}
            onCreateNew={handleCreateNew}
            onExport={handleExport}
            onImport={handleImport}
            totalItems={processedUsers.length}
            onClearFilters={handleClearFilters}
          />

          {/* Tabla */}
          <UserTableView
            data={paginatedData}
            loading={loading.users}
            totalItems={processedUsers.length}
            sortField={sortField}
            sortDirection={sortDirection}
            expandedRows={expandedRows}
            pagination={pagination}
            pageNumbers={pageNumbers}
            displayRange={displayRange}
            navigation={navigation}
            onSort={handleSort}
            onPageChange={handlePageChange}
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
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <UserModal
          show={showModal}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          editingUser={editingUser}
          loading={loading.create || loading.update}
          availableRoles={availableRoles}
          mode={modalMode}
        />
      )}

      {/* Modal de carga */}
      {loading.create || loading.update && (
        <LoadingStates.UserModalLoading />
      )}
    </div>
  );
};

export default Users;