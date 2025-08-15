/**
 * Configuración de filtros para Devices
 * Configuración declarativa para UniversalFilters
 */

/**
 * Configuración de filtros para la página de Gestión de Dispositivos
 */
export const deviceFiltersConfig = {
  // Configuración de búsqueda
  searchConfig: {
    key: 'searchTerm',
    placeholder: 'Buscar dispositivos por nombre, marca, modelo o usuario...',
    variant: 'default'
  },

  // Grupos de filtros
  filterGroups: [
    {
      key: 'selectedType',
      title: 'Tipo de Dispositivo',
      type: 'dropdown',
      options: [], // Se llenará dinámicamente con los tipos de dispositivos
      placeholder: 'Seleccionar tipo...',
      showIcon: true,
      iconPath: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      className: 'h-[42px]'
    },
    {
      key: 'selectedStatus',
      title: 'Estado',
      type: 'buttons',
      options: [
        { value: '', label: 'Todos' },
        { value: 'active', label: 'Activos' },
        { value: 'inactive', label: 'Inactivos' }
      ]
    }
  ],

  // Acciones disponibles (solo exportar como solicitó el usuario)
  actions: [
    {
      label: 'Exportar',
      variant: 'secondary',
      icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      onClick: null // Se asignará dinámicamente
    }
  ],

  // Configuración de etiquetas
  itemLabel: 'dispositivos'
};

/**
 * Función helper para preparar la configuración con datos dinámicos
 */
export const prepareDeviceFiltersConfig = (deviceTypes, handlers) => {
  const config = { ...deviceFiltersConfig };
  
  // Agregar tipos de dispositivos dinámicamente
  const safeTypes = Array.isArray(deviceTypes) ? deviceTypes : [];
  config.filterGroups[0].options = [
    { value: '', label: 'Todos los tipos' },
    ...safeTypes.map(type => ({ 
      value: type.id, // Ya es string, no necesita conversión
      label: type.name 
    }))
  ];
  
  // Asignar handler dinámicamente (solo exportar)
  config.actions[0].onClick = handlers.onExportData;
  
  return config;
};

export default deviceFiltersConfig;
