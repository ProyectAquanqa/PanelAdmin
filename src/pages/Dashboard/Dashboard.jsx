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
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-soft p-4 lg:p-6 border border-slate-200 dark:border-slate-700">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-24 mb-3"></div>
          <div className="h-6 sm:h-8 bg-slate-300 dark:bg-slate-600 rounded w-16 mb-2"></div>
          <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-20"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-soft p-4 lg:p-6 transition-all hover:shadow-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600">
      <div>
        <h3 className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 truncate">{title}</h3>
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
          <p className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
          <p className={`text-xs font-medium ${
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
          <div key={i} className="flex items-center justify-between p-3 lg:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg animate-pulse">
            <div className="flex-1 space-y-2 min-w-0">
              <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
              <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-16 flex-shrink-0"></div>
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
        <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 lg:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{event.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {event.category} • {new Date(event.date).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
              event.status === 'Activo' 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' 
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
            }`}>
              {event.status}
            </span>
            <button 
              onClick={() => navigate('/eventos')}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 text-xs sm:text-sm px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
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
      onClick: () => navigate('/usuarios/perfiles'),
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
      onClick: () => navigate('/chatbot/knowledge'),
      color: 'slate'
    }
  ];
  
  return (
    <div className="space-y-2 lg:space-y-3">
      {actions.map((action, index) => (
        <button 
          key={index}
          onClick={action.onClick}
          className="w-full flex items-center justify-between p-3 lg:p-4 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-all duration-200 group hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
        >
          <span className="font-medium text-sm lg:text-base truncate">{action.label}</span>
          <div className="group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2">
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

  return (
    <div className="space-y-6">
      {/* Título de la página - Responsive mejorado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white truncate">Dashboard</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Bienvenido al panel de administración de AquanQ
          </p>
        </div>

      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Tarjetas de estadísticas - Responsive optimizado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.id || index} stat={stat} />
        ))}
      </div>

      {/* Gráficos y tablas - Layout responsive mejorado */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Gráfico de estadísticas del chatbot */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-soft p-4 lg:p-6 border border-slate-200 dark:border-slate-700 order-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h2 className="text-base sm:text-lg font-medium text-slate-900 dark:text-white">Estadísticas del Chatbot</h2>
            <div className="flex items-center space-x-2">
              <ChatBubbleLeftRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 dark:text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Estadísticas del Chatbot</span>
            </div>
          </div>
          <ChatbotStatsChart chatbotData={dashboardData.chatbot} loading={loading.chatbot} />
        </div>

        {/* Tarjeta de acciones rápidas */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-soft p-4 lg:p-6 border border-slate-200 dark:border-slate-700 order-2 xl:order-none">
          <h2 className="text-base sm:text-lg font-medium text-slate-900 dark:text-white mb-4">Acciones Rápidas</h2>
          <QuickActions />
        </div>
      </div>

      {/* Tabla de eventos recientes - Responsive */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-soft border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-medium text-slate-900 dark:text-white">Eventos Recientes</h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Últimos eventos creados en el sistema
              </p>
            </div>
            <button 
              onClick={() => navigate('/eventos')}
              className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium whitespace-nowrap px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Ver todos →
            </button>
          </div>
        </div>
        
        <div className="p-4 lg:p-6">
          <EventsTable events={recentEvents} loading={isLoading} />
        </div>
      </div>
    </div>
  );
};

// Exportar como componente memorizado para evitar rerenderizados innecesarios
export default React.memo(Dashboard); 