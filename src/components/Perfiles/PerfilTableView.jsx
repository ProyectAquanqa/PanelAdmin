/**
 * Vista de tabla para listado de perfiles
 * Componente optimizado con filtros, ordenamiento y acciones
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TableView } from '../Common/DataView';
import { ConfirmModal } from '../Common/Modal';
import { perfilesService } from '../../services/perfilesService';

const PerfilTableView = ({
  perfiles = [],
  loading = false,
  onEdit,
  onDelete,
  onViewUsers,
  onToggleActive
}) => {
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: '',
    perfil: null
  });
  const [actionLoading, setActionLoading] = useState(null);

  // Configuración de columnas
  const columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      render: (value, perfil) => (
        <div className="flex items-center">
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">
              {perfil.is_admin_profile ? '👑 Administrativo' : '👤 Trabajador'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (value) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-900 truncate" title={value}>
            {value}
          </p>
        </div>
      )
    },
    {
      key: 'tipo_acceso',
      label: 'Acceso',
      sortable: true,
      render: (value) => {
        const displays = {
          'WEB': { text: 'Web', color: 'bg-blue-100 text-blue-800' },
          'MOVIL': { text: 'Móvil', color: 'bg-green-100 text-green-800' },
          'AMBOS': { text: 'Web + Móvil', color: 'bg-purple-100 text-purple-800' }
        };
        const display = displays[value] || { text: value, color: 'bg-gray-100 text-gray-800' };
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${display.color}`}>
            {display.text}
          </span>
        );
      }
    },
    {
      key: 'usuarios_count',
      label: 'Usuarios',
      sortable: true,
      render: (value, perfil) => (
        <div className="text-center">
          <button
            onClick={() => onViewUsers?.(perfil)}
            className="text-blue-600 hover:text-blue-900 font-medium"
          >
            {value}
          </button>
        </div>
      )
    },
    {
      key: 'permisos',
      label: 'Permisos',
      render: (_, perfil) => {
        const permisos = [
          { modulo: 'Eventos', permiso: perfil.permisos_eventos },
          { modulo: 'Chatbot', permiso: perfil.permisos_chatbot },
          { modulo: 'Usuarios', permiso: perfil.permisos_usuarios },
          { modulo: 'Core', permiso: perfil.permisos_core },
          { modulo: 'Notificaciones', permiso: perfil.permisos_notificaciones }
        ];

        const permisosActivos = permisos.filter(p => p.permiso !== 'NONE');
        
        return (
          <div className="flex flex-wrap gap-1">
            {permisosActivos.slice(0, 3).map((p, index) => {
              const colorMap = {
                'VIEW': 'bg-yellow-100 text-yellow-800',
                'EDIT': 'bg-orange-100 text-orange-800', 
                'FULL': 'bg-red-100 text-red-800'
              };
              
              return (
                <span
                  key={index}
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${colorMap[p.permiso] || 'bg-gray-100 text-gray-800'}`}
                  title={`${p.modulo}: ${perfilesService.getPermisoDisplay(p.permiso)}`}
                >
                  {p.modulo.substring(0, 3)}
                </span>
              );
            })}
            {permisosActivos.length > 3 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                +{permisosActivos.length - 3}
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'is_active',
      label: 'Estado',
      sortable: true,
      render: (value, perfil) => (
        <button
          onClick={() => handleToggleActive(perfil)}
          disabled={actionLoading === `toggle-${perfil.id}`}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
            value 
              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          } ${actionLoading === `toggle-${perfil.id}` ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {actionLoading === `toggle-${perfil.id}` ? (
            <>
              <svg className="animate-spin -ml-1 mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              ...
            </>
          ) : (
            value ? 'Activo' : 'Inactivo'
          )}
        </button>
      )
    },
    {
      key: 'created_at',
      label: 'Creado',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
  ];

  // Configuración de acciones
  const actions = [
    {
      label: 'Editar',
      icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7',
      onClick: (perfil) => onEdit?.(perfil),
      variant: 'primary'
    },
    {
      label: 'Ver Usuarios',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      onClick: (perfil) => onViewUsers?.(perfil),
      variant: 'secondary'
    },
    {
      label: 'Eliminar',
      icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      onClick: (perfil) => handleDeleteClick(perfil),
      variant: 'danger',
      condition: (perfil) => perfil.usuarios_count === 0 // Solo permitir eliminar si no tiene usuarios
    }
  ];

  const handleToggleActive = async (perfil) => {
    setActionLoading(`toggle-${perfil.id}`);
    try {
      await onToggleActive?.(perfil.id, !perfil.is_active);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteClick = (perfil) => {
    if (perfil.usuarios_count > 0) {
      alert('No se puede eliminar un perfil que tiene usuarios asignados');
      return;
    }
    
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      perfil
    });
  };

  const handleConfirmAction = async () => {
    const { type, perfil } = confirmModal;
    
    if (type === 'delete') {
      await onDelete?.(perfil.id);
    }
    
    setConfirmModal({ isOpen: false, type: '', perfil: null });
  };

  return (
    <>
      <TableView
        data={perfiles}
        columns={columns}
        actions={actions}
        loading={loading}
        emptyMessage="No se encontraron perfiles"
        className="min-w-full"
        rowClassName={(perfil) => !perfil.is_active ? 'opacity-60' : ''}
      />

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: '', perfil: null })}
        onConfirm={handleConfirmAction}
        title="Confirmar Eliminación"
        message={
          confirmModal.perfil 
            ? `¿Estás seguro de que deseas eliminar el perfil "${confirmModal.perfil.nombre}"? Esta acción no se puede deshacer.`
            : ''
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  );
};

PerfilTableView.propTypes = {
  perfiles: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onViewUsers: PropTypes.func,
  onToggleActive: PropTypes.func
};

export default PerfilTableView;