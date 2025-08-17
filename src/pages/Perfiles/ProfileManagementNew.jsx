/**
 * Gestión de Perfiles con vistas integradas (no modal)
 * Sistema híbrido Django Groups + GroupProfile
 * Vista de listado y vista de formulario en la misma página
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useDataView } from '../../hooks/useDataView';
import { searchInFields } from '../../utils/searchUtils';
import ProfileActions from '../../components/Perfiles/ProfileActions';
import ProfileFormNew from '../../components/Perfiles/ProfileFormNew';
import { ProfileList, LoadingStates, ProfileDetailModal } from '../../components/Perfiles';
import useProfiles from '../../hooks/useProfiles';
import groupService from '../../services/groupService';

/**
 * Página principal de gestión de perfiles híbridos
 * Con sistema de vistas integradas (listado/formulario)
 */
const ProfileManagementNew = () => {
  const navigate = useNavigate();
  
  const {
    profiles,
    loading,
    fetchProfiles,
    createProfile,
    updateProfile,
    deleteProfile
  } = useProfiles();

  // Estados de vista (reemplaza lógica de modal)
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'edit', 'view'
  const [editingProfile, setEditingProfile] = useState(null);

  // Estados para modal de detalles
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);

  // Estados de filtros (solo para vista de listado)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(''); // nombre del grupo específico
  const [selectedUserRange, setSelectedUserRange] = useState('');

  const { currentPage, setCurrentPage } = useDataView();

  // Cargar perfiles al montar el componente
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Filtrado de perfiles para la vista de listado
  const filteredProfiles = useMemo(() => {
    if (currentView !== 'list') return []; // No filtrar si no estamos en vista de listado

    let filtered = profiles;

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(item => searchInFields(item, searchTerm, [
        'name', 'permissions.name', 'permissions.codename'
      ]));
    }

    // Filtro por grupo específico
    if (selectedGroup && selectedGroup !== '') {
      filtered = filtered.filter(profile => profile.name === selectedGroup);
    }

    // Filtro por estado del grupo (basado en usuarios)
    if (selectedUserRange && selectedUserRange !== '') {
      filtered = filtered.filter(profile => {
        const userCount = profile.users_count || 0;
        switch (selectedUserRange) {
          case 'empty':
            return userCount === 0;
          case 'small':
            return userCount >= 1 && userCount <= 5;
          case 'active':
            return userCount >= 6;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [profiles, searchTerm, selectedGroup, selectedUserRange, currentView]);

  // Preparar datos para ProfileTableView (sin adaptación, mantiene estructura original)
  const profilesForTable = useMemo(() => {
    return filteredProfiles.map(profile => ({
      ...profile,
      _original: profile // Mantener referencia original para compatibilidad
    }));
  }, [filteredProfiles]);

  // === HANDLERS PARA VISTA DE LISTADO ===

  const handleCreateNew = useCallback(() => {
    setEditingProfile(null);
    setCurrentView('create');
  }, []);

  const handleEdit = useCallback(async (adaptedProfile) => {
    try {
      // Extraer el perfil original del objeto adaptado
      const originalProfile = adaptedProfile._original || adaptedProfile;
      
      // Obtener el perfil completo con permisos del backend
      const fullProfile = await groupService.get(originalProfile.id);
      
      if (fullProfile && fullProfile.status === 'success' && fullProfile.data) {
        setEditingProfile(fullProfile.data);
      } else {
        // Fallback: usar el perfil básico si falla la carga completa
        setEditingProfile(originalProfile);
      }
      
      setCurrentView('edit');
    } catch (error) {
      toast.error('Error al cargar los datos del perfil');
      // Fallback: usar el perfil básico si falla la carga
      const originalProfile = adaptedProfile._original || adaptedProfile;
      setEditingProfile(originalProfile);
      setCurrentView('edit');
    }
  }, []);

  const handleView = useCallback((adaptedProfile) => {
    // Extraer el perfil original del objeto adaptado
    const originalProfile = adaptedProfile._original || adaptedProfile;
    setViewingProfile(originalProfile);
    setShowDetailModal(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setShowDetailModal(false);
    setViewingProfile(null);
  }, []);

  const handleDelete = useCallback(async (adaptedProfileOrId) => {
    // Manejar tanto objetos adaptados como IDs directos
    const profile = typeof adaptedProfileOrId === 'object' 
      ? (adaptedProfileOrId._original || adaptedProfileOrId)
      : { id: adaptedProfileOrId };
    
    const profileName = profile.nombre || profile.name || profile.question || `ID ${profile.id}`;
    
    if (window.confirm(`¿Estás seguro de que quieres eliminar el perfil "${profileName}"?`)) {
      try {
        await deleteProfile(profile.id);
        // Refrescar la lista después de eliminar
        await fetchProfiles();
      } catch (error) {
        // Error eliminando perfil
      }
    }
  }, [deleteProfile, fetchProfiles]);



  // === HANDLERS PARA VISTA DE FORMULARIO ===

  const handleBackToList = useCallback(() => {
    setCurrentView('list');
    setEditingProfile(null);
  }, []);

  const handleSubmitForm = useCallback(async (data) => {
    try {
      if (currentView === 'create') {
        await createProfile(data);
        // Refrescar la lista de perfiles para mostrar el nuevo perfil con conteo correcto
        await fetchProfiles();
      } else if (currentView === 'edit') {
        await updateProfile(editingProfile.id, data);
        // Refrescar la lista de perfiles para mostrar los cambios
        await fetchProfiles();
      }
      // Volver a la lista después de guardar
      setCurrentView('list');
      setEditingProfile(null);
    } catch (error) {
      // No cambiar de vista si hay error, mantener formulario abierto
    }
  }, [currentView, editingProfile, createProfile, updateProfile, fetchProfiles]);



  // === RENDERIZADO ===

  // Vista de Formulario (Crear/Editar/Ver)
  if (currentView === 'create' || currentView === 'edit' || currentView === 'view') {
    return (
      <ProfileFormNew
        mode={currentView}
        editingProfile={editingProfile}
        onSubmit={handleSubmitForm}
        onCancel={handleBackToList}
        loading={loading.create || loading.update}
      />
    );
  }

  // Estado de carga general (igual que KnowledgeBase)
  if (loading.profiles && !profiles?.length) {
    return (
      <div className="w-full bg-slate-50">
        <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <LoadingStates.ProfileListLoading />
        </div>
      </div>
    );
  }

  // Vista de Listado (por defecto)
  return (
    <div className="w-full bg-slate-50">
      <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Sin título - Solo filtros como KnowledgeBase */}

        {/* Acciones: Filtros y botones */}
        <ProfileActions
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedGroup={selectedGroup}
          onGroupChange={setSelectedGroup}
          selectedUserRange={selectedUserRange}
          onUserRangeChange={setSelectedUserRange}
          groups={profiles} // Pasar todos los grupos para las opciones del filtro
          onCreateNew={handleCreateNew}
          onImport={() => {}} // TODO: Implementar import
          totalItems={profilesForTable.length}
          loading={loading.profiles}
        />

        {/* Lista de perfiles usando ProfileList (igual que KnowledgeBase) */}
        <ProfileList
          profiles={profilesForTable}
          loading={loading.profiles}
          error={loading.error}
          totalItems={profilesForTable.length}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onCreateFirst={handleCreateNew}
          onRetry={fetchProfiles}
        />

        {/* Modal de Ver Detalles */}
        <ProfileDetailModal
          show={showDetailModal}
          onClose={handleCloseDetailModal}
          profile={viewingProfile}
          loading={loading.profiles}
        />
      </div>
    </div>
  );
};

export default ProfileManagementNew;
 