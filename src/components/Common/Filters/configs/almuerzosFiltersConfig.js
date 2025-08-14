/**
 * Configuración de filtros para Almuerzos
 * Configuración declarativa para UniversalFilters - COPIADA EXACTAMENTE DEL CHATBOT
 */

/**
 * Configuración de filtros para la página de Almuerzos - IGUAL QUE KNOWLEDGE BASE
 */
export const almuerzosFiltersConfig = {
  // Configuración de búsqueda
  searchConfig: {
    key: 'searchTerm',
    placeholder: 'Buscar por entrada, plato de fondo, refresco o dieta...',
    variant: 'default'
  },

  // Grupos de filtros - ORDEN: Estado, Fecha, Dieta
  filterGroups: [
    {
      key: 'selectedStatus',
      title: 'Estado',
      type: 'buttons',
      options: [
        { value: '', label: 'Todos' },
        { value: 'true', label: 'Activos' },
        { value: 'false', label: 'Inactivos' }
      ]
    },
    {
      key: 'selectedDateRange',
      title: 'Fecha',
      type: 'dropdown',
      options: [
        { value: '', label: 'Todas las fechas' },
        { value: 'thisWeek', label: 'Esta semana' },
        { value: 'lastWeek', label: 'Semana pasada' },
        { value: 'thisMonth', label: 'Este mes' }
      ],
      placeholder: 'Seleccionar período...',
      showIcon: true,
      iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    {
      key: 'selectedDiet',
      title: 'Dieta',
      type: 'buttons',
      options: [
        { value: '', label: 'Todos' },
        { value: 'with', label: 'Con dieta' },
        { value: 'without', label: 'Sin dieta' }
      ]
    }
  ],

  // Acciones disponibles - IGUAL QUE KNOWLEDGE BASE
  actions: [
    {
      label: 'Crear',
      variant: 'primary',
      icon: 'M12 4v16m8-8H4',
      onClick: null // Se asignará dinámicamente
    }
  ],

  // Configuración de etiquetas
  itemLabel: 'almuerzos'
};

/**
 * Función helper para preparar la configuración con datos dinámicos - IGUAL QUE KNOWLEDGE BASE
 */
export const prepareAlmuerzosFiltersConfig = (handlers) => {
  const config = { ...almuerzosFiltersConfig };

  // Asignar handlers dinámicamente
  config.actions[0].onClick = handlers.onCreateNew;

  return config;
};

export default prepareAlmuerzosFiltersConfig;
