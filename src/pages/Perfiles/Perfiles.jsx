/**
 * Página principal de gestión de Perfiles
 * Página completa con filtros, tabla y modales
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  PerfilModal, 
  PerfilTableView, 
  PerfilFilters,
  perfilesService 
} from '../../components/Perfiles';
import { useNotifications } from '../../hooks/useNotifications';
import { useDataView } from '../../hooks/useDataView';

const Perfiles = () => {
  // Estados principales
  const [perfiles, setPerfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({
    isOpen: false,
    perfil: null
  });

  // Estados de filtros
  const [filters, setFilters] = useState({
    search: '',
    tipoAcceso: '',
    tipoPerfil: '',
    estado: ''
  });

  // Hooks personalizados
  const { showNotification } = useNotifications();
  const { currentPage, setCurrentPage, totalPages, setTotalPages } = useDataView();

  // Cargar perfiles
  const loadPerfiles = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        search: filters.search,
        tipo_acceso: filters.tipoAcceso,
        is_active: filters.estado === 'active' ? true : filters.estado === 'inactive' ? false : undefined,
        is_admin_profile: filters.tipoPerfil === 'admin' ? true : undefined,
        is_worker_profile: filters.tipoPerfil === 'worker' ? true : undefined,
        ordering: '-created_at'
      };

      // Limpiar parámetros vacíos
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === undefined) {
          delete params[key];
        }
      });

      const result = await perfilesService.getPerfiles(params);
      
      if (result.success) {
        const data = result.data;
        setPerfiles(data.results || data);
        
        if (data.count !== undefined) {
          const itemsPerPage = 10; // Ajustar según tu configuración de paginación
          setTotalPages(Math.ceil(data.count / itemsPerPage));
        }
      } else {
        showNotification(result.error, 'error');
        setPerfiles([]);
      }
    } catch (error) {
      showNotification('Error al cargar perfiles', 'error');
      setPerfiles([]);
    } finally {
      setLoading(false);
    }
  }, [filters, showNotification, setTotalPages]);

  // Cargar perfiles al montar y cuando cambien los filtros
  useEffect(() => {
    loadPerfiles(currentPage);
  }, [loadPerfiles, currentPage]);

  // Handlers de filtros
  const handleSearchChange = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(1);
  };

  const handleTipoAccesoChange = (value) => {
    setFilters(prev => ({ ...prev, tipoAcceso: value }));
    setCurrentPage(1);
  };

  const handleTipoPerfilChange = (value) => {
    setFilters(prev => ({ ...prev, tipoPerfil: value }));
    setCurrentPage(1);
  };

  const handleEstadoChange = (value) => {
    setFilters(prev => ({ ...prev, estado: value }));
    setCurrentPage(1);
  };

  // Handlers de acciones
  const handleCreateNew = () => {
    setModalState({ isOpen: true, perfil: null });
  };

  const handleEdit = (perfil) => {
    setModalState({ isOpen: true, perfil });
  };

  const handleModalClose = () => {
    setModalState({ isOpen: false, perfil: null });
  };

  const handleModalSuccess = (perfilData) => {
    const isEditing = !!modalState.perfil;
    
    if (isEditing) {
      // Actualizar perfil existente
      setPerfiles(prev => prev.map(p => 
        p.id === perfilData.id ? perfilData : p
      ));
      showNotification('Perfil actualizado exitosamente', 'success');
    } else {
      // Agregar nuevo perfil
      setPerfiles(prev => [perfilData, ...prev]);
      showNotification('Perfil creado exitosamente', 'success');
    }
    
    // Recargar para asegurar consistencia
    loadPerfiles(currentPage);
  };

  const handleDelete = async (perfilId) => {
    try {
      const result = await perfilesService.deletePerfil(perfilId);
      
      if (result.success) {
        setPerfiles(prev => prev.filter(p => p.id !== perfilId));
        showNotification('Perfil eliminado exitosamente', 'success');
        
        // Si era el último elemento de la página, ir a la anterior
        if (perfiles.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          loadPerfiles(currentPage);
        }
      } else {
        showNotification(result.error, 'error');
      }
    } catch (error) {
      showNotification('Error al eliminar perfil', 'error');
    }
  };

  const handleToggleActive = async (perfilId, isActive) => {
    try {
      const result = await perfilesService.togglePerfilActive(perfilId, isActive);
      
      if (result.success) {
        setPerfiles(prev => prev.map(p => 
          p.id === perfilId ? { ...p, is_active: isActive } : p
        ));
        showNotification(
          `Perfil ${isActive ? 'activado' : 'desactivado'} exitosamente`, 
          'success'
        );
      } else {
        showNotification(result.error, 'error');
      }
    } catch (error) {
      showNotification('Error al cambiar estado del perfil', 'error');
    }
  };

  const handleViewUsers = async (perfil) => {
    try {
      const result = await perfilesService.getUsuariosPerfil(perfil.id);
      
      if (result.success) {
        // Por ahora mostrar alerta, luego se puede implementar un modal
        const usuarios = result.data.usuarios || [];
        if (usuarios.length === 0) {
          showNotification('Este perfil no tiene usuarios asignados', 'info');
        } else {
          const nombresUsuarios = usuarios.map(u => u.nombre_completo || u.username).join(', ');
          alert(`Usuarios con perfil "${perfil.nombre}":\n\n${nombresUsuarios}`);
        }
      } else {
        showNotification(result.error, 'error');
      }
    } catch (error) {
      showNotification('Error al obtener usuarios del perfil', 'error');
    }
  };

  const handleExport = async () => {
    try {
      // Por ahora mostrar notificación, luego implementar exportación real
      showNotification('Funcionalidad de exportación en desarrollo', 'info');
    } catch (error) {
      showNotification('Error al exportar perfiles', 'error');
    }
  };

  const totalItems = perfiles.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Perfiles</h1>
              <p className="text-gray-600 text-sm mt-1">
                Administra los perfiles y roles del sistema
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {totalItems} perfiles encontrados
              </span>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-6">
          <PerfilFilters
            searchTerm={filters.search}
            onSearchChange={handleSearchChange}
            selectedTipoAcceso={filters.tipoAcceso}
            onTipoAccesoChange={handleTipoAccesoChange}
            selectedTipoPerfil={filters.tipoPerfil}
            onTipoPerfilChange={handleTipoPerfilChange}
            selectedEstado={filters.estado}
            onEstadoChange={handleEstadoChange}
            onCreateNew={handleCreateNew}
            onExport={handleExport}
            totalItems={totalItems}
          />
        </div>
      </div>

      {/* Tabla de perfiles */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <PerfilTableView
          perfiles={perfiles}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewUsers={handleViewUsers}
          onToggleActive={handleToggleActive}
        />
      </div>

      {/* Modal de creación/edición */}
      <PerfilModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        perfil={modalState.perfil}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default Perfiles;