/**
 * Barrel export para componentes de Notificaciones
 * Sigue el patrón establecido en otros módulos
 */

export { default as NotificationActions } from './NotificationActions';
export { default as NotificationList } from './NotificationList';
export { default as NotificationModal } from './NotificationModal';
export { default as NotificationDetailModal } from './NotificationDetailModal';
export { default as LoadingStates } from './LoadingStates';

// Exportación por defecto para conveniencia
import NotificationActionsComponent from './NotificationActions';
import NotificationListComponent from './NotificationList';
import NotificationModalComponent from './NotificationModal';
import NotificationDetailModalComponent from './NotificationDetailModal';
import LoadingStatesComponent from './LoadingStates';

export default {
  NotificationActions: NotificationActionsComponent,
  NotificationList: NotificationListComponent,
  NotificationModal: NotificationModalComponent,
  NotificationDetailModal: NotificationDetailModalComponent,
  LoadingStates: LoadingStatesComponent
};
