import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { 
  ChevronDownIcon, 
  BellIcon, 
  MoonIcon, 
  SunIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const isDark = theme === 'dark';

  // Notificaciones de ejemplo
  const notifications = [
    { id: 1, text: 'Nueva cita programada', time: 'Hace 5 min' },
    { id: 2, text: 'Recordatorio: Reunión de personal', time: 'Hace 1 hora' },
    { id: 3, text: 'Actualización del sistema completada', time: 'Hace 3 horas' },
  ];

  return (
    <div className="flex-1 flex justify-between items-center px-4">
      {/* Barra de búsqueda */}
      <div className="flex-1 flex items-center">
        <div className="w-full max-w-lg lg:max-w-xs relative">
          <label htmlFor="search" className="sr-only">Buscar</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className={`h-4 w-4 ${isDark ? 'text-neutral-400' : 'text-neutral-400'}`} aria-hidden="true" />
            </div>
            <input
              id="search"
              name="search"
              className={`block w-full pl-10 pr-3 py-2 border ${
                isDark 
                  ? 'border-neutral-700 bg-neutral-800 text-white placeholder-neutral-400 focus:border-primary-500' 
                  : 'border-neutral-200 bg-neutral-50 text-neutral-900 placeholder-neutral-500 focus:border-primary-500'
              } rounded-lg text-sm leading-4 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors`}
              placeholder="Buscar..."
              type="search"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Botón de tema */}
        <button
          onClick={toggleTheme}
          className={`p-1.5 rounded-lg ${
            isDark 
              ? 'text-neutral-400 hover:text-white hover:bg-neutral-700' 
              : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
          } focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors`}
        >
          {isDark ? (
            <SunIcon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <MoonIcon className="h-5 w-5" aria-hidden="true" />
          )}
        </button>

        {/* Menú de notificaciones */}
        <Menu as="div" className="relative">
          <Menu.Button 
            className={`p-1.5 rounded-lg ${
              isDark 
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-700' 
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
            } focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors`}
          >
            <span className="sr-only">Ver notificaciones</span>
            <div className="relative">
              <BellIcon className="h-5 w-5" aria-hidden="true" />
              {notifications.length > 0 && (
                <motion.span 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`absolute -top-1 -right-1 h-4 w-4 rounded-full ${
                    isDark ? 'bg-primary-500' : 'bg-primary-500'
                  } flex items-center justify-center text-[10px] font-medium text-white`}
                >
                  {notifications.length}
                </motion.span>
              )}
            </div>
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items 
              className={`origin-top-right absolute right-0 mt-2 w-80 rounded-lg shadow-lg py-1 ${
                isDark ? 'bg-neutral-800 ring-1 ring-neutral-700' : 'bg-white ring-1 ring-black ring-opacity-5'
              } focus:outline-none z-10 overflow-hidden`}
            >
              <div className={`px-4 py-2 border-b ${isDark ? 'border-neutral-700' : 'border-neutral-200'}`}>
                <h3 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>Notificaciones</h3>
              </div>
              <div className="max-h-[280px] overflow-y-auto">
                {notifications.map((notification) => (
                  <Menu.Item key={notification.id}>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active 
                            ? isDark ? 'bg-neutral-700' : 'bg-neutral-50' 
                            : '',
                          'block px-4 py-3'
                        )}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                              <BellIcon className={`h-4 w-4 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} aria-hidden="true" />
                            </div>
                          </div>
                          <div className="ml-3 w-0 flex-1">
                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>{notification.text}</p>
                            <p className={`mt-1 text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>{notification.time}</p>
                          </div>
                        </div>
                      </a>
                    )}
                  </Menu.Item>
                ))}
              </div>
              <div className={`px-4 py-2 border-t ${isDark ? 'border-neutral-700' : 'border-neutral-200'}`}>
                <a href="#" className="text-xs font-medium text-primary-600 hover:text-primary-500">
                  Ver todas las notificaciones
                </a>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>

        {/* Menú de perfil */}
        <Menu as="div" className="relative ml-2">
          <Menu.Button className={`flex items-center max-w-xs rounded-lg ${
            isDark ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100'
          } py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500`}>
            <span className="sr-only">Abrir menú de usuario</span>
            <img
              className="h-7 w-7 rounded-full ring-2 ring-primary-500"
              src={`https://ui-avatars.com/api/?name=${user?.name || user?.email || 'Usuario'}&background=6366f1&color=fff`}
              alt=""
            />
            <span className="hidden md:flex ml-2 items-center">
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-neutral-700'} mr-1 max-w-[120px] truncate`}>
                {user?.name || user?.email || 'Usuario'}
              </span>
              <ChevronDownIcon className={`h-4 w-4 ${isDark ? 'text-neutral-400' : 'text-neutral-400'}`} />
            </span>
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className={`origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 ${
              isDark ? 'bg-neutral-800 ring-1 ring-neutral-700' : 'bg-white ring-1 ring-black ring-opacity-5'
            } focus:outline-none z-10`}>
              <div className={`px-4 py-2 border-b ${isDark ? 'border-neutral-700' : 'border-neutral-200'}`}>
                <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Conectado como</p>
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-neutral-900'} truncate`}>
                  {user?.email || 'usuario@hospital.com'}
                </p>
              </div>
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active 
                        ? isDark ? 'bg-neutral-700' : 'bg-neutral-50' 
                        : '',
                      'block px-4 py-2 text-sm', 
                      isDark ? 'text-neutral-100' : 'text-neutral-700'
                    )}
                  >
                    Tu Perfil
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active 
                        ? isDark ? 'bg-neutral-700' : 'bg-neutral-50' 
                        : '',
                      'block px-4 py-2 text-sm', 
                      isDark ? 'text-neutral-100' : 'text-neutral-700'
                    )}
                  >
                    Configuración
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={logout}
                    className={classNames(
                      active 
                        ? isDark ? 'bg-neutral-700' : 'bg-neutral-50' 
                        : '',
                      'w-full text-left block px-4 py-2 text-sm', 
                      isDark ? 'text-neutral-100' : 'text-neutral-700'
                    )}
                  >
                    Cerrar Sesión
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
} 