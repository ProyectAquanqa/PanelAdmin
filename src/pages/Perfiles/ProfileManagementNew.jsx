/**
 * Gestión de Perfiles con vistas integradas (no modal)
 * Sistema híbrido Django Groups + GroupProfile
 * Vista de listado y vista de formulario en la misma página
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataView } from '../../hooks/useDataView';
import { searchInFields } from '../../utils/searchUtils';
import ProfileActions from '../../components/Perfiles/ProfileActions';
import ProfileTableView from '../../components/Perfiles/ProfileTableView';
import ProfileFormNew from '../../components/Perfiles/ProfileFormNew';
import useProfiles from '../../hooks/useProfiles';

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
    deleteProfile,
    exportProfiles
  } = useProfiles();

  // Estados de vista (reemplaza lógica de modal)
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'edit', 'view'
  const [editingProfile, setEditingProfile] = useState(null);

  // Estados de filtros (solo para vista de listado)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState(''); // admin, worker, todos

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
      filtered = searchInFields(filtered, searchTerm, [
        'nombre', 'name', 'descripcion'
      ]);
    }

    // Filtro por tipo de perfil
    if (selectedType === 'admin') {
      filtered = filtered.filter(profile => profile.is_admin_group);
    } else if (selectedType === 'worker') {
      filtered = filtered.filter(profile => profile.is_worker_group);
    }

    return filtered;
  }, [profiles, searchTerm, selectedType, currentView]);

  // === HANDLERS PARA VISTA DE LISTADO ===

  const handleCreateNew = useCallback(() => {
    setEditingProfile(null);
    setCurrentView('create');
  }, []);

  const handleEdit = useCallback((profile) => {
    setEditingProfile(profile);
    setCurrentView('edit');
  }, []);

  const handleView = useCallback((profile) => {
    setEditingProfile(profile);
    setCurrentView('view');
  }, []);

  const handleDelete = useCallback(async (profile) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el perfil "${profile.nombre || profile.name}"?`)) {
      try {
        await deleteProfile(profile.id);
      } catch (error) {
        console.error('Error eliminando perfil:', error);
      }
    }
  }, [deleteProfile]);

  const handleExport = useCallback(async () => {
    try {
      await exportProfiles();
    } catch (error) {
      console.error('Error exportando perfiles:', error);
    }
  }, [exportProfiles]);

  // === HANDLERS PARA VISTA DE FORMULARIO ===

  const handleBackToList = useCallback(() => {
    setCurrentView('list');
    setEditingProfile(null);
  }, []);

  const handleSubmitForm = useCallback(async (data) => {
    try {
      if (currentView === 'create') {
        await createProfile(data);
        console.log('✅ Perfil creado correctamente');
      } else if (currentView === 'edit') {
        await updateProfile(editingProfile.id, data);
        console.log('✅ Perfil actualizado correctamente');
      }
      // Volver a la lista después de guardar
      setCurrentView('list');
      setEditingProfile(null);
    } catch (error) {
      console.error('❌ Error guardando perfil:', error);
      // No cambiar de vista si hay error, mantener formulario abierto
    }
  }, [currentView, editingProfile, createProfile, updateProfile]);

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

  // Vista de Listado (por defecto)
  return (
    <div className="w-full bg-slate-50">
      <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Sin título - Solo filtros como KnowledgeBase */}

        {/* Acciones: Filtros y botones */}
        <ProfileActions
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          onCreateNew={handleCreateNew}
          onExport={handleExport}
          onImport={() => console.log('Importar perfiles (por implementar)')} // TODO: Implementar import
          totalItems={filteredProfiles.length}
          loading={loading.profiles}
        />

        {/* Tabla de perfiles */}
        <ProfileTableView
          data={filteredProfiles}
          totalItems={filteredProfiles.length}
          loading={loading.profiles}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          onCreateNew={handleCreateNew}
        />
      </div>
    </div>
  );
};

export default ProfileManagementNew;
 