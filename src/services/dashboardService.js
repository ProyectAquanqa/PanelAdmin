import apiClient from '../api/apiClient';

// Datos de fallback para cuando la API no responda
const fallbackData = {
  stats: {
    patients_count: 1248,
    patients_growth: 12,
    appointments_today: 42,
    appointments_growth: 8,
    monthly_revenue: 24500,
    revenue_growth: 15,
    avg_appointment_time: 24,
    time_change: -5
  },
  recentActivity: {
    data: [
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
  },
  charts: {
    citas: {
      data: [
        { name: 'Lun', citas: 12 },
        { name: 'Mar', citas: 19 },
        { name: 'Mié', citas: 15 },
        { name: 'Jue', citas: 22 },
        { name: 'Vie', citas: 28 },
        { name: 'Sáb', citas: 14 },
        { name: 'Dom', citas: 8 },
      ]
    },
    ingresos: {
      data: [
        { name: 'Ene', valor: 4000 },
        { name: 'Feb', valor: 3000 },
        { name: 'Mar', valor: 5000 },
        { name: 'Abr', valor: 4500 },
        { name: 'May', valor: 6000 },
        { name: 'Jun', valor: 5500 },
      ]
    },
    especialidades: {
      data: [
        { name: 'Cardiología', value: 35 },
        { name: 'Pediatría', value: 25 },
        { name: 'Dermatología', value: 18 },
        { name: 'Oftalmología', value: 15 },
        { name: 'Traumatología', value: 12 },
      ]
    }
  }
};

/**
 * Obtiene una visión general del dashboard
 * @returns {Promise} Datos generales del dashboard
 */
export const getDashboardOverview = async () => {
  try {
    const response = await apiClient.get('/dashboard/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener el dashboard:', error);
    // En caso de error, devolver datos estáticos
    return { success: true, data: {} };
  }
};

/**
 * Obtiene las estadísticas del dashboard
 * @returns {Promise} Estadísticas para el dashboard
 */
export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get('/dashboard/stats/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    // En caso de error, devolver datos estáticos
    return fallbackData.stats;
  }
};

/**
 * Obtiene la actividad reciente para el dashboard
 * @returns {Promise} Lista de actividades recientes
 */
export const getRecentActivity = async () => {
  try {
    const response = await apiClient.get('/dashboard/recent-activity/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener actividad reciente:', error);
    // En caso de error, devolver datos estáticos
    return fallbackData.recentActivity;
  }
};

/**
 * Obtiene datos para los gráficos del dashboard
 * @param {string} chartType - Tipo de gráfico (citas, ingresos, especialidades)
 * @returns {Promise} Datos para el gráfico solicitado
 */
export const getChartData = async (chartType) => {
  try {
    const response = await apiClient.get(`/analytics/${chartType}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener datos del gráfico ${chartType}:`, error);
    // En caso de error, devolver datos estáticos según el tipo de gráfico
    return fallbackData.charts[chartType] || { data: [] };
  }
}; 