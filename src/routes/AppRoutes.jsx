import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserPermissions } from '../services/permissionService';
import AdminLayout from '../components/Layout/AdminLayout';

// Carga perezosa de componentes para mejorar el rendimiento
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const Login = lazy(() => import('../pages/Auth/Login'));

// 🤖 Páginas del módulo Chatbot
const ChatbotDashboard = lazy(() => import('../pages/Chatbot/ChatbotDashboard'));
const Conversations = lazy(() => import('../pages/Chatbot/Conversations'));
const KnowledgeBase = lazy(() => import('../pages/Chatbot/KnowledgeBase'));
const Categories = lazy(() => import('../pages/Chatbot/Categories'));
const TestMode = lazy(() => import('../pages/Chatbot/TestMode'));

// 📅 Páginas del módulo de Eventos
const EventosGestion = lazy(() => import('../pages/Eventos/EventosGestion'));
const EventosCategorias = lazy(() => import('../pages/Eventos/EventosCategorias'));
const ComentariosGestion = lazy(() => import('../pages/Eventos/ComentariosGestion'));

// 👥 Páginas del módulo de Usuarios
const Users = lazy(() => import('../pages/Users/Users'));
const UserManagement = lazy(() => import('../pages/Users/UserManagement'));
const Areas = lazy(() => import('../pages/Users/Areas'));



// 🔐 Páginas del módulo de Perfiles
const ProfileManagement = lazy(() => import('../pages/Perfiles/ProfileManagement'));
const ProfileManagementNew = lazy(() => import('../pages/Perfiles/ProfileManagementNew'));

// 📱 Páginas del módulo de Notificaciones
const NotificationManagement = lazy(() => import('../pages/Notifications/NotificationManagement'));

// 📱 Páginas del módulo de Dispositivos
const DeviceManagement = lazy(() => import('../pages/Devices/DeviceManagement'));

// 🍽️ Páginas del módulo de Almuerzoss 
const AlmuerzosGestion = lazy(() => import('../pages/Almuerzos/AlmuerzosGestion'));


// Componente de carga
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Página de error 404
const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900 px-4 text-center">
    <h1 className="text-9xl font-bold text-blue-500">404</h1>
    <h2 className="text-4xl font-bold text-neutral-800 dark:text-white mt-4">Página no encontrada</h2>
    <p className="text-neutral-600 dark:text-neutral-300 mt-2 mb-6">
      Lo sentimos, la página que estás buscando no existe o ha sido movida.
    </p>
    <a 
      href="/"
      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
    >
      Volver al Dashboard
    </a>
  </div>
);

// Páginas temporales para las secciones principales
const TemporaryPage = ({ title }) => (
  <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-soft border border-neutral-200 dark:border-neutral-700">
    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">{title}</h1>
    <p className="text-neutral-600 dark:text-neutral-300">
      Esta sección está en desarrollo. Pronto estará disponible.
    </p>
  </div>
);

// ✅ Componente para verificar autenticación y acceso al panel admin
const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <LoadingFallback />;
  }
  
  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// ✅ Componente para verificar acceso al panel admin (usuarios administrativos)
const RequireAdminAccess = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <LoadingFallback />;
  }
  
  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Verificar si el usuario tiene acceso al panel admin
  const hasAdminAccess = () => {
    if (!user) return false;
    
    // Superusuarios y staff tienen acceso
    if (user.is_superuser || user.is_staff) return true;
    
    // Verificar grupos administrativos
    const userGroups = user.groups || [];
    const adminGroups = [
      'Administrador de Contenido',
      'Editor de Contenido', 
      'Gestor de Chatbot',
      'Admin',
      'Administrador'
    ];
    
    const hasAdminGroup = userGroups.some(group => {
      const groupName = typeof group === 'object' ? group.name : group;
      return adminGroups.includes(groupName);
    });
    
    if (hasAdminGroup) return true;
    
    // **NUEVA LÓGICA**: Verificar si tiene permisos asignados
    // Si no tiene ningún permiso, no puede acceder al panel admin
    const userPermissions = getUserPermissions() || [];
    
    if (userPermissions.length === 0) {
      return false; // Sin permisos = sin acceso al panel admin
    }
    
    // Permisos básicos que no otorgan acceso admin
    const basicPermissions = [
      'almuerzos.view_almuerzo', // Solo ver almuerzos
      'auth.view_user'  // Solo ver su propio perfil
    ];
    
    // Si solo tiene permisos básicos, no tiene acceso admin
    const hasOnlyBasicPerms = userPermissions.every(perm => basicPermissions.includes(perm));
    if (hasOnlyBasicPerms && userPermissions.length <= 2) {
      return false;
    }
    
    // Si tiene otros permisos, puede acceder al panel admin
    return true;
  };
  
  // Función para obtener el tipo de usuario basado en grupos
  const getTipoUsuario = () => {
    if (!user) return 'Sin definir';
    
    if (hasAdminAccess()) {
      return 'Administrativo';
    } else if (user.groups?.some(group => {
      const groupName = typeof group === 'object' ? group.name : group;
      return groupName === 'Trabajador';
    })) {
      return 'Trabajador';
    } else {
      return 'Sin definir';
    }
  };
  
  // Si es solo trabajador (sin acceso administrativo), mostrar página de acceso denegado
  if (!hasAdminAccess()) {
    return <WorkerAccessDenied />;
  }
  
  return children;
};

// Página de acceso denegado para trabajadores
const WorkerAccessDenied = () => {
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // En caso de error, redirigir al login anyway
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Acceso Restringido
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Este panel está reservado para usuarios administrativos.
          </p>
        </div>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Para usuarios trabajadores
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Utiliza la aplicación móvil de AquanQ para acceder a las funciones disponibles para tu perfil.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <div className="text-sm text-gray-600">
                <p className="font-medium">¿Necesitas acceso administrativo?</p>
                <p className="mt-1">Contacta con tu administrador de sistema para solicitar los permisos correspondientes.</p>
              </div>
            </div>
            
            <div className="pt-4">
              <button
                onClick={handleLogout}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={
        <Suspense fallback={<LoadingFallback />}>
          <Login />
        </Suspense>
      } />
      
      {/* Rutas protegidas dentro del layout de administración */}
      <Route path="/" element={
        <RequireAuth>
          <RequireAdminAccess>
            <AdminLayout />
          </RequireAdminAccess>
        </RequireAuth>
      }>
        <Route index element={
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        } />
        
        {/* 📅 Módulo Eventos */}
        <Route path="eventos" element={<Navigate to="/eventos/gestion" replace />} />
        <Route path="eventos/gestion" element={
          <Suspense fallback={<LoadingFallback />}>
            <EventosGestion />
          </Suspense>
        } />
        <Route path="eventos/categorias" element={
          <Suspense fallback={<LoadingFallback />}>
            <EventosCategorias />
          </Suspense>
        } />
        <Route path="eventos/comentarios" element={
          <Suspense fallback={<LoadingFallback />}>
            <ComentariosGestion />
          </Suspense>
        } />
        
        
        {/* 🤖 Módulo Chatbot - 4 submódulos según el prompt */}
        <Route path="chatbot" element={<Navigate to="/chatbot/dashboard" replace />} />
        <Route path="chatbot/dashboard" element={
          <Suspense fallback={<LoadingFallback />}>
            <ChatbotDashboard />
          </Suspense>
        } />
        <Route path="chatbot/conversations" element={
          <Suspense fallback={<LoadingFallback />}>
            <Conversations />
          </Suspense>
        } />
        <Route path="chatbot/historial" element={
          <Suspense fallback={<LoadingFallback />}>
            <Conversations />
          </Suspense>
        } />
        <Route path="chatbot/knowledge" element={
          <Suspense fallback={<LoadingFallback />}>
            <KnowledgeBase />
          </Suspense>
        } />
        <Route path="chatbot/categorias" element={
          <Suspense fallback={<LoadingFallback />}>
            <Categories />
          </Suspense>
        } />
        <Route path="chatbot/test" element={
          <Suspense fallback={<LoadingFallback />}>
            <TestMode />
          </Suspense>
        } />
        
        {/* Usuarios */}
        <Route path="usuarios" element={<Navigate to="/usuarios/gestion" replace />} />
        <Route path="usuarios/gestion" element={
          <Suspense fallback={<LoadingFallback />}>
            <UserManagement />
          </Suspense>
        } />

        <Route path="usuarios/perfiles" element={
          <Suspense fallback={<LoadingFallback />}>
            <ProfileManagementNew />
          </Suspense>
        } />

        <Route path="usuarios/areas" element={
          <Suspense fallback={<LoadingFallback />}>
            <Areas />
          </Suspense>
        } />

        
        {/* 📱 Rutas del módulo de Notificaciones */}
        <Route path="notificaciones" element={<Navigate to="/notificaciones/historial" replace />} />
        <Route path="notificaciones/historial" element={
          <Suspense fallback={<LoadingFallback />}>
            <NotificationManagement />
          </Suspense>
        } />
        <Route path="notificaciones/dispositivos" element={
          <Suspense fallback={<LoadingFallback />}>
            <DeviceManagement />
          </Suspense>
        } />
        
        {/* Almuerzos */}
        <Route path="almuerzos" element={
          <Suspense fallback={<LoadingFallback />}>
            <AlmuerzosGestion />
          </Suspense>
        } />
        
        {/* Configuración */}
        <Route path="configuracion" element={<Navigate to="/configuracion/general" replace />} />
        <Route path="configuracion/general" element={<TemporaryPage title="Configuración General" />} />
        <Route path="configuracion/api" element={<TemporaryPage title="Configuración de API" />} />
        
        {/* Permisos */}
        <Route path="permisos" element={<TemporaryPage title="Gestión de Permisos" />} />
        
        {/* Perfil de usuario */}
        <Route path="perfil" element={<TemporaryPage title="Mi Perfil" />} />
      </Route>
      
      {/* Ruta para páginas no encontradas */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Exportar como componente memorizado para evitar rerenderizados innecesarios
export default React.memo(AppRoutes); 