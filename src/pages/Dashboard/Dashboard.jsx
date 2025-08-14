import React, { useMemo } from 'react';
import { 
  UsersIcon, 
  CalendarIcon, 
  BellIcon, 
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ArrowPathIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../hooks/useDashboard';
import ChatbotStatsChart from '../../components/Dashboard/ChatbotStatsChart';

// Componente optimizado para tarjetas de estadísticas
const StatCard = React.memo(({ stat }) => {
  const { title, value, change, isPositive, loading } = stat;
  
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-soft p-6 border border-slate-200 dark:border-slate-700">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-24 mb-3"></div>
          <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded w-16 mb-2"></div>
          <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-20"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-soft p-6 transition-all hover:shadow-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600">
      <div>
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</h3>
        <div className="flex items-baseline">
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
          <p className={`ml-2 text-xs font-medium ${
            isPositive 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : 'text-slate-500 dark:text-slate-400'
          }`}>
            {change}
          </p>
        </div>
      </div>
    </div>
  );
});

// Componente optimizado para la tabla de eventos
const EventsTable = React.memo(({ events, loading }) => {
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg animate-pulse">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
              <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <CalendarIcon className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">No hay eventos recientes</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Los eventos creados aparecerán aquí.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div key={event.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{event.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {event.category} • {new Date(event.date).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              event.status === 'Activo' 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' 
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
            }`}>
              {event.status}
            </span>
            <button 
              onClick={() => navigate('/eventos')}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Ver
            </button>
          </div>
        </div>
      ))}
    </div>
  );
});

// Componente optimizado para acciones rápidas
const QuickActions = React.memo(() => {
  const navigate = useNavigate();
  
  const actions = [
    {
      label: 'Crear Evento',
      icon: <PlusIcon className="w-5 h-5" />,
      onClick: () => navigate('/eventos'),
      color: 'slate'
    },
    {
      label: 'Gestionar Perfiles',
      icon: <UsersIcon className="w-5 h-5" />,
      onClick: () => navigate('/perfiles'),
      color: 'slate'
    },
    {
      label: 'Ver Almuerzos',
      icon: <CalendarIcon className="w-5 h-5" />,
      onClick: () => navigate('/almuerzos'),
      color: 'slate'
    },
    {
      label: 'Chatbot IA',
      icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />,
      onClick: () => navigate('/chatbot'),
      color: 'slate'
    }
  ];
  
  return (
    <div className="space-y-2">
      {actions.map((action, index) => (
        <button 
          key={index}
          onClick={action.onClick}
          className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors group"
        >
          <span className="font-medium text-sm">{action.label}</span>
          <div className="group-hover:translate-x-1 transition-transform">
            {action.icon}
          </div>
        </button>
      ))}
    </div>
  );
});

const Dashboard = () => {
  const navigate = useNavigate();
  const { stats, recentEvents, dashboardData, loading, refreshData, isLoading, error } = useDashboard();
  
  // Función para manejar refresh manual
  const handleRefresh = async () => {
    await refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Título de la página */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Bienvenido al panel de administración de AquanQ
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-sm">Actualizar</span>
          </button>
          <button 
            onClick={() => navigate('/eventos')} 
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors"
          >
            Ver Reportes
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.id || index} stat={stat} />
        ))}
      </div>

      {/* Gráficos y tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de estadísticas del chatbot */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-soft p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-slate-900 dark:text-white">Estadísticas del Chatbot</h2>
            <div className="flex items-center space-x-2">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Últimos 7 días</span>
            </div>
          </div>
          <ChatbotStatsChart chatbotData={dashboardData.chatbot} loading={loading.chatbot} />
        </div>

        {/* Tarjeta de acciones rápidas */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-soft p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Acciones Rápidas</h2>
          <QuickActions />
        </div>
      </div>

      {/* Tabla de eventos recientes */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-soft border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">Eventos Recientes</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Últimos eventos creados en el sistema
              </p>
            </div>
            <button 
              onClick={() => navigate('/eventos')}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium"
            >
              Ver todos →
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <EventsTable events={recentEvents} loading={isLoading} />
        </div>
      </div>
    </div>
  );
};

// Exportar como componente memorizado para evitar rerenderizados innecesarios
export default React.memo(Dashboard); 