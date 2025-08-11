/**
 * Configuración de filtros para el módulo de Perfiles (Django Groups)
 * Configuración declarativa para UniversalFilters
 */

/**
 * Configuración de filtros para la página de Perfiles
 */
export const profileFiltersConfig = {
  // Configuración de búsqueda
  searchConfig: {
    key: 'searchTerm',
    placeholder: 'Buscar por nombre de grupo o permisos...',
    variant: 'default'
  },

  // Grupos de filtros - simplificado, sin clasificación artificial por "tipo"
  filterGroups: [
    {
      key: 'selectedGroup',
      title: 'Filtrar por Grupo',
      type: 'dropdown',
      options: [], // Se llenarán dinámicamente con los grupos reales del backend
      placeholder: 'Seleccionar grupo...',
      showIcon: true,
      iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      className: 'h-[42px]'
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
    },
    {
      label: 'Importar',
      variant: 'secondary',
      icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
      onClick: null, // Se asignará dinámicamente
      isFileInput: true // Indicador especial para input de archivo
    }
  ],

  // Configuración de etiquetas
  itemLabel: 'perfiles'
};

/**
 * Función helper para preparar la configuración con datos dinámicos
 */
export const prepareProfileFiltersConfig = (groups = [], handlers = {}) => {
  const config = JSON.parse(JSON.stringify(profileFiltersConfig)); // Deep clone
  
  // Llenar las opciones del dropdown con los grupos reales del backend
  if (Array.isArray(groups) && groups.length > 0) {
    config.filterGroups[0].options = [
      { value: '', label: 'Todos los grupos' },
      ...groups.map(group => ({
        value: group.name || group.id?.toString(),
        label: group.name || `Grupo ${group.id}`
      }))
    ];
  }
  
  // Asignar handlers dinámicamente
  config.actions = config.actions.map(action => {
    if (action.label === 'Crear') {
      return { ...action, onClick: handlers.onCreateNew || (() => {}) };
    } else if (action.label === 'Exportar') {
      return { ...action, onClick: handlers.onExport || (() => {}) };
    } else if (action.label === 'Importar') {
      return { ...action, onChange: handlers.onImport || (() => {}), onClick: undefined };
    }
    return action;
  });
  
  return config;
};

export default profileFiltersConfig;
