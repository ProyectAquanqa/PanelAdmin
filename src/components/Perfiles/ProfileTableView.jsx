/**
 * Vista de tabla para perfiles siguiendo el patrón KnowledgeBase
 * Diseño profesional y consistente
 */

import React from 'react';
import PropTypes from 'prop-types';

const ProfileTableView = ({
  data = [],
  loading = false,
  totalItems = 0,
  onEdit,
  onView,
  onDelete,
  onCreateNew
}) => {
  // Skeleton de carga
  const LoadingSkeleton = () => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="animate-pulse">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
        {[...Array(5)].map((_, index) => (
          <div key={index} className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Estado vacío
  const EmptyState = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-12">
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h3 className="mt-4 text-sm font-medium text-gray-900">No hay perfiles</h3>
        <p className="mt-2 text-sm text-gray-500">
          Comienza creando un nuevo perfil del sistema.
        </p>
        <div className="mt-6">
          <button
            onClick={onCreateNew}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Perfil
          </button>
        </div>
      </div>
    </div>
  );

  // Badge para tipo de acceso
  const AccessTypeBadge = ({ tipoAcceso }) => {
    const getBadgeStyles = (tipo) => {
      switch (tipo) {
        case 'WEB':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'MOVIL':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'AMBOS':
          return 'bg-purple-100 text-purple-800 border-purple-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    const getLabel = (tipo) => {
      switch (tipo) {
        case 'WEB':
          return 'Solo Web';
        case 'MOVIL':
          return 'Solo Móvil';
        case 'AMBOS':
          return 'Web y Móvil';
        default:
          return tipo;
      }
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getBadgeStyles(tipoAcceso)}`}>
        {getLabel(tipoAcceso)}
      </span>
    );
  };

  // Badge para tipo de perfil
  const ProfileTypeBadge = ({ profile }) => {
    if (profile.is_admin_group) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          Administrador
        </span>
      );
    } else if (profile.is_worker_group) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
          Trabajador
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
        Otro
      </span>
    );
  };

  // Mostrar loading
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Mostrar estado vacío
  if (!loading && data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Perfiles (Grupos)</h3>
          <span className="text-sm text-gray-500">{totalItems} {totalItems === 1 ? 'perfil' : 'perfiles'}</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuarios</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permisos</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((g) => (
              <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{g.name || g.nombre}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{g.users_count ?? g.usuarios_count ?? 0}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{g.permissions_count ?? (g.permissions?.length || 0)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => onView?.(g)} className="text-gray-400 hover:text-blue-600" title="Ver">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                    <button onClick={() => onEdit?.(g)} className="text-gray-400 hover:text-yellow-600" title="Editar">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => onDelete?.(g)} className="text-gray-400 hover:text-red-600" title="Eliminar" disabled={(g.users_count ?? 0) > 0}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

ProfileTableView.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
  totalItems: PropTypes.number,
  onEdit: PropTypes.func,
  onView: PropTypes.func,
  onDelete: PropTypes.func,
  onCreateNew: PropTypes.func
};

export default ProfileTableView;
 