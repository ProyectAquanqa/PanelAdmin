import { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  CalendarIcon, 
  BanknotesIcon, 
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon
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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Datos de ejemplo para los gráficos
const citasData = [
  { name: 'Lun', citas: 12 },
  { name: 'Mar', citas: 19 },
  { name: 'Mié', citas: 15 },
  { name: 'Jue', citas: 22 },
  { name: 'Vie', citas: 28 },
  { name: 'Sáb', citas: 14 },
  { name: 'Dom', citas: 8 },
];

const ingresosData = [
  { name: 'Ene', valor: 4000 },
  { name: 'Feb', valor: 3000 },
  { name: 'Mar', valor: 5000 },
  { name: 'Abr', valor: 4500 },
  { name: 'May', valor: 6000 },
  { name: 'Jun', valor: 5500 },
];

const especialidadesData = [
  { name: 'Cardiología', value: 35 },
  { name: 'Pediatría', value: 25 },
  { name: 'Dermatología', value: 18 },
  { name: 'Oftalmología', value: 15 },
  { name: 'Traumatología', value: 12 },
];

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  
  // Simular carga de datos
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Tarjetas KPI
  const kpiCards = [
    {
      title: 'Pacientes Totales',
      value: '1,248',
      icon: UsersIcon,
      change: '+12%',
      trend: 'up',
      color: 'bg-blue-500'
    },
    {
      title: 'Citas Hoy',
      value: '42',
      icon: CalendarIcon,
      change: '+8%',
      trend: 'up',
      color: 'bg-green-500'
    },
    {
      title: 'Ingresos Mensuales',
      value: '$24,500',
      icon: BanknotesIcon,
      change: '+15%',
      trend: 'up',
      color: 'bg-purple-500'
    },
    {
      title: 'Tiempo Promedio',
      value: '24 min',
      icon: ClockIcon,
      change: '-5%',
      trend: 'down',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado con fecha y bienvenida */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Principal</h1>
          <p className="mt-1 text-sm text-gray-500">
            {format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button 
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Generar Reporte
          </button>
        </div>
      </div>
      
      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, index) => (
          <div key={index} className="overflow-hidden bg-white rounded-lg shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${card.color}`}>
                    <card.icon className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                </div>
                <div className="flex-1 w-0 ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{card.title}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{card.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 bg-gray-50">
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
                  <span className="ml-2 text-gray-500">vs. mes anterior</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Gráficos principales */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Gráfico de citas por día */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900">Citas por día de la semana</h2>
          <p className="text-sm text-gray-500">Última semana</p>
          <div className="mt-6" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={citasData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                    borderRadius: '0.375rem'
                  }}
                />
                <Bar 
                  dataKey="citas" 
                  fill="#6366f1" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Gráfico de ingresos */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900">Ingresos mensuales</h2>
          <p className="text-sm text-gray-500">Últimos 6 meses</p>
          <div className="mt-6" style={{ height: 300 }}>
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Ingresos']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                    borderRadius: '0.375rem'
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
          </div>
        </div>
      </div>
      
      {/* Sección inferior */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Gráfico de especialidades */}
        <div className="p-6 bg-white rounded-lg shadow lg:col-span-1">
          <h2 className="text-lg font-medium text-gray-900">Citas por especialidad</h2>
          <p className="text-sm text-gray-500">Este mes</p>
          <div className="flex items-center justify-center mt-6" style={{ height: 240 }}>
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
                    backgroundColor: 'white', 
                    border: 'none', 
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                    borderRadius: '0.375rem'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Actividad reciente */}
        <div className="p-6 bg-white rounded-lg shadow lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900">Actividad reciente</h2>
          <p className="text-sm text-gray-500">Últimas 24 horas</p>
          <div className="flow-root mt-6">
            <ul className="divide-y divide-gray-200">
              {[
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
              ].map((activity) => (
                <li key={activity.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {activity.type === 'cita' ? (
                        <div className="p-2 text-white bg-indigo-500 rounded-full">
                          <CalendarIcon className="w-5 h-5" />
                        </div>
                      ) : activity.type === 'pago' ? (
                        <div className="p-2 text-white bg-green-500 rounded-full">
                          <BanknotesIcon className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="p-2 text-white bg-purple-500 rounded-full">
                          <UsersIcon className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.patient}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {activity.type === 'cita' 
                          ? `Cita con ${activity.doctor}` 
                          : activity.type === 'pago' 
                            ? `Pago de ${activity.amount}` 
                            : 'Nuevo registro'}
                      </p>
                    </div>
                    <div className="inline-flex items-center text-sm text-gray-500">
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
          </div>
        </div>
      </div>
    </div>
  );
} 