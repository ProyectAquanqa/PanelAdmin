/**
 * Exportaciones de componentes y configuraciones de filtros
 */

export { default as UniversalFilters } from './UniversalFilters';

// Configuraciones
export { 
  knowledgeFiltersConfig, 
  prepareKnowledgeFiltersConfig 
} from './configs/knowledgeFiltersConfig';

export { 
  categoryFiltersConfig, 
  prepareCategoryFiltersConfig,
  eventCategoryFiltersConfig,
  prepareEventCategoryFiltersConfig
} from './configs/categoryFiltersConfig';

export { 
  conversationFiltersConfig, 
  prepareConversationFiltersConfig 
} from './configs/conversationFiltersConfig';

export { 
  userFiltersConfig, 
  prepareUserFiltersConfig 
} from './configs/userFiltersConfig';