/**
 * Índice de componentes de Perfiles
 * Exporta todos los componentes del módulo para fácil importación
 */

export { default as PerfilModal } from './PerfilModal';
export { default as PerfilTableView } from './PerfilTableView';
export { default as PerfilFilters } from './PerfilFilters';

// Re-exportar el servicio para conveniencia
export { perfilesService } from '../../services/perfilesService';