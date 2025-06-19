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

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
        <div className="w-full max-w-lg lg:max-w-xs">
          <label htmlFor="search" className="sr-only">Buscar</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="search"
              name="search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Buscar"
              type="search"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Botón de tema */}
        <button
          onClick={toggleTheme}
          className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {theme === 'dark' ? (
            <SunIcon className="h-6 w-6" aria-hidden="true" />
          ) : (
            <MoonIcon className="h-6 w-6" aria-hidden="true" />
          )}
        </button>

        {/* Menú de notificaciones */}
        <Menu as="div" className="relative">
          <div>
            <Menu.Button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span className="sr-only">Ver notificaciones</span>
              <div className="relative">
                <BellIcon className="h-6 w-6" aria-hidden="true" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">
                  {notifications.length}
                </span>
              </div>
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="px-4 py-2 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Notificaciones</h3>
              </div>
              {notifications.map((notification) => (
                <Menu.Item key={notification.id}>
                  {({ active }) => (
                    <a
                      href="#"
                      className={classNames(
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-3'
                      )}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                            <BellIcon className="h-5 w-5 text-white" aria-hidden="true" />
                          </div>
                        </div>
                        <div className="ml-3 w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">{notification.text}</p>
                          <p className="mt-1 text-sm text-gray-500">{notification.time}</p>
                        </div>
                      </div>
                    </a>
                  )}
                </Menu.Item>
              ))}
              <div className="px-4 py-2 border-t border-gray-200">
                <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Ver todas las notificaciones
                </a>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>

        {/* Menú de perfil */}
        <Menu as="div" className="relative">
          <div>
            <Menu.Button className="max-w-xs bg-white rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span className="sr-only">Abrir menú de usuario</span>
              <img
                className="h-8 w-8 rounded-full"
                src={`https://ui-avatars.com/api/?name=${user?.name || user?.email || 'Usuario'}&background=random`}
                alt=""
              />
              <span className="hidden md:flex ml-2 items-center">
                <span className="text-sm font-medium text-gray-700 mr-1">
                  {user?.name || user?.email || 'Usuario'}
                </span>
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              </span>
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                  >
                    Tu Perfil
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                  >
                    Configuración
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={logout}
                    className={classNames(active ? 'bg-gray-100' : '', 'w-full text-left block px-4 py-2 text-sm text-gray-700')}
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