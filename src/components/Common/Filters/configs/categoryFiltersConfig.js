/**
 * Configuración de filtros para Categories
 * Configuración declarativa para UniversalFilters
 */

/**
 * Configuración de filtros para la página de Categories
 */
export const categoryFiltersConfig = {
  // Configuración de búsqueda
  searchConfig: {
    key: 'searchTerm',
    placeholder: 'Buscar categorías por nombre o descripción...',
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
      onClick: null // Se asignará dinámicamente
    },
    {
      label: 'Exportar',
      variant: 'secondary',
      icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      onClick: null // Se asignará dinámicamente
    }
  ],

  // Configuración de etiquetas
  itemLabel: 'categorías'
};

/**
 * Función helper para preparar la configuración con handlers dinámicos
 */
export const prepareCategoryFiltersConfig = (handlers) => {
  const config = { ...categoryFiltersConfig };
  
  // Asignar handlers dinámicamente
  config.actions[0].onClick = handlers.onCreateNew;
  config.actions[1].onClick = handlers.onExport;
  
  return config;
};

export default categoryFiltersConfig;