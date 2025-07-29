import React, { useState, useCallback } from 'react';
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  SunIcon,
  MoonIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

const NotificationItem = React.memo(({ notification }) => {
  return (
    <li 
      className={`p-3 border-b border-neutral-200 dark:border-neutral-700 last:border-b-0
                hover:bg-neutral-50 dark:hover:bg-neutral-750 cursor-pointer transition-colors
                ${notification.read ? '' : 'bg-[#2D728F]/10 dark:bg-[#2D728F]/20'}`}
    >
      <div className="flex flex-col">
        <div className="flex justify-between">
          <span className={`font-medium ${notification.read ? 'text-neutral-800 dark:text-neutral-200' : 'text-[#2D728F] dark:text-[#83b7cc]'}`}>
            {notification.title}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {notification.time}
          </span>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
          {notification.message}
        </p>
      </div>
    </li>
  );
});

const Header = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  
  // ✅ Usar el contexto de autenticación
  const { user, logout } = useAuth();

  // Función para obtener breadcrumbs dinámicos según la ruta
  const getBreadcrumbs = () => {
    const path = location.pathname;
    
    // Dashboard principal
    if (path === '/') {
      return { section: 'Dashboard', subsection: null };
    }
    
    // CHATBOT - Todas las subcategorías
    if (path.startsWith('/chatbot')) {
      if (path.includes('/knowledge')) {
        return { section: 'Chatbot', subsection: 'Base de Conocimiento' };
      }
      if (path.includes('/categorias')) {
        return { section: 'Chatbot', subsection: 'Categorías' };
      }
      if (path.includes('/historial')) {
        return { section: 'Chatbot', subsection: 'Historial de Conversaciones' };
      }
      return { section: 'Chatbot', subsection: 'Dashboard' };
    }
    
    // EVENTOS - Todas las subcategorías
    if (path.startsWith('/eventos')) {
      if (path.includes('/gestion')) {
        return { section: 'Eventos', subsection: 'Gestión de Eventos' };
      }
      if (path.includes('/categorias')) {
        return { section: 'Eventos', subsection: 'Categorías' };
      }
      if (path.includes('/valores')) {
        return { section: 'Eventos', subsection: 'Valores' };
      }
      return { section: 'Eventos', subsection: 'Gestión de Eventos' };
    }
    
    // USUARIOS - Todas las subcategorías
    if (path.startsWith('/usuarios')) {
      if (path.includes('/gestion')) {
        return { section: 'Usuarios', subsection: 'Gestión de Usuarios' };
      }
      if (path.includes('/perfiles')) {
        return { section: 'Usuarios', subsection: 'Perfiles' };
      }
      return { section: 'Usuarios', subsection: 'Gestión de Usuarios' };
    }
    
    // NOTIFICACIONES - Todas las subcategorías
    if (path.startsWith('/notificaciones')) {
      if (path.includes('/historial')) {
        return { section: 'Notificaciones', subsection: 'Historial de Notificaciones' };
      }
      if (path.includes('/dispositivos')) {
        return { section: 'Notificaciones', subsection: 'Dispositivos Registrados' };
      }
      return { section: 'Notificaciones', subsection: 'Historial de Notificaciones' };
    }
    
    // DOCUMENTACIÓN
    if (path.startsWith('/documentacion')) {
      return { section: 'Documentación', subsection: null };
    }
    
    // CONFIGURACIÓN - Todas las subcategorías
    if (path.startsWith('/configuracion')) {
      if (path.includes('/general')) {
        return { section: 'Configuración', subsection: 'General' };
      }
      if (path.includes('/api')) {
        return { section: 'Configuración', subsection: 'API' };
      }
      return { section: 'Configuración', subsection: 'General' };
    }
    
    // PERMISOS
    if (path.startsWith('/permisos')) {
      return { section: 'Permisos', subsection: null };
    }
    
    // Fallback
    return { section: 'Dashboard', subsection: null };
  };
  
  // Notificaciones de ejemplo
  const notifications = [
    {
      id: 1,
      title: 'Nuevo evento creado',
      message: 'El evento "Reunión Anual" ha sido creado exitosamente.',
      time: '5 min',
      read: false,
    },
    {
      id: 2,
      title: 'Usuario registrado',
      message: 'Un nuevo usuario se ha registrado en el sistema.',
      time: '1 hora',
      read: true,
    },
    {
      id: 3,
      title: 'Actualización completada',
      message: 'La base de conocimiento del chatbot ha sido actualizada.',
      time: '2 horas',
      read: true,
    },
  ];

  // Contador de notificaciones no leídas
  const unreadCount = notifications.filter(notification => !notification.read).length;

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      document.documentElement.classList.toggle('dark', newMode);
      localStorage.theme = newMode ? 'dark' : 'light';
      return newMode;
    });
  }, []);

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  const toggleUserMenu = useCallback(() => {
    setShowUserMenu(prev => !prev);
  }, []);

  // ✅ Función para cerrar sesión
  const handleLogout = useCallback(async () => {
    if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
      await logout();
    }
  }, [logout]);

  // Obtener iniciales del usuario
  const getUserInitials = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'A';
  };

  // Obtener nombre para mostrar
  const getDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.username) {
      return user.username;
    }
    return 'Admin';
  };

  const breadcrumbs = getBreadcrumbs();

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

      {/* Buscador - Oculto en móvil */}
      <div className="hidden md:block flex-1 max-w-xl mx-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-neutral-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg 
                     bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-[#2D728F]/70 transition-colors"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Acciones del header */}
      <div className="flex items-center space-x-5">
        {/* Botón de modo oscuro/claro */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-[#2D728F]/10 dark:hover:bg-[#2D728F]/20 transition-colors"
          aria-label={isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
        >
          {isDarkMode ? (
            <SunIcon className="w-5 h-5 text-yellow-500" />
          ) : (
            <MoonIcon className="w-5 h-5 text-[#2D728F]" />
          )}
        </button>

        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className="p-2 rounded-full hover:bg-[#2D728F]/10 dark:hover:bg-[#2D728F]/20 transition-colors"
            aria-label="Ver notificaciones"
          >
            {unreadCount > 0 ? (
              <BellIconSolid className="w-5 h-5 text-[#2D728F]" />
            ) : (
              <BellIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
            )}
            
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown de notificaciones */}
          {showNotifications && (
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
          )}
        </div>

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

          {/* Menú desplegable del usuario */}
          {showUserMenu && (
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
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  Mi Perfil
                </button>
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  Configuración
                </button>
                <hr className="border-neutral-200 dark:border-neutral-700 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
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