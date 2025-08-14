import { useState, useEffect, useCallback, useMemo } from 'react';
import userService from '../services/userService';
import eventosService from '../services/eventosService';
import notificationsService from '../services/notificationsService';
import chatbotService from '../services/chatbotService';
import toast from 'react-hot-toast';

/**
 * Hook personalizado para manejar datos del dashboard
 * Obtiene estadísticas reales de todos los servicios disponibles
 */
export const useDashboard = () => {
  // Estados para las estadísticas
  const [dashboardData, setDashboardData] = useState({
    users: { total: 0, active: 0, groups: [] },
    events: { total: 0, recent: [], categories: [] },
    notifications: { total: 0, sent: 0 },
        chatbot: {
      total_conversations: 0,
      total_knowledge_base: 0,
      total_views: 0,
      top_categories: []
    }
  });
  
  // Estados de carga
  const [loading, setLoading] = useState({
    users: true,
    events: true,
    notifications: true,
    chatbot: true,
  });
  
  const [error, setError] = useState(null);
  
  // Obtener estadísticas de usuarios
  const fetchUserStats = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      
      // Obtener datos reales del backend usando el mismo patrón que useUsers.js
      const usersResponse = await userService.users.list(1, 100);
      const groupsResponse = await userService.groups.list();
      
      // Manejar formato de respuesta igual que en useUsers.js (líneas 68-95)
      let usuarios = [];
      let totalUsers = 0;
      
      if (usersResponse.status === 'success') {
        const data = usersResponse.data;
        usuarios = data.results || data;
        totalUsers = data.count || data.length || 0;
      } else {
        // Fallback para respuestas directas del DRF ViewSet
        usuarios = usersResponse.results || usersResponse;
        totalUsers = usersResponse.count || usersResponse.length || 0;
      }
      
      // Manejar grupos igual que en useUsers.js (líneas 38-63)
      let grupos = [];
      if (Array.isArray(groupsResponse)) {
        grupos = groupsResponse;
      } else if (groupsResponse && Array.isArray(groupsResponse.data)) {
        grupos = groupsResponse.data;
      } else if (groupsResponse && Array.isArray(groupsResponse.results)) {
        grupos = groupsResponse.results;
      }
      
      const userStats = {
        total: totalUsers,
        active: usuarios.filter(user => user.is_active).length || 0,
        groups: grupos
      };
      
      setDashboardData(prev => ({ ...prev, users: userStats }));
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, []);
  
  // Obtener estadísticas de eventos
  const fetchEventStats = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, events: true }));
      
      // Obtener datos reales del backend - solo eventos publicados, más recientes primero
      const eventsResponse = await eventosService.getEventos({ 
        page: 1, 
        page_size: 5, 
        ordering: '-fecha', // Ordenar por fecha del evento (más reciente primero)
        publicado: true // Solo eventos publicados
      });
      const categoriesResponse = await eventosService.getCategorias();
      
      // Manejar formato de respuesta igual que en useEventos.js (líneas 38-50)
      let eventos = [];
      let totalEvents = 0;
      
      if (eventsResponse.status === 'success') {
        eventos = eventsResponse.data || [];
        totalEvents = eventsResponse.pagination?.count || eventos.length;
      } else {
        // Formato directo de DRF
        eventos = eventsResponse.results || eventsResponse || [];
        totalEvents = eventsResponse.count || eventos.length;
      }
      
      // Manejar categorías
      let categorias = [];
      if (categoriesResponse.status === 'success') {
        categorias = categoriesResponse.data || [];
      } else {
        categorias = categoriesResponse.results || categoriesResponse || [];
      }
      
      // Filtrar solo eventos publicados y ordenar por fecha más reciente
      const eventosPublicados = eventos
        .filter(evento => evento.publicado === true)
        .sort((a, b) => new Date(b.fecha || b.fecha_creacion) - new Date(a.fecha || a.fecha_creacion))
        .slice(0, 5);

      const eventStats = {
        total: totalEvents,
        recent: eventosPublicados, // Solo eventos publicados, más recientes primero
        categories: categorias
      };
      
      setDashboardData(prev => ({ ...prev, events: eventStats }));
    } catch (error) {
      console.error('Error fetching event stats:', error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, events: false }));
    }
  }, []);
  
  // Obtener estadísticas de notificaciones
  const fetchNotificationStats = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, notifications: true }));
      
      // Obtener datos reales del backend
      const statsResponse = await notificationsService.getStatistics();
      
      let notificationData = { total: 0, sent: 0 };
      
      if (statsResponse.status === 'success' && statsResponse.data) {
        notificationData = {
          total: statsResponse.data.total || 0,
          sent: statsResponse.data.sent || 0
        };
      } else {
        // Si no hay endpoint de estadísticas, usar lista general
        const notificationsResponse = await notificationsService.getNotifications({ page_size: 1 });
        if (notificationsResponse.status === 'success') {
          notificationData.total = notificationsResponse.data.count || 0;
          notificationData.sent = notificationData.total;
        }
      }
      
      setDashboardData(prev => ({ ...prev, notifications: notificationData }));
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error; // Re-throw para manejo en refreshData
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  }, []);
  
  // Obtener estadísticas de chatbot (datos reales del backend) - con cache busting
  const fetchChatbotStats = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, chatbot: true }));
      
      // Añadir timestamp para evitar cache del navegador
      const timestamp = Date.now();
      
      // Obtener estadísticas del chatbot desde el backend con cache busting
      const statsResponse = await chatbotService.getStats(`?_t=${timestamp}`);
      
      // CRÍTICO: Usar exactamente los datos que devuelve el backend, SIN fallbacks
      let chatbotData = {};
      
      if (statsResponse) {
        // Verificar si viene con wrapper de éxito
        if (statsResponse.status === 'success' && statsResponse.data) {
          chatbotData = statsResponse.data;
        } else {
          // Datos directos del DRF - usar tal como vienen
          chatbotData = statsResponse;
        }
        
        // Validar que tenemos los campos esperados del backend
        if (!chatbotData.hasOwnProperty('total_conversations')) {
          console.warn('Formato de respuesta del backend puede ser incorrecto:', chatbotData);
          // En lugar de throw, usar datos vacíos para evitar romper la UI
          chatbotData = {
            total_conversations: 0,
            total_knowledge_base: 0,
            total_views: 0,
            top_categories: []
          };
        }
      } else {
        console.warn('Sin respuesta del backend de estadísticas');
        // Datos vacíos por defecto
        chatbotData = {
          total_conversations: 0,
          total_knowledge_base: 0,
          total_views: 0,
          top_categories: []
        };
      }
      
      setDashboardData(prev => ({ ...prev, chatbot: chatbotData }));
    } catch (error) {
      console.error('Error fetching chatbot stats:', error);
      // En caso de error, no throw para que no rompa el polling
      setDashboardData(prev => ({ 
        ...prev, 
        chatbot: {
          total_conversations: 0,
          total_knowledge_base: 0,
          total_views: 0,
          top_categories: []
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, chatbot: false }));
    }
  }, []);
  
  // Función para refrescar todos los datos
  const refreshData = useCallback(async () => {
    setError(null);
    try {
      // Ejecutar todas las consultas en paralelo para mejor rendimiento
      const promises = [
        fetchUserStats(),
        fetchEventStats(), 
        fetchNotificationStats(),
        fetchChatbotStats()
      ];
      
      // Esperar todas las promesas y manejar errores individuales
      const results = await Promise.allSettled(promises);
      
      // Verificar si alguna falló y mostrar advertencia en lugar de error total
      const failedServices = results
        .map((result, index) => ({ result, service: ['usuarios', 'eventos', 'notificaciones', 'chatbot'][index] }))
        .filter(({ result }) => result.status === 'rejected')
        .map(({ service }) => service);
      
      if (failedServices.length > 0) {
        console.warn('Algunos servicios fallaron:', failedServices);
        if (failedServices.length === results.length) {
          setError('Error al cargar datos del dashboard');
          toast.error('Error al cargar datos del dashboard');
        } else {
          toast('Algunos datos pueden estar desactualizados', {
            icon: '⚠️',
            duration: 3000
          });
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      setError('Error al cargar datos del dashboard');
      toast.error('Error al cargar algunos datos del dashboard');
    }
  }, [fetchUserStats, fetchEventStats, fetchNotificationStats, fetchChatbotStats]);
  
  // Estadísticas computadas para las tarjetas del dashboard
  const stats = useMemo(() => {
    // Asegurar que todos los valores sean primitivos (string/number), no objetos
    const userTotal = dashboardData.users.total || 0;
    const userActive = dashboardData.users.active || 0;
    const eventTotal = dashboardData.events.total || 0;
    const eventRecent = Array.isArray(dashboardData.events.recent) ? dashboardData.events.recent.length : 0;
    const notificationsSent = dashboardData.notifications.sent || 0;
    const notificationsTotal = dashboardData.notifications.total || 0;
    // Usar los campos reales del backend de estadísticas
    const chatbotTotalConversations = dashboardData.chatbot.total_conversations || 0;
    
    return [
      {
        id: 'users',
        title: 'Usuarios Activos',
        value: userActive.toString(),
        total: userTotal,
        change: userTotal > 0 
          ? `${Math.round((userActive / userTotal) * 100)}% activos`
          : '0% activos',
        isPositive: userActive > 0,
        color: 'slate',
        loading: loading.users
      },
      {
        id: 'events',
        title: 'Eventos Creados',
        value: eventTotal.toString(),
        change: eventRecent > 0 
          ? `${eventRecent} recientes`
          : 'Sin eventos recientes',
        isPositive: eventTotal > 0,
        color: 'slate',
        loading: loading.events
      },
      {
        id: 'notifications',
        title: 'Notificaciones Enviadas',
        value: notificationsSent.toString(),
        change: notificationsTotal > 0 ? `${notificationsTotal} total` : '0 total',
        isPositive: notificationsSent > 0,
        color: 'slate',
        loading: loading.notifications
      },
      {
        id: 'chatbot',
        title: 'Consultas al Chatbot',
        value: chatbotTotalConversations.toString(),
        change: 'Total acumulado',
        isPositive: chatbotTotalConversations > 0,
        color: 'slate',
        loading: loading.chatbot
      }
    ];
  }, [dashboardData, loading]);
  
  // Estado de carga general
  const isLoading = useMemo(() => 
    Object.values(loading).some(isLoading => isLoading)
  , [loading]);
  
  // Datos de eventos recientes para la tabla (máximo 5)
  const recentEvents = useMemo(() => {
    const events = Array.isArray(dashboardData.events.recent) ? dashboardData.events.recent : [];
    
    return events.slice(0, 5).map(event => {
      // Determinar estado basado en los campos reales del modelo
      let status = 'Borrador'; // Por defecto
      if (event.publicado) {
        status = event.is_pinned ? 'Publicado (Fijado)' : 'Publicado';
      }
      
      return {
        id: event.id || Math.random(),
        title: event.titulo || event.title || 'Sin título',
        date: event.fecha || event.fecha_evento || event.fecha_creacion || new Date().toISOString().split('T')[0],
        // Asegurar que category sea string, no objeto
        category: typeof event.categoria === 'object' && event.categoria 
          ? event.categoria.nombre || 'Sin categoría'
          : event.categoria_nombre || event.categoria || 'Sin categoría',
        status: status
      };
    });
  }, [dashboardData.events.recent]);
  
  // Inicialización y actualización automática cada 30 segundos
  useEffect(() => {
    refreshData();
    
    // Configurar polling para actualización automática del chatbot
    const pollInterval = setInterval(() => {
      // Solo actualizar estadísticas del chatbot para mantener datos frescos
      fetchChatbotStats().catch(console.error);
    }, 30000); // 30 segundos
    
    // Cleanup
    return () => {
      clearInterval(pollInterval);
    };
  }, [refreshData, fetchChatbotStats]);
  
  return {
    // Datos del dashboard
    stats,
    recentEvents,
    dashboardData,
    
    // Estados
    loading,
    isLoading,
    error,
    
    // Funciones
    refreshData,
    fetchUserStats,
    fetchEventStats,
    fetchNotificationStats,
    fetchChatbotStats,
    
    // Funciones específicas para actualizaciones dinámicas
    refreshChatbotStats: fetchChatbotStats
  };
};

export default useDashboard;
