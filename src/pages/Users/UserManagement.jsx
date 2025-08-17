/**
 * Página de Gestión de Usuarios
 * Actualizada para el sistema de permisos dinámicos de AquanQ
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../hooks/useUsers";
import { useDataView } from "../../hooks/useDataView";
import { usePermissions } from "../../hooks/usePermissions";
import { useAreas } from "../../hooks/useAreas";
import { searchInFields } from "../../utils/searchUtils";
import { PermissionGate, AccessDenied } from "../../components/Common";
import toast from "react-hot-toast";

// Componentes modulares
import {
  UserActions,
  UserTableView,
  UserModal,
  UserDetailModal,
  UserList,
  LoadingStates
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
    patchUser,
    deleteUser,
    toggleUserActiveStatus
  } = useUsers();
  
  // Hook para obtener cargos (para evitar múltiples instancias en el modal)
  const { cargos } = useAreas();

  // Estado del modal
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit' | 'view'
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  // Estados de filtros para sistema de permisos dinámicos
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(''); // Cambio de selectedRole a selectedGroup
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [showStatistics, setShowStatistics] = useState(false);
  
  // Vista unificada - sin pestañas (todos los usuarios en una sola vista)

  // Hook para vista de datos (tabla/card)
  const { currentView, toggleView } = useDataView('table');

  // Cargar datos iniciales (solo una vez)
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialData = async () => {
      if (isMounted) {
        try {
          await Promise.all([
            fetchUsers(),
            fetchGroups()
          ]);
        } catch (error) {
          // Error cargando datos iniciales
        }
      }
    };
    
    loadInitialData();
    
    return () => {
      isMounted = false;
    };
  }, []); // Sin dependencias para ejecutar solo una vez

  // Filtrado simple de usuarios (vista unificada)
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(item => searchInFields(item, searchTerm, [
        'first_name',
        'last_name', 
        'username',
        'email',
        'codigo_empleado'
      ]));
    }

    // Filtro por grupo dinámico 
    if (selectedGroup) {
      filtered = filtered.filter(user => 
        user.groups && Array.isArray(user.groups) && user.groups.some(group => 
          // Manejar grupos como strings directos o como objetos
          typeof group === 'string' 
            ? group === selectedGroup 
            : (group.name === selectedGroup || group.nombre === selectedGroup)
        )
      );
    }

    // Filtro por fecha
    if (selectedDateRange?.start || selectedDateRange?.end) {
      filtered = filtered.filter(user => {
        const userDate = new Date(user.date_joined || user.created_at);
        const startDate = selectedDateRange.start ? new Date(selectedDateRange.start) : null;
        const endDate = selectedDateRange.end ? new Date(selectedDateRange.end) : null;
        
        if (startDate && endDate) {
          return userDate >= startDate && userDate <= endDate;
        } else if (startDate) {
          return userDate >= startDate;
        } else if (endDate) {
          return userDate <= endDate;
        }
        return true;
      });
    }

    return filtered;
  }, [users, searchTerm, selectedGroup, selectedDateRange]);

  // Handlers del modal
  const handleCreateNew = useCallback(() => {
    setEditingUser(null);
    setFormMode('create');
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((user) => {
    setEditingUser(user);
    setFormMode('edit');
    setShowModal(true);
  }, []);

  const handleView = useCallback((user) => {
    setViewingUser(user);
    setShowDetailModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingUser(null);
    setFormMode('create');
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setShowDetailModal(false);
    setViewingUser(null);
  }, []);

  // Handlers de acciones
  const handleSaveUser = async (userData) => {
    if (editingUser) {
      return await updateUser(editingUser.id, userData);
    } else {
      return await createUser(userData);
    }
  };

  const handleDeleteUser = useCallback(async (userId) => {
    // Buscar el usuario para mostrar su nombre en el confirm
    const user = users.find(u => u.id === userId);
    const userName = user ? `${user.first_name} ${user.last_name}` : 'este usuario';
    
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${userName}?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const result = await deleteUser(userId);
      if (result) {
        // El toast de éxito ya se maneja en el hook useUsers
      }
    } catch (error) {
      toast.error('Error al eliminar usuario');
    }
  }, [deleteUser, users]);

  const handleToggleStatus = useCallback(async (userId, currentStatus) => {
    try {
      await toggleUserActiveStatus(userId, !currentStatus);
      toast.success(
        `Usuario ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`
      );
    } catch (error) {
      toast.error('Error al cambiar estado del usuario');
    }
  }, [toggleUserActiveStatus]);



  const handleImport = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Aquí iría la lógica de importación cuando se implemente
      toast.success('Función de importación próximamente');
    } catch (error) {
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



  // Estado de carga general (igual que KnowledgeBase)
  if (loading.users && !users?.length) {
    return (
      <div className="w-full bg-slate-50">
        <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <LoadingStates.UserListLoading />
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
            selectedDateRange={selectedDateRange}
            onDateRangeChange={setSelectedDateRange}
            onCreateNew={handleCreateNew}
            onImport={handleImport}
            groups={groups}
            totalItems={filteredUsers.length}
            isFormMode={showModal}
            onBack={handleCloseModal}
            formTitle={formMode === 'edit' ? 'Editando usuario' : 'Nuevo usuario'}
            userPermissions={userPermissions}
          />
        </PermissionGate>

        <UserList
          users={filteredUsers}
          loading={loading.users}
          error={loading.error}
          totalItems={filteredUsers.length}
          onEdit={handleEdit}
          onDelete={handleDeleteUser}
          onView={handleView}
          onToggleStatus={handleToggleStatus}
          onCreateFirst={handleCreateNew}
          onRetry={fetchUsers}
        />

        {/* Modal de usuario */}
        <UserModal
          show={showModal}
          onClose={handleCloseModal}
          onSubmit={handleSaveUser}
          editingUser={editingUser}
          loading={loading.create || loading.update}
          availableRoles={groups}
          availableCargos={cargos}
          mode={formMode}
        />

        {/* Modal de detalles de usuario */}
        <UserDetailModal
          show={showDetailModal}
          onClose={handleCloseDetailModal}
          user={viewingUser}
          loading={loading.users}
        />

      </div>
    </div>
  );
};

export default UserManagement;