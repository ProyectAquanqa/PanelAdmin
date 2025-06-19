import { NavLink } from 'react-router-dom';
import { navigationLinks } from '../../config/navigation';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ mobile = false }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const isDark = theme === 'dark';
  
  return (
    <div className={`${mobile ? 'h-full' : 'h-full'} flex flex-col w-64`}>
      <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
        {/* Logo y título */}
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
          <div className="flex items-center">
            <img
              className="h-8 w-auto"
              src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg"
              alt="Hospital"
            />

            
            <h1 className="ml-3 text-xl font-bold text-white">Hospital Admin</h1>
          </div>
        </div>
        
        {/* Información del usuario */}
        <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div>
                <img
                  className="inline-block h-9 w-9 rounded-full"
                  src={`https://ui-avatars.com/api/?name=${user?.name || user?.email || 'Usuario'}&background=random`}
                  alt=""
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {user?.name || user?.email || 'Usuario'}
                </p>
                <p className="text-xs font-medium text-gray-300 group-hover:text-gray-200">
                  Administrador
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navegación */}
        <div className="mt-2 flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigationLinks.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <item.icon
                  className="mr-3 flex-shrink-0 h-6 w-6"
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
        
        {/* Footer con versión */}
        <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
          <div className="flex-shrink-0 w-full">
            <p className="text-xs text-gray-400">
              Hospital Admin v1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 