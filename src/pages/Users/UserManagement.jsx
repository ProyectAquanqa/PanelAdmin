/**
 * Página de Gestión de Usuarios
 * Actualizada para el sistema de permisos dinámicos de AquanQ
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../hooks/useUsers";
import { useDataView } from "../../hooks/useDataView";
import { usePermissions } from "../../hooks/usePermissions";
import { searchInFields } from "../../utils/searchUtils";
import { PermissionGate, AccessDenied } from "../../components/Common";
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
 * Compatible con el sistema de permisos dinámicos
 */
const UserManagement = () => {
  const navigate = useNavigate();
  const { users: userPermissions, isAdmin, isContentManager, isAuthenticated } = usePermissions();
  
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

  // Estados de filtros para sistema de permisos dinámicos
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(''); // Cambio de selectedRole a selectedGroup
  const [showStatistics, setShowStatistics] = useState(false);
  
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

    // Filtro por grupo dinámico 
    if (selectedGroup) {
      filtered = filtered.filter(user => 
        user.groups && user.groups.some(group => 
          group.id?.toString() === selectedGroup || group.name === selectedGroup
        )
      );
    }

    return filtered;
  }, [users, searchTerm, selectedGroup]);

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

  const handleImport = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Aquí iría la lógica de importación cuando se implemente
      toast.success('Función de importación próximamente');
    } catch (error) {
      console.error('Error al importar usuarios:', error);
      toast.error('Error al importar usuarios');
    }
  }, []);

  // Verificar permisos para mostrar estadísticas
  const handleToggleStatistics = useCallback(() => {
    if (userPermissions.canViewStats) {
      setShowStatistics(!showStatistics);
    } else {
      toast.error('No tienes permisos para ver estadísticas');
    }
  }, [userPermissions.canViewStats, showStatistics]);

  // Verificar acceso: si no está autenticado, bloquear; si lo está, permitir y delegar al backend
  if (!isAuthenticated) {
    return (
      <div className="w-full bg-slate-50">
        <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AccessDenied 
            title="Acceso Denegado"
            message="No has iniciado sesión."
            showContactInfo={true}
          />
        </div>
      </div>
    );
  }



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



        {/* Filtros y acciones con permisos dinámicos (permitimos cargar UI; backend hará enforcement real) */}
        <PermissionGate
          condition={() => true}
          fallback={<AccessDenied message="No tienes permisos para ver esta sección" />}
        >
          <UserActions
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedGroup={selectedGroup}
            onGroupChange={setSelectedGroup}
            onCreateNew={handleCreateNew}
            onExport={handleExport}
            onImport={handleImport}
            groups={groups}
            totalItems={filteredUsers.length}
            isFormMode={showInlineForm}
            onBack={handleCloseInline}
            formTitle={formMode === 'edit' ? 'Editando usuario' : 'Nuevo usuario'}
            userPermissions={userPermissions}
          />
        </PermissionGate>

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