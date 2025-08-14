/**
 * Utilidades para manejar rangos de fechas predefinidos
 */

/**
 * Convierte una opción de fecha predefinida en un rango de fechas
 * @param {string} dateRangeOption - La opción seleccionada (today, thisWeek, etc.)
 * @returns {Object} - Objeto con from y to en formato YYYY-MM-DD
 */
export const getDateRangeFromOption = (dateRangeOption) => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  
    switch (dateRangeOption) {
      case 'today':
        return {
          from: formatDate(startOfToday),
          to: formatDate(endOfToday)
        };
  
      case 'yesterday':
        const yesterday = new Date(startOfToday);
        yesterday.setDate(yesterday.getDate() - 1);
        const endOfYesterday = new Date(yesterday);
        endOfYesterday.setHours(23, 59, 59);
        return {
          from: formatDate(yesterday),
          to: formatDate(endOfYesterday)
        };
  
      case 'thisWeek':
        const startOfWeek = new Date(startOfToday);
        const dayOfWeek = startOfWeek.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Lunes como primer día
        startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59);
        
        return {
          from: formatDate(startOfWeek),
          to: formatDate(endOfWeek)
        };
  
      case 'lastWeek':
        const startOfLastWeek = new Date(startOfToday);
        const dayOfWeekLast = startOfLastWeek.getDay();
        const daysToLastMonday = dayOfWeekLast === 0 ? 13 : dayOfWeekLast + 6; // Lunes de la semana pasada
        startOfLastWeek.setDate(startOfLastWeek.getDate() - daysToLastMonday);
        
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(endOfLastWeek.getDate() + 6);
        endOfLastWeek.setHours(23, 59, 59);
        
        return {
          from: formatDate(startOfLastWeek),
          to: formatDate(endOfLastWeek)
        };
  
      case 'thisMonth':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
        return {
          from: formatDate(startOfMonth),
          to: formatDate(endOfMonth)
        };
  
      case 'lastMonth':
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
        return {
          from: formatDate(startOfLastMonth),
          to: formatDate(endOfLastMonth)
        };
  
      case 'last7Days':
        const sevenDaysAgo = new Date(startOfToday);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Incluye hoy
        return {
          from: formatDate(sevenDaysAgo),
          to: formatDate(endOfToday)
        };
  
      case 'last30Days':
        const thirtyDaysAgo = new Date(startOfToday);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // Incluye hoy
        return {
          from: formatDate(thirtyDaysAgo),
          to: formatDate(endOfToday)
        };
  
      default:
        return {
          from: '',
          to: ''
        };
    }
  };
  
  /**
   * Formatea una fecha al formato YYYY-MM-DD
   * @param {Date} date - La fecha a formatear
   * @returns {string} - Fecha en formato YYYY-MM-DD
   */
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  /**
   * Obtiene el label legible para una opción de fecha
   * @param {string} dateRangeOption - La opción seleccionada
   * @returns {string} - Label legible
   */
  export const getDateRangeLabel = (dateRangeOption) => {
    const labels = {
      today: 'Hoy',
      yesterday: 'Ayer',
      thisWeek: 'Esta semana',
      lastWeek: 'Semana pasada',
      thisMonth: 'Este mes',
      lastMonth: 'Mes pasado',
      last7Days: 'Últimos 7 días',
      last30Days: 'Últimos 30 días'
    };
    
    return labels[dateRangeOption] || 'Todas las fechas';
  };
  
  export default {
    getDateRangeFromOption,
    getDateRangeLabel
  };