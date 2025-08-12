import React from 'react';
import PropTypes from 'prop-types';
import { DataViewSwitcher } from '../Common/DataView';
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
  onEdit,
  onDelete,
  onCreateFirst,
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

  // Estado sin notificaciones
  if (!notifications.length && !loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12a1 1 0 011-2h3a1 1 0 011 2v12z" />
            </svg>
          </div>
          <h3 className="text-[13px] font-semibold text-gray-900 mb-2">No hay notificaciones</h3>
          <p className="text-[13px] text-gray-600 mb-4">
            Comienza creando tu primera notificación o enviando un mensaje broadcast.
          </p>
          <button
            onClick={onCreateFirst}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2D728F] text-white text-[13px] font-medium rounded-lg hover:bg-[#2D728F]/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear primera notificación
          </button>
        </div>
      </div>
    );
  }

  // Preparar datos para DataViewSwitcher
  const processedNotifications = notifications.map(notification => ({
    ...notification,
    // Campos adicionales para compatibilidad con DataViewSwitcher
    title: notification.titulo,
    description: notification.mensaje,
    status: notification.destinatario ? 'Individual' : 'Broadcast',
    date: notification.fecha_creacion || notification.created_at,
    
    // Información adicional
    recipient: notification.destinatario ? 
      `${notification.destinatario.first_name} ${notification.destinatario.last_name}`.trim() || 
      notification.destinatario.username : 'Todos',
    
    tipo_display: notification.tipo === 'individual' ? 'Individual' :
                  notification.tipo === 'broadcast' ? 'Broadcast' :
                  notification.tipo === 'evento' ? 'Evento' : 'General',
                  
    evento_title: notification.evento?.titulo || null
  }));

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <DataViewSwitcher
        data={processedNotifications}
        itemType="notification"
        loading={loading}
        onEdit={onEdit}
        onDelete={onDelete}
        emptyMessage="No se encontraron notificaciones"
        emptyDescription="Intenta ajustar los filtros o crear una nueva notificación"
      />
      
      {loading && notifications.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#2D728F]"></div>
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
      destinatario: PropTypes.object,
      tipo: PropTypes.string,
      fecha_creacion: PropTypes.string,
      created_at: PropTypes.string,
      evento: PropTypes.object
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
  totalItems: PropTypes.number,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onCreateFirst: PropTypes.func,
  onRetry: PropTypes.func
};

export default NotificationList;
