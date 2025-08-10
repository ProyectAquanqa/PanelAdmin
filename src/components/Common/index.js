/**
 * Índice de componentes comunes reutilizables
 * Estos componentes mantienen consistencia en toda la aplicación
 */
 
export { default as DataViewSwitcher } from './DataViewSwitcher';
export { default as CustomDropdown } from './CustomDropdown';

// Componentes de Modal
export { default as Modal } from './Modal/Modal';

// Componentes de DataView
export { 
  TableView,
  SortIcon,
  Pagination
} from './DataView';

// Filtros universales
export { 
  UniversalFilters,
  knowledgeFiltersConfig,
  prepareKnowledgeFiltersConfig,
  categoryFiltersConfig,
  prepareCategoryFiltersConfig,
  conversationFiltersConfig,
  prepareConversationFiltersConfig,
  userFiltersConfig,
  prepareUserFiltersConfig,
} from './Filters';