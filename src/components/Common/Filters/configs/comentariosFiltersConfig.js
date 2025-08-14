/**
 * Configuración de filtros para Comentarios
 * Configuración declarativa para UniversalFilters - Basada en eventosFiltersConfig
 */

/**
 * Configuración de filtros para la página de Comentarios
 */
export const comentariosFiltersConfig = {
  // Configuración de búsqueda
  searchConfig: {
    key: 'searchTerm',
    placeholder: 'Buscar comentarios por contenido o usuario...',
    variant: 'default'
  },

  // Grupos de filtros
  filterGroups: [
    {
      key: 'selectedEvento',
      title: 'Evento',
      type: 'dropdown',
      options: [], // Se llenará dinámicamente con los eventos
      placeholder: 'Seleccionar evento...',
      showIcon: true,
      iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      className: 'h-[42px]'
    },
    {
      key: 'selectedUsuario',
      title: 'Usuario',
      type: 'dropdown',
      options: [], // Se llenará dinámicamente con los usuarios
      placeholder: 'Seleccionar usuario...',
      showIcon: true,
      iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      className: 'h-[42px]'
    },
    {
      key: 'dateRange',
      title: 'Fecha de Comentario',
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

  // Sin acciones de creación para comentarios (solo ver/eliminar)
  actions: [],

  // Configuración adicional
  itemLabel: 'comentarios'
};

/**
 * Función para preparar configuración con datos dinámicos
 * @param {Array} eventos - Lista de eventos disponibles
 * @param {Array} usuarios - Lista de usuarios disponibles
 * @param {Object} callbacks - Callbacks para acciones (vacío para comentarios)
 * @returns {Object} Configuración preparada
 */
export const prepareComentariosFiltersConfig = (eventos = [], usuarios = [], callbacks = {}) => {
  const config = { ...comentariosFiltersConfig };

  // Configurar opciones de eventos
  if (config.filterGroups[0]) {
    config.filterGroups[0].options = [
      { value: '', label: 'Todos los eventos', isDefault: true },
      ...eventos.map(evento => ({
        value: evento.id.toString(),
        label: evento.titulo,
        badge: evento.comentarios_count || 0
      }))
    ];
  }

  // Configurar opciones de usuarios
  if (config.filterGroups[1]) {
    const usuarioOptions = usuarios.map(usuario => {
      // Crear un nombre para mostrar más completo
      let displayName = usuario.full_name;
      if (!displayName) {
        displayName = `${usuario.first_name || ''} ${usuario.last_name || ''}`.trim();
      }
      if (!displayName) {
        displayName = usuario.username;
      }
      
      return {
        value: usuario.id.toString(),
        label: displayName,
        subtitle: usuario.username !== displayName ? `@${usuario.username}` : null
      };
    }).filter(option => option.label); // Solo incluir usuarios con nombre válido
    
    config.filterGroups[1].options = [
      { value: '', label: 'Todos los usuarios', isDefault: true },
      ...usuarioOptions
    ];
  }

  // No hay acciones para comentarios (solo visualización y eliminación)
  config.actions = [];

  return config;
};

export default comentariosFiltersConfig;
