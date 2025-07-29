import React, { useMemo } from 'react';
import { 
  UsersIcon, 
  CalendarIcon, 
  BellIcon, 
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';

// Componente optimizado para tarjetas de estadísticas
const StatCard = React.memo(({ stat }) => {
  const { title, value, change, isPositive, icon, color } = stat;
  
  return (
    <div 
      className="bg-white dark:bg-neutral-800 rounded-lg shadow-soft p-6 transition-all hover:shadow-lg border border-neutral-200 dark:border-neutral-700"
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20 text-${color}-500 dark:text-${color}-400 mr-4`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</h3>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-neutral-900 dark:text-white">{value}</p>
            <p className={`ml-2 text-sm font-medium ${
              isPositive 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {change}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

// Componente optimizado para la tabla de eventos
const EventsTable = React.memo(({ events }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
        <thead className="bg-neutral-50 dark:bg-neutral-750">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Título
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Fecha
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Categoría
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Estado
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
          {events.map((event) => (
            <tr key={event.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-neutral-900 dark:text-white">{event.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-neutral-500 dark:text-neutral-400">{event.date}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-neutral-500 dark:text-neutral-400">{event.category}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${event.status === 'Activo' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'}`}>
                  {event.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3">
                  Editar
                </button>
                <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

// Componente optimizado para acciones rápidas
const QuickActions = React.memo(() => {
  return (
    <div className="space-y-3">
      <button className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
        <span className="font-medium">Crear Evento</span>
        <CalendarIcon className="w-5 h-5" />
      </button>
      <button className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
        <span className="font-medium">Enviar Notificación</span>
        <BellIcon className="w-5 h-5" />
      </button>
      <button className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-650 transition-colors">
        <span className="font-medium">Añadir Usuario</span>
        <UsersIcon className="w-5 h-5" />
      </button>
      <button className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-650 transition-colors">
        <span className="font-medium">Actualizar Chatbot</span>
        <ChatBubbleLeftRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
});

const Dashboard = () => {
  // Datos de ejemplo para las tarjetas de estadísticas - memoizados para evitar recreaciones
  const stats = useMemo(() => [
    {
      title: 'Usuarios Activos',
      value: '1,254',
      change: '+12%',
      isPositive: true,
      icon: <UsersIcon className="w-6 h-6" />,
      color: 'blue',
    },
    {
      title: 'Eventos Creados',
      value: '42',
      change: '+8%',
      isPositive: true,
      icon: <CalendarIcon className="w-6 h-6" />,
      color: 'blue',
    },
    {
      title: 'Notificaciones Enviadas',
      value: '2,543',
      change: '+25%',
      isPositive: true,
      icon: <BellIcon className="w-6 h-6" />,
      color: 'blue',
    },
    {
      title: 'Consultas al Chatbot',
      value: '873',
      change: '-3%',
      isPositive: false,
      icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
      color: 'blue',
    },
  ], []);

  // Datos de ejemplo para la tabla de eventos recientes - memoizados
  const recentEvents = useMemo(() => [
    {
      id: 1,
      title: 'Reunión Anual',
      date: '15/06/2023',
      status: 'Activo',
      category: 'Reunión',
    },
    {
      id: 2,
      title: 'Capacitación Técnica',
      date: '22/06/2023',
      status: 'Pendiente',
      category: 'Capacitación',
    },
    {
      id: 3,
      title: 'Lanzamiento de Producto',
      date: '30/06/2023',
      status: 'Activo',
      category: 'Evento',
    },
    {
      id: 4,
      title: 'Webinar: Nuevas Tecnologías',
      date: '05/07/2023',
      status: 'Pendiente',
      category: 'Webinar',
    },
  ], []);

  return (
    <div className="space-y-6">
      {/* Título de la página */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Bienvenido al panel de administración de AquanQ
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
            Generar Reporte
          </button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      {/* Gráficos y tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico principal (simulado) */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-800 rounded-lg shadow-soft p-6 border border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Actividad del Usuario</h2>
          <div className="h-64 flex items-center justify-center bg-neutral-50 dark:bg-neutral-750 rounded-lg">
            <p className="text-neutral-500 dark:text-neutral-400">Gráfico de actividad (simulado)</p>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">Últimos 30 días</span>
            <div className="space-x-2">
              <button className="text-blue-600 dark:text-blue-400 hover:underline">Diario</button>
              <button className="text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400">Semanal</button>
              <button className="text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400">Mensual</button>
            </div>
          </div>
        </div>

        {/* Tarjeta de acciones rápidas */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-soft p-6 border border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Acciones Rápidas</h2>
          <QuickActions />
        </div>
      </div>

      {/* Tabla de eventos recientes */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-soft overflow-hidden border border-neutral-200 dark:border-neutral-700">
        <div className="p-6">
          <h2 className="text-lg font-medium text-neutral-900 dark:text-white">Eventos Recientes</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Listado de los últimos eventos creados en el sistema
          </p>
        </div>
        
        <EventsTable events={recentEvents} />
        
        <div className="bg-neutral-50 dark:bg-neutral-750 px-6 py-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              Mostrando <span className="font-medium">4</span> de <span className="font-medium">20</span> eventos
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 rounded border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                Anterior
              </button>
              <button className="px-3 py-1 rounded border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Exportar como componente memorizado para evitar rerenderizados innecesarios
export default React.memo(Dashboard); 