import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

// 👥 Páginas del módulo de Usuarios
const Users = lazy(() => import('../pages/Users/Users'));
const UserImport = lazy(() => import('../pages/Users/UserImport'));

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

// ✅ Componente para verificar autenticación actualizado para usar el contexto real
const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
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
          <AdminLayout />
        </RequireAuth>
      }>
        <Route index element={
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        } />
        
        {/* Eventos */}
        <Route path="eventos" element={<Navigate to="/eventos/gestion" replace />} />
        <Route path="eventos/gestion" element={<TemporaryPage title="Gestión de Eventos" />} />
        <Route path="eventos/categorias" element={<TemporaryPage title="Categorías de Eventos" />} />
        <Route path="eventos/valores" element={<TemporaryPage title="Valores" />} />
        
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
            <Users />
          </Suspense>
        } />
        <Route path="usuarios/importar" element={
          <Suspense fallback={<LoadingFallback />}>
            <UserImport />
          </Suspense>
        } />
        <Route path="usuarios/perfiles" element={<TemporaryPage title="Perfiles de Usuario" />} />
        
        {/* Notificaciones */}
        <Route path="notificaciones" element={<Navigate to="/notificaciones/historial" replace />} />
        <Route path="notificaciones/historial" element={<TemporaryPage title="Historial de Notificaciones" />} />
        <Route path="notificaciones/dispositivos" element={<TemporaryPage title="Dispositivos Registrados" />} />
        
        {/* Documentación */}
        <Route path="documentacion" element={<TemporaryPage title="Documentación" />} />
        
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