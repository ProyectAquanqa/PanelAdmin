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
      title: 'Rol',
      type: 'dropdown',
      options: [], // Se llenará dinámicamente con los grupos
      placeholder: 'Seleccionar rol...',
      showIcon: true,
      iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      className: 'h-[42px]'
    },
    {
      key: 'selectedDateRange',
      title: 'Fecha Registro',
      type: 'dateRange',
      placeholder: 'Seleccionar rango...',
      showIcon: true,
      iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      className: 'h-[42px]'
    }
  ],

  // Acciones disponibles - CON BOTÓN + Y IMPORTAR
  actions: [
    {
      label: 'Crear',
      variant: 'primary',
      icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
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
      value: group.id?.toString(), 
      label: group.nombre || group.name 
    }))
  ];
  
  // Cambiar título de "Rol" a "Perfil"
  config.filterGroups[0].title = 'Perfil';
  config.filterGroups[0].placeholder = 'Seleccionar perfil...';
  
  // Asignar handlers dinámicamente - 3 ACCIONES
  config.actions[0].onClick = handlers.onCreateNew;
  config.actions[1].onClick = handlers.onExport;
  config.actions[2].onClick = handlers.onImport;
  
  return config;
};

export default userFiltersConfig;