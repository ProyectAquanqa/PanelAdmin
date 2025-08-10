/**
 * Página de Gestión de Usuarios
 * Implementa el patrón modular siguiendo KnowledgeBase
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../hooks/useUsers";
import { useDataView } from "../../hooks/useDataView";
import { searchInFields } from "../../utils/searchUtils";
import toast from "react-hot-toast";

// Componentes modulares
import {
  UserActions,
  UserTableView,
  UserModal,
  UserFormInline
} from "../../components/Users";

/**
 * Página principal de gestión de usuarios
 * Siguiendo el patrón de KnowledgeBase
 */
const UserManagement = () => {
  const navigate = useNavigate();
  
  const {
    users,
    groups,
    loading,
    fetchUsers,
    fetchGroups,
    createUser,
    updateUser,
    deleteUser,
    toggleUserActiveStatus,
    exportUsers
  } = useUsers();

  // Estado del formulario inline
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
  const [editingUser, setEditingUser] = useState(null);

  // Estados de filtros (simplificados)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  
  // Vista unificada - sin pestañas (todos los usuarios en una sola vista)

  // Hook para vista de datos (tabla/card)
  const { currentView, toggleView } = useDataView('table');

  // Cargar datos iniciales
  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, [fetchUsers, fetchGroups]);

  // Filtrado simple de usuarios (vista unificada)
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      filtered = searchInFields(filtered, searchTerm, [
        'first_name',
        'last_name', 
        'username',
        'email',
        'codigo_empleado'
      ]);
    }

    // Filtro por perfil/grupo (único filtro adicional necesario)
    if (selectedRole) {
      filtered = filtered.filter(user => 
        user.groups && user.groups.some(group => 
          group.id?.toString() === selectedRole
        )
      );
    }

    return filtered;
  }, [users, searchTerm, selectedRole]);

  // Handlers del modal
  const handleCreateNew = useCallback(() => {
    setEditingUser(null);
    setFormMode('create');
    setShowInlineForm(true);
  }, []);

  const handleEdit = useCallback((user) => {
    setEditingUser(user);
    setFormMode('edit');
    setShowInlineForm(true);
  }, []);

  const handleView = useCallback((user) => {
    setEditingUser(user);
    setFormMode('edit');
    setShowInlineForm(true);
  }, []);

  const handleCloseInline = useCallback(() => {
    setShowInlineForm(false);
    setEditingUser(null);
    setFormMode('create');
  }, []);

  // Handlers de acciones
  const handleSaveUser = useCallback(async (userData) => {
    try {
      if (formMode === 'create') {
        await createUser(userData);
        toast.success('Usuario creado exitosamente');
      } else if (formMode === 'edit') {
        await updateUser(editingUser.id, userData);
        toast.success('Usuario actualizado exitosamente');
      }
      handleCloseInline();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      toast.error(formMode === 'create' ? 'Error al crear usuario' : 'Error al actualizar usuario');
    }
  }, [formMode, editingUser, createUser, updateUser, handleCloseInline]);

  const handleDeleteUser = useCallback(async (userId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    try {
      await deleteUser(userId);
      toast.success('Usuario eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      toast.error('Error al eliminar usuario');
    }
  }, [deleteUser]);

  const handleToggleStatus = useCallback(async (userId, currentStatus) => {
    try {
      await toggleUserActiveStatus(userId, !currentStatus);
      toast.success(
        `Usuario ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`
      );
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      toast.error('Error al cambiar estado del usuario');
    }
  }, [toggleUserActiveStatus]);

  const handleExport = useCallback(async () => {
    try {
      await exportUsers();
      toast.success('Usuarios exportados exitosamente');
    } catch (error) {
      console.error('Error al exportar usuarios:', error);
      toast.error('Error al exportar usuarios');
    }
  }, [exportUsers]);

  const handleImport = useCallback(() => {
    navigate('/usuarios/importacion');
  }, [navigate]);

  // Mostrar loading siguiendo patrón KnowledgeBase
  if (loading.users && users.length === 0) {
    return (
      <div className="w-full bg-slate-50">
        <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="p-8 text-center">🔄 Cargando usuarios...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50">
      <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Encabezado */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {showInlineForm ? (formMode === 'edit' ? 'Editar Usuario' : 'Crear Usuario') : 'Gestión de Usuarios'}
            </h1>
            {!showInlineForm && (
              <p className="text-sm text-gray-600 mt-1">Administra todos los usuarios del sistema. Los permisos se gestionan mediante perfiles.</p>
            )}
          </div>
          {/* Botón Volver se gestiona en UserActions en modo formulario */}
        </div>

        {/* Filtros y acciones siguiendo patrón KnowledgeBase */}
        <UserActions
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          onCreateNew={handleCreateNew}
          onExport={handleExport}
          onImport={handleImport}
          groups={groups}
          totalItems={filteredUsers.length}
          isFormMode={showInlineForm}
          onBack={handleCloseInline}
          formTitle={formMode === 'edit' ? 'Editando usuario' : 'Nuevo usuario'}
        />

        {!showInlineForm ? (
          <UserTableView
            data={filteredUsers}
            loading={loading.users}
            totalItems={filteredUsers.length}
            sortField=""
            sortDirection="asc"
            expandedRows={new Set()}
            pagination={{
              current_page: 1,
              total_pages: 1,
              total: filteredUsers.length,
              per_page: 10
            }}
            pageNumbers={[1]}
            displayRange={{
              start: 1,
              end: Math.min(10, filteredUsers.length),
              total: filteredUsers.length
            }}
            navigation={{
              hasPrevious: false,
              hasNext: false
            }}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDeleteUser}
            onToggleStatus={handleToggleStatus}
            onCreateNew={handleCreateNew}
            onSort={() => {}}
            onPageChange={() => {}}
            onToggleExpansion={() => {}}
          />
        ) : (
          <UserFormInline
            mode={formMode}
            initialData={editingUser}
            groups={groups}
            loading={loading.create || loading.update}
            onSubmit={handleSaveUser}
            onCancel={handleCloseInline}
          />
        )}

      </div>
    </div>
  );
};

export default UserManagement;