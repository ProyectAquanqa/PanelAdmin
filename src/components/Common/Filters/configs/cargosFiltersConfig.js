/**
 * Configuración de filtros para Cargos
 * Configuración declarativa para UniversalFilters - Basada en eventosFiltersConfig
 */

/**
 * Configuración de filtros para la página de Cargos
 */
export const cargosFiltersConfig = {
  // Configuración de búsqueda
  searchConfig: {
    key: 'searchTerm',
    placeholder: 'Buscar cargos por nombre, descripción o área...',
    variant: 'default'
  },

  // Grupos de filtros
  filterGroups: [
    {
      key: 'selectedStatus',
      title: 'Estado',
      type: 'dropdown',
      options: [
        { value: '', label: 'Todos los estados' },
        { value: 'active_area', label: 'Área activa' },
        { value: 'inactive_area', label: 'Área inactiva' },
        { value: 'with_users', label: 'Con usuarios' },
        { value: 'without_users', label: 'Sin usuarios' }
      ],
      placeholder: 'Seleccionar estado...',
      showIcon: true,
      iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      className: 'h-[42px]'
    },
    {
      key: 'dateRange',
      title: 'Fecha de Creación',
      type: 'dateRange',
      placeholder: 'Seleccionar fechas...',
      showIcon: true,
      iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      className: 'h-[42px]',
      responsive: {
        mobile: 'w-full',
        tablet: 'w-auto',
        desktop: 'w-auto'
      },
      containerClass: 'min-w-0 max-w-[240px] lg:max-w-[280px] xl:max-w-[320px] transition-all duration-300 ease-in-out'
    }
  ],

  // Acciones disponibles
  actions: [
    {
      label: 'Crear',
      variant: 'primary',
      icon: 'M12 4v16m8-8H4',
      onClick: null // Se asignará dinámicamente
    },
    {
      label: 'Exportar',
      variant: 'secondary',
      icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      onClick: null // Se asignará dinámicamente
    }
  ],

  // Configuración adicional
  itemLabel: 'cargos'
};

/**
 * Función para preparar configuración con datos dinámicos
 * @param {Object} callbacks - Callbacks para acciones
 * @returns {Object} Configuración preparada
 */
export const prepareCargoFiltersConfig = (callbacks = {}) => {
  const config = { ...cargosFiltersConfig };

  // Configurar callbacks de acciones
  config.actions = config.actions.map(action => ({
    ...action,
    onClick: action.label === 'Crear' ? callbacks.onCreateNew : callbacks.onExport
  }));

  return config;
};

export default cargosFiltersConfig;
