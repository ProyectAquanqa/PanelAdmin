/**
 * Hook para manejar filtrado de menú basado en permisos del usuario
 * Implementa el sistema de permisos granulares para el UI
 */

import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import permissionService, { 
  getUserPermissions, 
  getUserGroups, 
  isAdmin, 
  isWorkerOnly 
} from '../services/permissionService';

/**
 * Mapeo de módulos del menú a permisos requeridos
 * Cada módulo puede requerir uno o varios permisos (OR lógico)
 */
const MENU_PERMISSIONS_MAP = {
  // Dashboard - accesible para todos los usuarios autenticados
  dashboard: {
    view: [],  // Sin permisos específicos requeridos
    manage: []
  },
  
  // Eventos: requires alguno de eventos.view_evento o eventos.view_categoria
  eventos: {
    view: [
      'eventos.view_evento',
      'eventos.view_categoria',
      'eventos.view_comentario'
    ],
    manage: [
      'eventos.add_evento',
      'eventos.change_evento', 
      'eventos.delete_evento',
      'eventos.add_categoria',
      'eventos.change_categoria',
      'eventos.delete_categoria',
      'eventos.add_comentario',
      'eventos.change_comentario',
      'eventos.delete_comentario'
    ]
  },
  
  // Chatbot: requires chatbot.view_chatbotknowledgebase o similares
  chatbot: {
    view: [
      'chatbot.view_chatbotknowledgebase',
      'chatbot.view_chatbotcategory',
      'chatbot.view_chatconversation'
    ],
    manage: [
      'chatbot.add_chatbotknowledgebase',
      'chatbot.change_chatbotknowledgebase',
      'chatbot.delete_chatbotknowledgebase',
      'chatbot.add_chatbotcategory',
      'chatbot.change_chatbotcategory',
      'chatbot.delete_chatbotcategory'
    ]
  },
  
  // Usuarios: requires users.view_usuario
  usuarios: {
    view: [
      'users.view_usuario',
      'auth.view_user'  // Fallback para diferentes implementaciones
    ],
    manage: [
      'users.add_usuario',
      'users.change_usuario',
      'users.delete_usuario',
      'auth.add_user',
      'auth.change_user',
      'auth.delete_user'
    ]
  },
  
  // Perfiles (grupos): requires auth.view_group
  perfiles: {
    view: [
      'auth.view_group',
      'users.view_group'
    ],
    manage: [
      'auth.add_group',
      'auth.change_group',
      'auth.delete_group',
      'users.add_group', 
      'users.change_group',
      'users.delete_group'
    ]
  },
  
  // Areas: generalmente parte de usuarios
  areas: {
    view: [
      'areas.view_area',
      'areas.view_cargo',
      'users.view_area'
    ],
    manage: [
      'areas.add_area',
      'areas.change_area',
      'areas.delete_area',
      'areas.add_cargo',
      'areas.change_cargo',
      'areas.delete_cargo'
    ]
  },
  
  // Notificaciones: requires notificaciones.view_notificacion
  notificaciones: {
    view: [
      'notificaciones.view_notificacion',
      'notifications.view_notification'
    ],
    manage: [
      'notificaciones.add_notificacion',
      'notificaciones.change_notificacion',
      'notificaciones.delete_notificacion'
    ]
  },
  
  // Almuerzos
  almuerzos: {
    view: [
      'almuerzos.view_almuerzo'
    ],
    manage: [
      'almuerzos.add_almuerzo',
      'almuerzos.change_almuerzo',
      'almuerzos.delete_almuerzo'
    ]
  },
  
  // Configuración - generalmente solo administradores
  configuracion: {
    view: [
      'admin.view_settings',
      'core.view_settings'
    ],
    manage: [
      'admin.change_settings',
      'core.change_settings'
    ]
  },
  
  // Permisos - solo administradores
  permisos: {
    view: [
      'auth.view_permission',
      'admin.view_permission'
    ],
    manage: [
      'auth.change_permission',
      'admin.change_permission'
    ]
  }
};

/**
 * Hook principal para manejar permisos del menú
 */
export const useMenuPermissions = () => {
  const { user, isAuthenticated } = useAuth();
  
  /**
   * Obtiene los codenames de permisos permitidos para el usuario actual
   */
  const getAllowedCodenames = useMemo(() => {
    if (!isAuthenticated || !user) {
      return [];
    }
    
    // Si es superusuario, tiene todos los permisos
    if (user.is_superuser || user.isSuperuser) {
      return ['*']; // Wildcard para todos los permisos
    }
    
    // Obtener permisos desde localStorage (ya configurados en AuthContext)
    const permissions = getUserPermissions();
    return permissions || [];
  }, [isAuthenticated, user]);
  
  /**
   * Verifica si el usuario tiene al menos uno de los permisos requeridos
   */
  const hasAnyPermission = useMemo(() => (requiredPermissions = []) => {
    if (!isAuthenticated) return false;
    
    // Si no se requieren permisos específicos, permite acceso
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    
    const allowedCodenames = getAllowedCodenames;
    
    // Superusuario tiene acceso a todo
    if (allowedCodenames.includes('*')) {
      return true;
    }
    
    // Verificar si tiene al menos uno de los permisos requeridos
    return requiredPermissions.some(permission => 
      allowedCodenames.includes(permission)
    );
  }, [isAuthenticated, getAllowedCodenames]);
  
  /**
   * Verifica si el usuario puede ver un módulo específico
   */
  const canViewModule = useMemo(() => (moduleName) => {
    const modulePerms = MENU_PERMISSIONS_MAP[moduleName];
    if (!modulePerms) return false;
    
    return hasAnyPermission(modulePerms.view);
  }, [hasAnyPermission]);
  
  /**
   * Verifica si el usuario puede gestionar (add/change/delete) un módulo
   */
  const canManageModule = useMemo(() => (moduleName) => {
    const modulePerms = MENU_PERMISSIONS_MAP[moduleName];
    if (!modulePerms) return false;
    
    return hasAnyPermission(modulePerms.manage);
  }, [hasAnyPermission]);
  
  /**
   * Determina si el usuario debe tener acceso restringido (solo trabajador)
   * Basado en el sistema de grupos definido en el backend
   */
  const isRestrictedUser = useMemo(() => {
    if (!isAuthenticated || !user) return true;
    
    // Los superusuarios no están restringidos
    if (user.is_superuser || user.isSuperuser) return false;
    
    // Los usuarios con is_staff tampoco están restringidos
    if (user.is_staff) return false;
    
    const userGroups = getUserGroups();
    
    // Si no tiene grupos, está restringido
    if (!userGroups || userGroups.length === 0) return true;
    
    // Grupos que indican usuarios administrativos (no restringidos)
    const adminGroups = [
      'Administrador de Contenido',
      'Editor de Contenido', 
      'Gestor de Chatbot',
      'Admin',
      'Administrador'
    ];
    
    // Grupos que indican usuarios restringidos (trabajadores)
    const workerGroups = [
      'Trabajador',
      'Worker',
      'Empleado'
    ];
    
    // Verificar si tiene algún grupo administrativo
    const hasAdminGroup = userGroups.some(group => {
      const groupName = typeof group === 'object' ? group.name : group;
      return adminGroups.includes(groupName);
    });
    
    if (hasAdminGroup) return false;
    
    // Verificar si es solo trabajador
    const isOnlyWorker = userGroups.every(group => {
      const groupName = typeof group === 'object' ? group.name : group;
      return workerGroups.includes(groupName);
    });
    
    return isOnlyWorker;
  }, [isAuthenticated, user]);
  
  /**
   * Filtra elementos del menú basado en permisos
   */
  const filterMenuByPermissions = useMemo(() => (menuItems) => {
    if (!isAuthenticated) return [];
    
    return menuItems.map(item => {
      // Crear una copia del item para no mutar el original
      const filteredItem = { ...item };
      
      // Mapear rutas principales a módulos
      const getModuleFromPath = (path) => {
        if (path === '/') return 'dashboard';
        if (path.startsWith('/eventos')) return 'eventos';
        if (path.startsWith('/chatbot')) return 'chatbot';
        if (path.startsWith('/usuarios')) return 'usuarios';
        if (path.startsWith('/notificaciones')) return 'notificaciones';
        if (path.startsWith('/almuerzos')) return 'almuerzos';
        if (path.startsWith('/configuracion')) return 'configuracion';
        if (path.startsWith('/permisos')) return 'permisos';
        
        // Mapeos específicos para submenús
        if (path === '/usuarios/perfiles') return 'perfiles';
        if (path === '/usuarios/areas') return 'areas';
        
        return null;
      };
      
      const moduleName = getModuleFromPath(item.path);
      
      // Si no hay módulo mapeado, permitir por defecto
      if (!moduleName) {
        return filteredItem;
      }
      
      // Para usuarios restringidos (trabajadores), aplicar restricciones estrictas
      if (isRestrictedUser) {
        // Los trabajadores solo pueden acceder a dashboard y almuerzos
        // Dashboard siempre disponible, almuerzos solo si tienen permisos
        const allowedForWorkers = ['dashboard'];
        
        // Permitir almuerzos solo si tienen permisos específicos
        if (moduleName === 'almuerzos' && canViewModule('almuerzos')) {
          allowedForWorkers.push('almuerzos');
        }
        
        if (!allowedForWorkers.includes(moduleName)) {
          return null; // Filtrar este item
        }
      }
      
      // Verificar permisos de visualización del módulo principal
      if (!canViewModule(moduleName)) {
        return null; // Filtrar este item
      }
      
      // Si el item tiene submenú, filtrar también los elementos del submenú
      if (item.submenu && Array.isArray(item.submenu)) {
        const filteredSubmenu = item.submenu.filter(subItem => {
          const subModuleName = getModuleFromPath(subItem.path);
          
          if (!subModuleName) return true; // Permitir si no está mapeado
          
          // Aplicar restricciones para trabajadores
          if (isRestrictedUser) {
            const allowedForWorkers = ['dashboard'];
            
            // Permitir almuerzos solo si tienen permisos específicos
            if (subModuleName === 'almuerzos' && canViewModule('almuerzos')) {
              allowedForWorkers.push('almuerzos');
            }
            
            return allowedForWorkers.includes(subModuleName);
          }
          
          return canViewModule(subModuleName);
        });
        
        // Solo incluir el item principal si tiene submenús válidos o si es accesible por sí mismo
        if (filteredSubmenu.length > 0) {
          filteredItem.submenu = filteredSubmenu;
        } else if (item.submenu.length > 0) {
          // Si tenía submenú pero se filtró todo, no mostrar el item principal
          return null;
        }
      }
      
      return filteredItem;
    }).filter(Boolean); // Remover items null
  }, [isAuthenticated, isRestrictedUser, canViewModule]);
  
  return {
    // Funciones de verificación
    canViewModule,
    canManageModule,
    hasAnyPermission,
    
    // Estados del usuario
    isRestrictedUser,
    getAllowedCodenames,
    
    // Función de filtrado
    filterMenuByPermissions,
    
    // Información del usuario
    userGroups: getUserGroups(),
    userPermissions: getAllowedCodenames,
    isAdmin: isAdmin(),
    isWorkerOnly: isWorkerOnly()
  };
};

export default useMenuPermissions;
