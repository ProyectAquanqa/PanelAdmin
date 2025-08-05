/**
 * Configuración de filtros para Eventos
 * Configuración declarativa para UniversalFilters - Basada en knowledgeFiltersConfig
 */

/**
 * Configuración de filtros para la página de Eventos
 */
export const eventosFiltersConfig = {
  // Configuración de búsqueda
  searchConfig: {
    key: 'searchTerm',
    placeholder: 'Buscar eventos por título o descripción...',
    variant: 'default'
  },

  // Grupos de filtros
  filterGroups: [
    {
      key: 'selectedCategory',
      title: 'Categoría',
      type: 'dropdown',
      options: [], // Se llenará dinámicamente con las categorías
      placeholder: 'Seleccionar categoría...',
      showIcon: true,
      iconPath: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
      className: 'h-[42px]'
    },
    {
      key: 'selectedStatus',
      title: 'Estado',
      type: 'buttons',
      options: [
        { value: '', label: 'Todos' },
        { value: 'true', label: 'Publicado' },
        { value: 'false', label: 'Borrador' }
      ]
    },
    {
      key: 'dateRange',
      title: 'Fecha',
      type: 'dateRange',
      placeholder: 'Seleccionar fechas...',
      showIcon: true,
      iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      className: 'h-[42px]',
      responsive: {
        mobile: 'w-full',
        tablet: 'w-full lg:w-auto',
        desktop: 'w-auto'
      },
      containerClass: 'min-w-0 flex-1 lg:flex-none lg:min-w-[200px]'
    }
  ],

  // Acciones disponibles
  actions: [
    {
      label: 'Crear Evento',
      variant: 'primary',
      icon: 'M12 4v16m8-8H4',
      onClick: null // Se asignará dinámicamente
    }
  ],

  // Configuración adicional
  itemLabel: 'eventos'
};

/**
 * Función para preparar configuración con datos dinámicos
 * @param {Array} categories - Lista de categorías disponibles
 * @param {Object} callbacks - Callbacks para acciones
 * @returns {Object} Configuración preparada
 */
export const prepareEventosFiltersConfig = (categories = [], callbacks = {}) => {
  const config = { ...eventosFiltersConfig };

  // Configurar opciones de categorías
  if (config.filterGroups[0]) {
    config.filterGroups[0].options = [
      { value: '', label: 'Todas las categorías', isDefault: true },
      ...categories.map(category => ({
        value: category.id.toString(),
        label: category.nombre,
        badge: category.eventos_count || 0
      }))
    ];
  }

  // Configurar callbacks de acciones
  config.actions = config.actions.map(action => ({
    ...action,
    onClick: callbacks[`on${action.label.replace(/\s+/g, '')}`] || callbacks.onCreateNew
  }));

  return config;
};

export default eventosFiltersConfig;