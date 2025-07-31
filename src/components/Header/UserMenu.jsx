/**
 * Componente de menú de usuario
 * Muestra información del usuario y opciones de cuenta
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

/**
 * Componente de menú desplegable del usuario
 */
const UserMenu = ({ 
  user, 
  showUserMenu, 
  onClose, 
  onLogout,
  getUserInitials,
  getDisplayName 
}) => {
  if (!showUserMenu) return null;

  return (
    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-800 rounded-lg shadow-lg 
                  border border-neutral-200 dark:border-neutral-700 z-10 animate-fade-in">
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
        <p className="font-medium text-neutral-900 dark:text-white">
          {getDisplayName()}
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {user?.email || 'Administrador'}
        </p>
      </div>
      
      <div className="py-1">
        <button
          onClick={onClose}
          className="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
        >
          Mi Perfil
        </button>
        <button
          onClick={onClose}
          className="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
        >
          Configuración
        </button>
        <hr className="border-neutral-200 dark:border-neutral-700 my-1" />
        <button
          onClick={onLogout}
          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

UserMenu.propTypes = {
  user: PropTypes.object,
  showUserMenu: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  getUserInitials: PropTypes.func.isRequired,
  getDisplayName: PropTypes.func.isRequired,
};

export default React.memo(UserMenu);