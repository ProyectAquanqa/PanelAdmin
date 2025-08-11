/**
 * Configuración de filtros para Conversations
 * Configuración declarativa para UniversalFilters
 */

/**
 * Configuración de filtros para la página de Conversations
 */
export const conversationFiltersConfig = {
  // Configuración de búsqueda
  searchConfig: {
    key: 'searchTerm',
    placeholder: 'Buscar conversaciones, usuarios, preguntas o respuestas...',
    variant: 'simple'
  },

  // Grupos de filtros
  filterGroups: [
    {
      key: 'selectedUser',
      title: 'Usuario',
      type: 'dropdown',
      options: [
        { value: '', label: 'Todos los usuarios' },
        { value: 'admin', label: 'Administrador' },
        { value: 'usuario1', label: 'Usuario 1' },
        { value: 'maria_garcia', label: 'María García' },
        { value: 'test_user', label: 'Usuario Test' }
      ],
      placeholder: 'Seleccionar usuario...',
      showIcon: true,
      iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    },
    {
      key: 'selectedStatus',
      title: 'Estado',
      type: 'buttons',
      options: [
        { value: '', label: 'Todas' },
        { value: 'exitosa', label: 'Exitosas' },
        { value: 'fallida', label: 'Fallidas' }
      ]
    },
    {
      key: 'selectedDateRange',
      title: 'Fecha',
      type: 'dropdown',
      options: [
        { value: '', label: 'Todas las fechas' },
        { value: 'today', label: 'Hoy' },
        { value: 'yesterday', label: 'Ayer' },
        { value: 'week', label: 'Última semana' },
        { value: 'month', label: 'Último mes' }
      ],
      placeholder: 'Seleccionar fecha...',
      showIcon: true,
      iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
    }
  ],

  // Acciones disponibles
  actions: [
    {
      label: 'Exportar',
      variant: 'primary',
      icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      onClick: null // Se asignará dinámicamente
    }
  ],

  // Configuración de etiquetas
  itemLabel: 'conversaciones encontradas'
};

/**
 * Función helper para preparar la configuración con handlers dinámicos
 */
export const prepareConversationFiltersConfig = (handlers) => {
  const config = { ...conversationFiltersConfig };
  
  // Asignar handlers dinámicamente
  config.actions[0].onClick = handlers.onExport;
  
  return config;
};

export default conversationFiltersConfig;