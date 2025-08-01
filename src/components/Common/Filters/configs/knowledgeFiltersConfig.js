/**
 * Configuración de filtros para KnowledgeBase
 * Configuración declarativa para UniversalFilters
 */

/**
 * Configuración de filtros para la página de Knowledge Base
 */
export const knowledgeFiltersConfig = {
  // Configuración de búsqueda
  searchConfig: {
    key: 'searchTerm',
    placeholder: 'Buscar preguntas, respuestas o palabras clave...',
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
      key: 'selectedEmbedding',
      title: 'Inteligencia Artificial',
      type: 'buttons',
      options: [
        { value: '', label: 'Todos' },
        { value: 'with', label: 'Con IA' },
        { value: 'without', label: 'Sin IA' }
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
      label: 'IA',
      variant: 'secondary',
      icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
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
  itemLabel: 'registros'
};

/**
 * Función helper para preparar la configuración con datos dinámicos
 */
export const prepareKnowledgeFiltersConfig = (categories, handlers) => {
  const config = { ...knowledgeFiltersConfig };
  
  // Agregar categorías dinámicamente
  config.filterGroups[0].options = [
    { value: '', label: 'Todas las categorías' },
    ...categories.map(category => ({ 
      value: category.id.toString(), 
      label: category.name 
    }))
  ];
  
  // Asignar handlers dinámicamente
  config.actions[0].onClick = handlers.onCreateNew;
  config.actions[1].onClick = handlers.onRegenerateEmbeddings;
  config.actions[2].onClick = handlers.onBulkImport;
  
  return config;
};

export default knowledgeFiltersConfig;