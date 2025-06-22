import { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  CalendarIcon, 
  BanknotesIcon, 
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subDays, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getRecentActivity } from '../services/dashboardService';
import { getChartData } from '../services/dashboardService';

// Datos de fallback para cuando la API no responda
const fallbackData = {
  citasData: [
    { name: 'Lun', citas: 12 },
    { name: 'Mar', citas: 19 },
    { name: 'Mié', citas: 15 },
    { name: 'Jue', citas: 22 },
    { name: 'Vie', citas: 28 },
    { name: 'Sáb', citas: 14 },
    { name: 'Dom', citas: 8 },
  ],
  ingresosData: [
    { name: 'Ene', valor: 4000 },
    { name: 'Feb', valor: 3000 },
    { name: 'Mar', valor: 5000 },
    { name: 'Abr', valor: 4500 },
    { name: 'May', valor: 6000 },
    { name: 'Jun', valor: 5500 },
  ],
  especialidadesData: [
    { name: 'Cardiología', value: 35 },
    { name: 'Pediatría', value: 25 },
    { name: 'Dermatología', value: 18 },
    { name: 'Oftalmología', value: 15 },
    { name: 'Traumatología', value: 12 },
  ],
  actividadReciente: [
    {
      id: 1,
      type: 'cita',
      patient: 'María García',
      doctor: 'Dr. Rodríguez',
      time: '10:30 AM',
      status: 'completada'
    },
    {
      id: 2,
      type: 'pago',
      patient: 'Juan López',
      amount: '$120',
      time: '11:45 AM',
      status: 'procesado'
    },
    {
      id: 3,
      type: 'cita',
      patient: 'Carlos Mendoza',
      doctor: 'Dra. Sánchez',
      time: '1:15 PM',
      status: 'cancelada'
    },
    {
      id: 4,
      type: 'registro',
      patient: 'Ana Martínez',
      time: '2:30 PM',
      status: 'nuevo'
    },
    {
      id: 5,
      type: 'pago',
      patient: 'Roberto Díaz',
      amount: '$85',
      time: '3:20 PM',
      status: 'procesado'
    }
  ]
};

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

// Función auxiliar para formatear números con seguridad
const formatNumber = (value) => {
  if (value === undefined || value === null) return '0';
  return value.toLocaleString();
};

export default function DashboardPage() {
  const [currentDate] = useState(new Date());
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Consulta para obtener estadísticas del dashboard
  const { 
    data: statsData, 
    isLoading: statsLoading,
    error: statsError
  } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Consulta para obtener datos de gráfico de citas
  const { 
    data: citasChartData, 
    isLoading: citasLoading,
  } = useQuery({
    queryKey: ['chartData', 'citas'],
    queryFn: () => getChartData('citas'),
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Consulta para obtener datos de gráfico de ingresos
  const { 
    data: ingresosChartData, 
    isLoading: ingresosLoading,
  } = useQuery({
    queryKey: ['chartData', 'ingresos'],
    queryFn: () => getChartData('ingresos'),
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Consulta para obtener datos de gráfico de especialidades
  const { 
    data: especialidadesChartData, 
    isLoading: especialidadesLoading,
  } = useQuery({
    queryKey: ['chartData', 'especialidades'],
    queryFn: () => getChartData('especialidades'),
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Consulta para obtener actividad reciente
  const { 
    data: actividadData, 
    isLoading: actividadLoading,
  } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: getRecentActivity,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Datos procesados de citas por día
  const citasData = citasChartData?.data || fallbackData.citasData;
  const citasTotal = citasData.reduce((sum, item) => sum + (item.citas || 0), 0);
  
  // Datos procesados de ingresos
  const ingresosData = ingresosChartData?.data || fallbackData.ingresosData;
  const ingresoPromedio = ingresosData.length > 0 
    ? Math.round(ingresosData.reduce((sum, item) => sum + (item.valor || 0), 0) / ingresosData.length) 
    : 0;
  
  // Datos procesados de especialidades
  const especialidadesData = especialidadesChartData?.data || fallbackData.especialidadesData;
  
  // Datos de actividad reciente
  const actividadReciente = actividadData?.data || fallbackData.actividadReciente;

  // Tarjetas KPI con datos dinámicos
  const kpiCards = statsData ? [
    {
      title: 'Pacientes Totales',
      value: formatNumber(statsData.patients_count),
      icon: UsersIcon,
      change: `${statsData.patients_growth > 0 ? '+' : ''}${statsData.patients_growth}%`,
      trend: statsData.patients_growth >= 0 ? 'up' : 'down',
      color: 'bg-primary-500/10',
      iconColor: 'text-primary-500'
    },
    {
      title: 'Citas Hoy',
      value: formatNumber(statsData.appointments_today),
      icon: CalendarIcon,
      change: `${statsData.appointments_growth > 0 ? '+' : ''}${statsData.appointments_growth}%`,
      trend: statsData.appointments_growth >= 0 ? 'up' : 'down',
      color: 'bg-green-500/10',
      iconColor: 'text-green-500'
    },
    {
      title: 'Ingresos Mensuales',
      value: `$${formatNumber(statsData.monthly_revenue)}`,
      icon: BanknotesIcon,
      change: `${statsData.revenue_growth > 0 ? '+' : ''}${statsData.revenue_growth}%`,
      trend: statsData.revenue_growth >= 0 ? 'up' : 'down',
      color: 'bg-purple-500/10',
      iconColor: 'text-purple-500'
    },
    {
      title: 'Tiempo Promedio',
      value: `${statsData.avg_appointment_time || 0} min`,
      icon: ClockIcon,
      change: `${statsData.time_change > 0 ? '+' : ''}${statsData.time_change}%`,
      trend: statsData.time_change <= 0 ? 'up' : 'down', // Menos tiempo es mejor
      color: 'bg-orange-500/10',
      iconColor: 'text-orange-500'
    }
  ] : [
    {
      title: 'Pacientes Totales',
      value: '1,248',
      icon: UsersIcon,
      change: '+12%',
      trend: 'up',
      color: 'bg-primary-500/10',
      iconColor: 'text-primary-500'
    },
    {
      title: 'Citas Hoy',
      value: '42',
      icon: CalendarIcon,
      change: '+8%',
      trend: 'up',
      color: 'bg-green-500/10',
      iconColor: 'text-green-500'
    },
    {
      title: 'Ingresos Mensuales',
      value: '$24,500',
      icon: BanknotesIcon,
      change: '+15%',
      trend: 'up',
      color: 'bg-purple-500/10',
      iconColor: 'text-purple-500'
    },
    {
      title: 'Tiempo Promedio',
      value: '24 min',
      icon: ClockIcon,
      change: '-5%',
      trend: 'down',
      color: 'bg-orange-500/10',
      iconColor: 'text-orange-500'
    }
  ];

  const isLoading = statsLoading || citasLoading || ingresosLoading || especialidadesLoading || actividadLoading;

  return (
    <motion.div 
      className="space-y-6 pb-12"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Encabezado con fecha y bienvenida */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-center md:justify-between"
        variants={item}
      >
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>Dashboard Principal</h1>
          <p className={`mt-1 text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
            {format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="btn-primary">
            Generar Reporte
          </button>
        </div>
      </motion.div>
      
      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, index) => (
          <motion.div 
            key={index} 
            className="card overflow-visible"
            variants={item}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-lg ${card.color}`}>
                    <card.icon className={`w-5 h-5 ${card.iconColor}`} aria-hidden="true" />
                  </div>
                </div>
                <div className="flex-1 w-0 ml-5">
                  <dl>
                    <dt className={`text-sm font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-500'} truncate`}>{card.title}</dt>
                    <dd>
                      <div className={`text-lg font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {isLoading ? (
                          <div className="animate-pulse h-6 w-16 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                        ) : card.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className={`px-5 py-3 ${isDark ? 'bg-neutral-750' : 'bg-neutral-50'} rounded-b-xl`}>
              <div className="text-sm">
                <div className="flex items-center">
                  {card.trend === 'up' ? (
                    <ArrowUpIcon className="w-4 h-4 mr-1 text-green-500" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 mr-1 text-red-500" />
                  )}
                  <span 
                    className={`font-medium ${
                      card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {card.change}
                  </span>
                  <span className={`ml-2 ${isDark ? 'text-neutral-400' : 'text-neutral-500'} text-xs`}>vs. mes anterior</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Gráficos principales */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Gráfico de citas por día */}
        <motion.div className="card p-6" variants={item}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>Citas por día</h2>
              <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Última semana</p>
            </div>
            <div className="text-right">
              <div className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                {isLoading ? (
                  <div className="animate-pulse h-6 w-12 bg-neutral-200 dark:bg-neutral-700 rounded ml-auto"></div>
                ) : citasTotal}
              </div>
              <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Total</p>
            </div>
          </div>
          <div className="mt-6" style={{ height: 280 }}>
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-pulse w-full h-4/5 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={citasData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    vertical={false} 
                    stroke={isDark ? '#404040' : '#e5e7eb'} 
                  />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: isDark ? '#a3a3a3' : '#6b7280' }}
                    axisLine={{ stroke: isDark ? '#525252' : '#e5e7eb' }}
                    tickLine={{ stroke: isDark ? '#525252' : '#e5e7eb' }}
                  />
                  <YAxis 
                    tick={{ fill: isDark ? '#a3a3a3' : '#6b7280' }}
                    axisLine={{ stroke: isDark ? '#525252' : '#e5e7eb' }}
                    tickLine={{ stroke: isDark ? '#525252' : '#e5e7eb' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#262626' : 'white', 
                      border: 'none', 
                      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                      borderRadius: '0.375rem',
                      color: isDark ? '#f5f5f5' : '#171717',
                    }}
                  />
                  <Bar 
                    dataKey="citas" 
                    fill={isDark ? '#6366f1' : '#6366f1'} 
                    radius={[4, 4, 0, 0]} 
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
        
        {/* Gráfico de ingresos */}
        <motion.div className="card p-6" variants={item}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>Ingresos mensuales</h2>
              <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Últimos 6 meses</p>
            </div>
            <div className="text-right">
              <div className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                {isLoading ? (
                  <div className="animate-pulse h-6 w-16 bg-neutral-200 dark:bg-neutral-700 rounded ml-auto"></div>
                ) : `$${ingresoPromedio.toLocaleString()}`}
              </div>
              <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Promedio</p>
            </div>
          </div>
          <div className="mt-6" style={{ height: 280 }}>
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-pulse w-full h-4/5 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={ingresosData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    vertical={false} 
                    stroke={isDark ? '#404040' : '#e5e7eb'} 
                  />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: isDark ? '#a3a3a3' : '#6b7280' }}
                    axisLine={{ stroke: isDark ? '#525252' : '#e5e7eb' }}
                    tickLine={{ stroke: isDark ? '#525252' : '#e5e7eb' }}
                  />
                  <YAxis 
                    tick={{ fill: isDark ? '#a3a3a3' : '#6b7280' }}
                    axisLine={{ stroke: isDark ? '#525252' : '#e5e7eb' }}
                    tickLine={{ stroke: isDark ? '#525252' : '#e5e7eb' }}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Ingresos']}
                    contentStyle={{ 
                      backgroundColor: isDark ? '#262626' : 'white', 
                      border: 'none', 
                      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                      borderRadius: '0.375rem',
                      color: isDark ? '#f5f5f5' : '#171717',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="valor" 
                    stroke="#6366f1" 
                    fillOpacity={1} 
                    fill="url(#colorValor)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Sección inferior */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Gráfico de especialidades */}
        <motion.div className="card p-6 lg:col-span-1" variants={item}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>Citas por especialidad</h2>
              <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Este mes</p>
            </div>
          </div>
          <div className="flex items-center justify-center mt-6" style={{ height: 240 }}>
            {isLoading ? (
              <div className="w-40 h-40 rounded-full animate-pulse bg-neutral-200 dark:bg-neutral-700"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={especialidadesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {especialidadesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} citas`, name]}
                    contentStyle={{ 
                      backgroundColor: isDark ? '#262626' : 'white', 
                      border: 'none', 
                      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                      borderRadius: '0.375rem',
                      color: isDark ? '#f5f5f5' : '#171717',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
        
        {/* Actividad reciente */}
        <motion.div className="card p-6 lg:col-span-2" variants={item}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>Actividad reciente</h2>
              <p className={`text-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Últimas 24 horas</p>
            </div>
            <button className={`text-sm text-primary-600 hover:text-primary-500 flex items-center`}>
              Ver todo
              <ChevronRightIcon className="ml-1 h-4 w-4" />
            </button>
          </div>
          <div className="flow-root">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-center animate-pulse">
                    <div className="rounded-full bg-neutral-200 dark:bg-neutral-700 h-10 w-10"></div>
                    <div className="ml-4 flex-1">
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
                    </div>
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className={`divide-y ${isDark ? 'divide-neutral-700' : 'divide-neutral-200'}`}>
                {actividadReciente.map((activity) => (
                  <li key={activity.id} className="py-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {activity.type === 'cita' ? (
                          <div className="p-2 text-white bg-primary-500 rounded-full">
                            <CalendarIcon className="w-4 h-4" />
                          </div>
                        ) : activity.type === 'pago' ? (
                          <div className="p-2 text-white bg-green-500 rounded-full">
                            <BanknotesIcon className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="p-2 text-white bg-purple-500 rounded-full">
                            <UsersIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-neutral-900'} truncate`}>
                          {activity.patient}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'} truncate`}>
                          {activity.type === 'cita' 
                            ? `Cita con ${activity.doctor}` 
                            : activity.type === 'pago' 
                              ? `Pago de ${activity.amount}` 
                              : 'Nuevo registro'}
                        </p>
                      </div>
                      <div className={`inline-flex items-center text-xs ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        <p className="mr-2">{activity.time}</p>
                        <span 
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${activity.status === 'completada' ? 'bg-green-100 text-green-800' : 
                              activity.status === 'cancelada' ? 'bg-red-100 text-red-800' : 
                              activity.status === 'procesado' ? 'bg-blue-100 text-blue-800' : 
                              'bg-purple-100 text-purple-800'}`}
                        >
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
} 