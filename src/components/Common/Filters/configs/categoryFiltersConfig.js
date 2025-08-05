/**
 * Configuración de filtros para Categories - COPIADO DEL CHATBOT
 * Configuración declarativa para UniversalFilters con diseño mejorado
 */

/**
 * Configuración base de filtros para categorías del chatbot (original)
 */
export const categoryFiltersConfig = {
  // Configuración de búsqueda
  searchConfig: {
    key: 'searchTerm',
    placeholder: 'Buscar categorías por nombre...',
    variant: 'simple'
  },

  // Grupos de filtros
  filterGroups: [
    {
      key: 'selectedStatus',
      title: 'Estado',
      type: 'buttons',
      options: [
        { value: '', label: 'Todas' },
        { value: 'active', label: 'Activas' },
        { value: 'inactive', label: 'Inactivas' }
      ]
    },
    {
      key: 'sortOrder',
      title: 'Ordenamiento',
      type: 'buttons',
      options: [
        { value: '', label: 'Por defecto' },
        { value: 'asc', label: 'A-Z' },
        { value: 'desc', label: 'Z-A' }
      ]
    }
  ],

  // Acciones disponibles
  actions: [
    {
      label: 'Crear',
      variant: 'primary',
      icon: 'M12 4v16m8-8H4',
      onClick: null
    }
  ],

  itemLabel: 'categorías'
};

/**
 * Función para preparar la configuración con handlers dinámicos (chatbot)
 */
export const prepareCategoryFiltersConfig = (handlers = {}) => {
  const config = { ...categoryFiltersConfig };
  
  if (config.actions) {
    config.actions = config.actions.map(action => ({
      ...action,
      onClick: handlers[action.label === 'Crear' ? 'onCreateNew' : 'onExport'] || (() => {})
    }));
  }
  
  return config;
};

/**
 * Configuración simplificada de filtros para categorías de eventos
 * Solo: Estado, Ordenamiento A-Z/Z-A y Acciones
 */
export const eventCategoryFiltersConfig = {
  // Configuración de búsqueda
  searchConfig: {
    key: 'searchTerm',
    placeholder: 'Buscar categorías por nombre o descripción...',
    variant: 'simple'
  },

  // Grupos de filtros simplificados
  filterGroups: [
    {
      key: 'selectedStatus',
      title: 'Estado',
      type: 'buttons',
      options: [
        { value: '', label: 'Todas' },
        { value: 'active', label: 'Activas' },
        { value: 'inactive', label: 'Inactivas' }
      ],
      showIcon: true,
      iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      key: 'sortOrder',
      title: 'Ordenamiento',
      type: 'buttons',
      options: [
        { value: '', label: 'Por Defecto' },
        { value: 'nombre_asc', label: 'A-Z' },
        { value: 'nombre_desc', label: 'Z-A' }
      ],
      showIcon: true,
      iconPath: 'M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12'
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
      icon: 'M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z',
      onClick: null // Se asignará dinámicamente
    }
  ],

  // Etiqueta para el contador
  itemLabel: 'categorías'
};

/**
 * Función para preparar la configuración con handlers dinámicos
 * @param {Object} handlers - Objeto con funciones de callback
 * @returns {Object} Configuración preparada
 */
export const prepareEventCategoryFiltersConfig = (handlers = {}) => {
  const config = { ...eventCategoryFiltersConfig };
  
  // Asignar handlers a las acciones
  if (config.actions) {
    config.actions = config.actions.map(action => ({
      ...action,
      onClick: handlers[action.label === 'Crear Categoría' ? 'onCreateNew' : 'onExport'] || (() => {})
    }));
  }
  
  return config;
};

export default categoryFiltersConfig;