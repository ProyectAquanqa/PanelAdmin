/**
 * Exportaciones principales del módulo de Cargos
 * Siguiendo el patrón del módulo de Areas
 */

// Componentes principales
export { default as CargoActions } from './CargoActions';
export { default as CargoList } from './CargoList';
export { default as CargoModal } from './CargoModal';
export { default as CargoDetailModal } from './CargoDetailModal';

// Componentes de vista
export { default as CargoTableView } from './CargoTableView';

// Estados de carga
export * as LoadingStates from './LoadingStates';
