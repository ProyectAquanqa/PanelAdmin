/**
 * Configuración de filtros para Almuerzos
 * Configuración declarativa para UniversalFilters - Basada en eventosFiltersConfig
 */

/**
 * Configuración de filtros para la página de Almuerzos
 */
export const almuerzosFiltersConfig = {
  // Configuración de búsqueda
  searchConfig: {
    key: 'searchTerm',
    placeholder: 'Buscar por entrada, plato de fondo, refresco o dieta...',
    variant: 'default'
  },

  // Grupos de filtros
  filterGroups: [
    {
      key: 'selectedStatus',
      title: 'Estado',
      type: 'dropdown',
      options: [
        { value: '', label: 'Todos los estados', isDefault: true },
        { value: 'true', label: 'Activos' },
        { value: 'false', label: 'Inactivos' }
      ],
      placeholder: 'Seleccionar estado...',
      showIcon: true,
      iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      className: 'h-[42px]'
    },
    {
      key: 'selectedHoliday',
      title: 'Feriado',
      type: 'dropdown',
      options: [
        { value: '', label: 'Todos', isDefault: true },
        { value: 'true', label: 'Solo feriados' },
        { value: 'false', label: 'Sin feriados' }
      ],
      placeholder: 'Seleccionar...',
      showIcon: true,
      iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      className: 'h-[42px]'
    },
    {
      key: 'selectedDiet',
      title: 'Menú Dieta',
      type: 'dropdown',
      options: [
        { value: '', label: 'Todos', isDefault: true },
        { value: 'with_diet', label: 'Con dieta' },
        { value: 'without_diet', label: 'Sin dieta' }
      ],
      placeholder: 'Seleccionar...',
      showIcon: true,
      iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      className: 'h-[42px]'
    }
  ],

  // Acciones disponibles
  actions: [
    {
      label: 'Crear Almuerzo',
      variant: 'primary',
      icon: 'M12 4v16m8-8H4',
      onClick: null // Se asignará dinámicamente
    }
  ],

  // Configuración adicional
  itemLabel: 'almuerzos'
};

/**
 * Función para preparar configuración con datos dinámicos
 * @param {Object} callbacks - Callbacks para acciones
 * @returns {Object} Configuración preparada
 */
export const prepareAlmuerzosFiltersConfig = (callbacks = {}) => {
  const config = { ...almuerzosFiltersConfig };

  // Configurar callbacks de acciones
  config.actions = config.actions.map(action => ({
    ...action,
    onClick: callbacks[`on${action.label.replace(/\s+/g, '')}`] || callbacks.onCreateNew
  }));

  return config;
};

export default prepareAlmuerzosFiltersConfig;
