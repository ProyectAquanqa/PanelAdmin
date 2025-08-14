/**
 * Índice de componentes comunes reutilizables
 * Estos componentes mantienen consistencia en toda la aplicación
 */
 
export { default as DataViewSwitcher } from './DataViewSwitcher';
export { default as CustomDropdown } from './CustomDropdown';

// Componentes de Modal
export { default as Modal } from './Modal/Modal';
export { default as ConfirmModal } from './Modal/ConfirmModal';

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
  profileFiltersConfig,
  prepareProfileFiltersConfig,
  deviceFiltersConfig,
  prepareDeviceFiltersConfig,
} from './Filters';

// Componentes de permisos (Sistema dinámico)
export { 
  default as PermissionGate,
  AdminOnly,
  ContentManagerOnly,
  ChatbotManagerOnly,
  AccessDenied
} from './PermissionGate';