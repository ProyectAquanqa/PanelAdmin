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
      title: 'Grupo',
      type: 'dropdown',
      options: [], // Se llenarán dinámicamente con los grupos reales del backend
      placeholder: 'Seleccionar grupo...',
      showIcon: false,
      className: 'h-[42px]'
    },
    {
      key: 'userRange',
      title: 'Estado del Grupo',
      type: 'dropdown',
      options: [
        { value: '', label: 'Todos los grupos' },
        { value: 'empty', label: 'Grupos vacíos (0 usuarios)' },
        { value: 'small', label: 'Grupos pequeños (1-5 usuarios)' },
        { value: 'active', label: 'Grupos activos (6+ usuarios)' }
      ],
      placeholder: 'Filtrar por estado...',
      showIcon: true,
      iconPath: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      className: 'h-[42px]'
    }
  ],

  // Acciones disponibles
  actions: [
    {
      label: 'Crear',
      variant: 'primary',
      onClick: null // Se asignará dinámicamente
    },
    {
      label: 'Importar',
      variant: 'secondary',
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
    } else if (action.label === 'Importar') {
      return { ...action, onChange: handlers.onImport || (() => {}), onClick: undefined };
    }
    return action;
  });
  
  return config;
};

export default profileFiltersConfig;
