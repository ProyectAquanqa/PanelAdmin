import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useComentarios } from "../../hooks/useComentarios";
import { useEventos } from "../../hooks/useEventos";
import userService from "../../services/userService";
import { searchInFields } from "../../utils/searchUtils";
import {
  ComentarioList,
  ComentarioDetailModal,
  LoadingStates,
} from "../../components/Eventos";
import ComentarioFilters from "../../components/Eventos/ComentarioFilters";
import { ConfirmModal } from "../../components/Common/Modal";
import toast from "react-hot-toast";

/**
 * Página principal de Gestión de Comentarios - Basada en EventosGestion
 * Solo permite ver y eliminar comentarios (sin crear/editar)
 */
const ComentariosGestion = () => {
  const {
    comentarios,
    loading,
    loadComentarios,
    eliminarComentario,
  } = useComentarios();

  const { eventos, loadEventos } = useEventos();

  // Estados locales para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvento, setSelectedEvento] = useState('');
  const [selectedUsuario, setSelectedUsuario] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState({ start: '', end: '' });
  
  // Estado para usuarios (para el filtro)
  const [usuarios, setUsuarios] = useState([]);
  
  // Estados para modal de detalles
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingComentario, setViewingComentario] = useState(null);

  // Estados del modal de confirmación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  // Filtrado y procesamiento de comentarios
  const filteredComentarios = useMemo(() => {
    let filtered = [...(comentarios || [])];

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(comentario => 
        searchInFields(comentario, searchTerm, [
          'contenido',
          'usuario.full_name',
          'usuario.username',
          'evento.titulo'
        ])
      );
    }

    // Filtrar por evento
    if (selectedEvento.trim()) {
      filtered = filtered.filter(comentario => 
        comentario.evento?.id?.toString() === selectedEvento
      );
    }

    // Filtrar por usuario
    if (selectedUsuario.trim()) {
      filtered = filtered.filter(comentario => 
        comentario.usuario?.id?.toString() === selectedUsuario
      );
    }

    // Filtrar por rango de fecha
    if (selectedDateRange.start || selectedDateRange.end) {
      filtered = filtered.filter(comentario => {
        if (!comentario.created_at) return false;
        
        const comentarioDate = new Date(comentario.created_at);
        let isInRange = true;

        if (selectedDateRange.start) {
          const startDate = new Date(selectedDateRange.start);
          isInRange = isInRange && comentarioDate >= startDate;
        }

        if (selectedDateRange.end) {
          const endDate = new Date(selectedDateRange.end);
          endDate.setHours(23, 59, 59, 999); // Final del día
          isInRange = isInRange && comentarioDate <= endDate;
        }

        return isInRange;
      });
    }

    // Ordenar por fecha de creación (más recientes primero)
    filtered.sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return filtered;
  }, [comentarios, searchTerm, selectedEvento, selectedUsuario, selectedDateRange]);

  // Cargar datos iniciales
  useEffect(() => {
    loadComentarios();
    loadEventos(); // Para los filtros de eventos
    loadUsuarios(); // Para los filtros de usuarios
  }, [loadComentarios, loadEventos]);

  // Función para cargar usuarios
  const loadUsuarios = async () => {
    try {
      const response = await userService.users.list(1, 100);
      
      let usuarios = [];
      
      // Manejar diferentes formatos de respuesta del backend
      if (response && response.status === 'success') {
        if (Array.isArray(response.data)) {
          usuarios = response.data;
        } else if (response.data && response.data.results) {
          usuarios = response.data.results;
        }
      } else if (response && response.results) {
        usuarios = response.results;
      } else if (Array.isArray(response)) {
        usuarios = response;
      }
      
      if (usuarios.length === 0) {
        throw new Error('No se encontraron usuarios en la respuesta');
      }
      
      // Filtrar y procesar usuarios válidos
      const usuariosValidos = usuarios
        .filter(usuario => usuario && usuario.id)
        .map(usuario => ({
          id: usuario.id,
          username: usuario.username,
          first_name: usuario.first_name,
          last_name: usuario.last_name,
          full_name: usuario.full_name || `${usuario.first_name || ''} ${usuario.last_name || ''}`.trim() || usuario.username,
          is_active: usuario.is_active !== false
        }))
        .filter(usuario => usuario.is_active && usuario.full_name);
      
      setUsuarios(usuariosValidos);
      
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      
      // Fallback: fetch directo al endpoint
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
        const cleanBase = API_BASE.replace(/\/(web|admin|mobile)\/?$/, '');
        const url = `${cleanBase}/web/users/?page_size=100`;
        
        const directResponse = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!directResponse.ok) {
          throw new Error(`HTTP ${directResponse.status}: ${directResponse.statusText}`);
        }
        
        const directData = await directResponse.json();
        
        let usuarios = [];
        if (directData.status === 'success' && directData.data) {
          usuarios = Array.isArray(directData.data) ? directData.data : [];
        } else if (directData.results) {
          usuarios = directData.results;
        }
        
        if (usuarios.length > 0) {
          const processed = usuarios
            .filter(u => u && u.id)
            .map(u => ({
              id: u.id,
              username: u.username,
              full_name: u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username,
              is_active: u.is_active !== false
            }))
            .filter(u => u.is_active && u.full_name);
            
          setUsuarios(processed);
        }
        
      } catch (directError) {
        console.error('Error total cargando usuarios:', directError);
        toast.error('No se pudieron cargar los usuarios para el filtro');
      }
    }
  };

  // Handlers de acciones
  const handleViewDetails = useCallback((comentario) => {
    setViewingComentario(comentario);
    setShowDetailModal(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setShowDetailModal(false);
    setViewingComentario(null);
  }, []);

  const handleDelete = useCallback((item) => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirmar eliminación',
      message: `¿Está seguro de que desea eliminar este comentario? Esta acción no se puede deshacer.`,
      onConfirm: () => confirmDelete(item.id),
    });
  }, []);

  const confirmDelete = async (comentarioId) => {
    try {
      await eliminarComentario(comentarioId);
      setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
    }
  };

  // Manejadores de filtros
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleEventoChange = useCallback((value) => {
    setSelectedEvento(value);
  }, []);

  const handleUsuarioChange = useCallback((value) => {
    setSelectedUsuario(value);
  }, []);

  const handleDateRangeChange = useCallback((dateRange) => {
    setSelectedDateRange(dateRange);
  }, []);

  // Estado de carga general
  if (loading && !comentarios?.length) {
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
        <ComentarioFilters
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          selectedEvento={selectedEvento}
          onEventoChange={handleEventoChange}
          selectedUsuario={selectedUsuario}
          onUsuarioChange={handleUsuarioChange}
          selectedDateRange={selectedDateRange}
          onDateRangeChange={handleDateRangeChange}
          eventos={eventos}
          usuarios={usuarios}
          totalItems={filteredComentarios.length}
        />

        <ComentarioList
          comentarios={filteredComentarios}
          loading={loading}
          error={null}
          totalItems={filteredComentarios.length}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
          onRetry={() => loadComentarios()}
        />
      </div>

      {/* Modal de Ver Detalles */}
      <ComentarioDetailModal
        show={showDetailModal}
        onClose={handleCloseDetailModal}
        comentario={viewingComentario}
        loading={loading}
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

export default ComentariosGestion;
