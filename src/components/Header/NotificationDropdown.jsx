/**
 * Componente de dropdown de notificaciones
 * Muestra lista de notificaciones con acciones
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Formatea una fecha a tiempo relativo
 */
const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Ahora';
  if (diffInMinutes < 60) return `${diffInMinutes} min`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} h`;
  return `${Math.floor(diffInMinutes / 1440)} d`;
};

/**
 * Componente de elemento de notificación
 */
const NotificationItem = React.memo(({ notification }) => {
  return (
    <li 
      className={`p-3 border-b border-neutral-200 dark:border-neutral-700 last:border-b-0
                hover:bg-neutral-50 dark:hover:bg-neutral-750 cursor-pointer transition-colors
                ${notification.leido === true ? '' : 'bg-[#2D728F]/10 dark:bg-[#2D728F]/20'}`}
    >
      <div className="flex flex-col">
        <div className="flex justify-between">
          <span className={`font-medium ${notification.leido === true ? 'text-neutral-800 dark:text-neutral-200' : 'text-[#2D728F] dark:text-[#83b7cc]'}`}>
            {notification.titulo}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {formatTimeAgo(notification.fecha_creacion || notification.created_at)}
          </span>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
          {notification.mensaje}
        </p>
      </div>
    </li>
  );
});

NotificationItem.displayName = 'NotificationItem';

/**
 * Componente principal del dropdown de notificaciones
 */
const NotificationDropdown = ({ 
  notifications, 
  unreadCount, 
  showNotifications, 
  onClose 
}) => {
  if (!showNotifications) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-800 rounded-lg shadow-lg 
                  border border-neutral-200 dark:border-neutral-700 z-10 animate-fade-in">
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
        <h3 className="font-medium text-neutral-900 dark:text-white">Notificaciones</h3>
      </div>
      <div className="max-h-96 overflow-y-auto scrollbar-thin">
        {notifications.length > 0 ? (
          <ul>
            {notifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
              />
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">
            No hay notificaciones
          </div>
        )}
      </div>
      {notifications.length > 0 && (
        <div className="p-2 border-t border-neutral-200 dark:border-neutral-700 text-center">
          <button className="text-sm text-[#2D728F] hover:text-[#1c5069] transition-colors">
            Ver todas las notificaciones
          </button>
        </div>
      )}
    </div>
  );
};

NotificationDropdown.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    titulo: PropTypes.string.isRequired,
    mensaje: PropTypes.string.isRequired,
    fecha_creacion: PropTypes.string,
    created_at: PropTypes.string,
    leido: PropTypes.bool,
  })).isRequired,
  unreadCount: PropTypes.number.isRequired,
  showNotifications: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default React.memo(NotificationDropdown);