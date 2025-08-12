/**
 * Exportaciones del módulo de Almuerzos
 * Punto de entrada centralizado para todos los componentes de almuerzos
 */

export { default as AlmuerzoList } from './AlmuerzoList';
export { default as AlmuerzoTableView } from './AlmuerzoTableView';
export { default as AlmuerzoFilters } from './AlmuerzoFilters';
export { default as AlmuerzoModal } from './AlmuerzoModal';
export * as LoadingStates from './LoadingStates';

// Re-exportar componentes específicos para facilidad de uso
export {
  TableSkeleton,
  InlineLoader,
  ModalLoader,
  ButtonLoader
} from './LoadingStates';
