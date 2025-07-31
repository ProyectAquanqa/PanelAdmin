/**
 * Componente de botón de notificaciones
 * Muestra el botón con contador de notificaciones no leídas
 */

import React from 'react';
import PropTypes from 'prop-types';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';

/**
 * Componente de botón de notificaciones
 */
const NotificationButton = ({ 
  unreadCount, 
  onClick, 
  className = "" 
}) => {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`p-2 rounded-full hover:bg-[#2D728F]/10 dark:hover:bg-[#2D728F]/20 transition-colors ${className}`}
        aria-label="Ver notificaciones"
        title={`${unreadCount > 0 ? `${unreadCount} notificaciones no leídas` : 'Ver notificaciones'}`}
      >
        {unreadCount > 0 ? (
          <BellIconSolid className="w-5 h-5 text-[#2D728F]" />
        ) : (
          <BellIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

NotificationButton.propTypes = {
  unreadCount: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default React.memo(NotificationButton);