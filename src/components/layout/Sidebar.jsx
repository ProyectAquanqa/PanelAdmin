import { NavLink } from 'react-router-dom';
import { navigationLinks } from '../../config/navigation';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

export default function Sidebar({ mobile = false }) {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  
  const isDark = theme === 'dark';

  return (
    <div className={`h-full flex flex-col w-64 ${isDark ? 'bg-neutral-900' : 'bg-neutral-800'}`}>
      <div className="flex-1 flex flex-col min-h-0">
        {/* Logo y título */}
        <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-neutral-700">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center"
          >
            <div className="h-8 w-8 bg-primary-500 rounded-md flex items-center justify-center">
              <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 5.5h-15v12h15v-12z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.5 9.5h5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.5 13.5h5" />
              </svg>
            </div>
            <h1 className="ml-3 text-lg font-semibold tracking-tight text-white">Hospital Admin</h1>
          </motion.div>
        </div>
        
        {/* Navegación */}
        <div className="mt-5 flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-3 py-2 space-y-1">
            {navigationLinks.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-900/50 text-white'
                      : 'text-neutral-300 hover:bg-neutral-700/50 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive ? 'text-primary-400' : 'text-neutral-400 group-hover:text-neutral-300'
                      }`}
                      aria-hidden="true"
                    />
                    <span>{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute left-0 w-1 h-8 bg-primary-500 rounded-r-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        
        {/* Información del usuario */}
        <div className="flex-shrink-0 flex border-t border-neutral-700 p-4">
          <div className="flex-shrink-0 w-full group">
            <div className="flex items-center">
              <div className="relative">
                <img
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-neutral-700"
                  src={`https://ui-avatars.com/api/?name=${user?.name || user?.email || 'Usuario'}&background=6366f1&color=fff`}
                  alt=""
                />
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-1 ring-neutral-700"></span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white truncate max-w-[150px]">
                  {user?.name || user?.email || 'Usuario'}
                </p>
                <p className="text-xs font-medium text-neutral-400 group-hover:text-neutral-300">
                  {user?.role || 'Administrador'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-3 w-full text-left px-2 py-1.5 text-xs rounded-md text-neutral-400 hover:text-white hover:bg-neutral-700/50 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
        
        {/* Footer con versión */}
        <div className="flex-shrink-0 border-t border-neutral-700 p-3">
          <div className="flex-shrink-0 w-full">
            <p className="text-xs text-neutral-500 text-center">
              v1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 