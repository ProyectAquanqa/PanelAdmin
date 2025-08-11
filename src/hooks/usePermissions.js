/**
 * Hook personalizado para manejar permisos en componentes React
 * Integra con el nuevo sistema de permisos dinámicos de AquanQ
 */

import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  hasPermission,
  canPerform,
  isInGroup,
  isAdmin,
  isContentManager,
  isChatbotManager,
  isWorkerOnly,
  getEventCapabilities,
  getUserCapabilities,
  getChatbotCapabilities,
  getUserCapabilitiesSummary
} from '../services/permissionService';

/**
 * Hook principal de permisos
 * @returns {Object} Objeto con funciones y capacidades de permisos
 */
export const usePermissions = () => {
  const { user } = useAuth();

  // Memoizar las capacidades para evitar recálculos innecesarios
  const capabilities = useMemo(() => {
    if (!user) {
      return {
        events: {},
        users: {},
        chatbot: {},
        groups: {},
        general: {}
      };
    }

    return getUserCapabilitiesSummary();
  }, [user]);

  // Funciones de verificación de permisos
  const permissions = useMemo(() => ({
    // Funciones básicas
    hasPermission,
    canPerform,
    isInGroup,
    
    // Verificaciones de roles
    isAdmin: isAdmin(),
    isContentManager: isContentManager(),
    isChatbotManager: isChatbotManager(),
    isWorkerOnly: isWorkerOnly(),
    
    // Capacidades por módulo
    events: capabilities.events,
    users: capabilities.users,
    chatbot: capabilities.chatbot,
    
    // Estado del usuario
    isAuthenticated: !!user,
    userGroups: user?.groups || [],
    userPermissions: user?.permissions || [],
  }), [user, capabilities]);

  return permissions;
};

/**
 * Hook específico para permisos de eventos
 * @returns {Object} Capacidades específicas de eventos
 */
export const useEventPermissions = () => {
  const { user } = useAuth();
  
  return useMemo(() => {
    if (!user) return {};
    return getEventCapabilities();
  }, [user]);
};

/**
 * Hook específico para permisos de usuarios
 * @returns {Object} Capacidades específicas de usuarios
 */
export const useUserPermissions = () => {
  const { user } = useAuth();
  
  return useMemo(() => {
    if (!user) return {};
    return getUserCapabilities();
  }, [user]);
};

/**
 * Hook específico para permisos de chatbot
 * @returns {Object} Capacidades específicas de chatbot
 */
export const useChatbotPermissions = () => {
  const { user } = useAuth();
  
  return useMemo(() => {
    if (!user) return {};
    return getChatbotCapabilities();
  }, [user]);
};

/**
 * Hook para verificar una condición de permiso específica
 * @param {string|Function} condition - Permiso o función de verificación
 * @returns {boolean} True si se cumple la condición
 */
export const useHasPermission = (condition) => {
  const { user } = useAuth();
  
  return useMemo(() => {
    if (!user) return false;
    
    if (typeof condition === 'function') {
      return condition();
    }
    
    if (typeof condition === 'string') {
      return hasPermission(condition);
    }
    
    return false;
  }, [user, condition]);
};

/**
 * Hook para verificar si el usuario puede realizar una acción en un modelo
 * @param {string} model - Nombre del modelo
 * @param {string} action - Acción a verificar
 * @returns {boolean} True si puede realizar la acción
 */
export const useCanPerform = (model, action) => {
  const { user } = useAuth();
  
  return useMemo(() => {
    if (!user) return false;
    return canPerform(model, action);
  }, [user, model, action]);
};

/**
 * Hook para verificar membresía en grupo
 * @param {string} groupName - Nombre del grupo
 * @returns {boolean} True si pertenece al grupo
 */
export const useIsInGroup = (groupName) => {
  const { user } = useAuth();
  
  return useMemo(() => {
    if (!user) return false;
    return isInGroup(groupName);
  }, [user, groupName]);
};

/**
 * Hook de conveniencia para verificaciones comunes de rol
 * @returns {Object} Objeto con verificaciones de roles comunes
 */
export const useUserRole = () => {
  const { user } = useAuth();
  
  return useMemo(() => ({
    isAdmin: isAdmin(),
    isContentManager: isContentManager(),
    isChatbotManager: isChatbotManager(),
    isWorkerOnly: isWorkerOnly(),
    groups: user?.groups || [],
    hasAnyRole: (user?.groups || []).length > 0,
  }), [user]);
};

export default usePermissions;
