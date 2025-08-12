/**
 * Componente Header refactorizado
 * Usa hooks especializados y componentes separados
 */

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { useTheme } from '../../hooks/useTheme';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';

const Header = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Usar hooks especializados
  const { user, logout } = useAuth();
  const { breadcrumbs, shouldShow: shouldShowBreadcrumbs } = useBreadcrumbs();
  const { isDarkMode, toggleTheme } = useTheme();
  


  const [showUserMenu, setShowUserMenu] = useState(false);

  // Funciones de control de menús
  const toggleUserMenu = useCallback(() => {
    setShowUserMenu(prev => !prev);
  }, []);

  const closeUserMenu = useCallback(() => {
    setShowUserMenu(false);
  }, []);

  // Función para cerrar sesión
  const handleLogout = useCallback(async () => {
    if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
      await logout();
    }
  }, [logout]);

  // Funciones de utilidad para el usuario
  const getUserInitials = useCallback(() => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'A';
  }, [user]);

  const getDisplayName = useCallback(() => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.username) {
      return user.username;
    }
    return 'Admin';
  }, [user]);

  return (
    <>
    <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 h-16 flex items-center justify-between px-5 transition-colors">
      {/* Botón de menú móvil */}
      <button 
        className="md:hidden p-2 rounded-lg text-[#2D728F] hover:bg-[#2D728F]/10 dark:text-[#83b7cc] dark:hover:bg-[#2D728F]/20 transition-colors"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>

      {/* Título de la página actual (solo móvil) */}
      <div className="md:hidden font-semibold text-[#2D728F] dark:text-white">
        Panel AquanQ
      </div>

      {/* Barra de búsqueda usando componente separado */}
      <SearchBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Acciones del header */}
      <div className="flex items-center space-x-5">
        {/* Toggle de tema usando componente separado */}
        <ThemeToggle 
          isDarkMode={isDarkMode}
          onToggle={toggleTheme}
        />



        {/* Perfil de usuario con menú desplegable */}
        <div className="relative">
          <button
            onClick={toggleUserMenu}
            className="flex items-center space-x-2 hover:bg-[#2D728F]/10 dark:hover:bg-[#2D728F]/20 p-2 rounded-lg transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#2D728F] to-[#235a71] flex items-center justify-center text-white font-medium shadow-sm border border-white/20">
              {getUserInitials()}
            </div>
            <span className="ml-2 font-medium text-[#2D728F] dark:text-white hidden sm:inline-block">
              {getDisplayName()}
            </span>
          </button>

          <UserMenu
            user={user}
            showUserMenu={showUserMenu}
            onClose={closeUserMenu}
            onLogout={handleLogout}
            getUserInitials={getUserInitials}
            getDisplayName={getDisplayName}
          />
        </div>
      </div>
    </header>

      {/* Breadcrumbs dinámicos */}
      {breadcrumbs.subsection && (
        <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-8 py-4">
          <div className="ml-4">
            <nav className="flex items-center space-x-3 text-base">
              <span className="text-slate-500 dark:text-neutral-400 font-medium">{breadcrumbs.section}</span>
              <span className="text-slate-400 dark:text-neutral-500 text-lg">|</span>
              <span className="text-slate-900 dark:text-white font-semibold">{breadcrumbs.subsection}</span>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(Header); 