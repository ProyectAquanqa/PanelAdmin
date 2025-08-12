import React from 'react';
import PropTypes from 'prop-types';
import NotificationTableView from './NotificationTableView';
import LoadingStates from './LoadingStates';

/**
 * Componente de lista de notificaciones
 * Sigue el patrón de KnowledgeList con adaptaciones para notificaciones
 */
const NotificationList = ({
  notifications = [],
  loading = false,
  error = null,
  totalItems = 0,
  onViewDetails,
  onRetry
}) => {
  // Estado de carga
  if (loading && !notifications.length) {
    return <LoadingStates.NotificationListLoading />;
  }

  // Estado de error
  if (error && !loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-[13px] font-semibold text-gray-900 mb-2">Error al cargar notificaciones</h3>
          <p className="text-[13px] text-gray-600 mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2D728F] text-white text-[13px] font-medium rounded-lg hover:bg-[#2D728F]/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Estado sin notificaciones - siguiendo el diseño de knowledge base
  if (!notifications.length && !loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-16 text-center">
          {/* Ilustración moderna con icono de campana */}
          <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5v-5zM9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No hay notificaciones registradas
          </h3>
          
          <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
            Comience creando notificaciones para mantener informados a los usuarios del sistema.
          </p>
          
          {/* Sin botón de acción - siguiendo el estilo de knowledge base */}
          
          {/* Elementos decorativos sutiles */}
          <div className="mt-12 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
            <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
            <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <NotificationTableView
        data={notifications}
        onViewDetails={onViewDetails}
      />
      
      {loading && notifications.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600"></div>
            <span className="ml-2 text-[13px] text-gray-600">Actualizando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

NotificationList.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      titulo: PropTypes.string.isRequired,
      mensaje: PropTypes.string.isRequired,
      fecha_creacion: PropTypes.string,
      created_at: PropTypes.string,
      evento: PropTypes.object,
      leida: PropTypes.bool,
      leido: PropTypes.bool
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
  totalItems: PropTypes.number,
  onViewDetails: PropTypes.func,
  onRetry: PropTypes.func
};

export default NotificationList;
