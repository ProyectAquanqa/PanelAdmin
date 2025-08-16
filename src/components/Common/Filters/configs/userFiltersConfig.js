/**
 * Configuración de filtros para el módulo de Usuarios
 * Configuración declarativa para UniversalFilters
 */

/**
 * Configuración de filtros para la página de Usuarios
 */
export const userFiltersConfig = {
  // Configuración de búsqueda
  searchConfig: {
    key: 'searchTerm',
    placeholder: 'Buscar por nombre, DNI o email...',
    variant: 'default'
  },

  // Grupos de filtros - MEJORADO CON FECHA BETWEEN
  filterGroups: [
    {
      key: 'selectedRole',
      title: 'Perfil',
      type: 'dropdown',
      options: [], // Se llenará dinámicamente con los grupos
      placeholder: 'Seleccionar perfil...',
      showIcon: false,
      className: 'h-[42px]'
    },
    {
      key: 'dateRange',
      title: 'Fecha Registro',
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
  itemLabel: 'usuarios'
};

/**
 * Función helper para preparar la configuración con datos dinámicos
 */
export const prepareUserFiltersConfig = (groups = [], handlers) => {
  const config = { ...userFiltersConfig };
  
  // Validar que groups sea un array
  const validGroups = Array.isArray(groups) ? groups : [];
  
  // Agregar grupos dinámicamente 
  config.filterGroups[0].options = [
    { value: '', label: 'Todos los perfiles' },
    ...validGroups.map(group => ({ 
      value: group.name || group.nombre, // Filtrar por nombre, no por ID
      label: group.nombre || group.name 
    }))
  ];
  
  // Asignar handlers dinámicamente
  config.actions[0].onClick = handlers.onCreateNew;
  config.actions[1].onChange = handlers.onImport; // onImport es para file input
  
  return config;
};

export default userFiltersConfig;