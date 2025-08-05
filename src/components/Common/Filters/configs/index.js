/**
 * Punto de entrada para configuraciones de filtros
 * Exporta todas las configuraciones de filtros de los diferentes módulos
 */

export { default as userFiltersConfig } from './userFiltersConfig';
export { default as conversationFiltersConfig } from './conversationFiltersConfig';
export { 
  knowledgeFiltersConfig, 
  prepareKnowledgeFiltersConfig 
} from './knowledgeFiltersConfig';
export { default as categoryFiltersConfig } from './categoryFiltersConfig';
export { 
  eventosFiltersConfig,
  prepareEventosFiltersConfig
} from './eventosFiltersConfig';