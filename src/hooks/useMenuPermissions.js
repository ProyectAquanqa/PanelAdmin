/**
 * Hook para manejar filtrado de menú basado en permisos del usuario
 * Implementa el sistema de permisos granulares para el UI
 */

import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getUserPermissions,
  getUserGroups,
  isAdmin,
  isWorkerOnly
} from '../services/permissionService';

/**
 * Mapeo dinámico de módulos del menú a permisos requeridos
 * Actualizado para funcionar con permisos dinámicos del sistema
 */
const MENU_PERMISSIONS_MAP = {
  // Dashboard - accesible para todos los usuarios autenticados
  dashboard: {
    view: [],  // Sin permisos específicos requeridos
    manage: []
  },

  // Eventos: cualquier permiso de eventos
  eventos: {
    view: [
      // Apps posibles: eventos, events
      'eventos.view_evento', 'events.view_evento',
      'eventos.view_categoria', 'events.view_categoria',
      'eventos.view_comentario', 'events.view_comentario',
      // Patrones dinámicos
      'evento', 'categoria', 'comentario'
    ],
    manage: [
      'eventos.add_evento', 'eventos.change_evento', 'eventos.delete_evento',
      'events.add_evento', 'events.change_evento', 'events.delete_evento',
      'eventos.add_categoria', 'eventos.change_categoria', 'eventos.delete_categoria',
      'events.add_categoria', 'events.change_categoria', 'events.delete_categoria'
    ]
  },

  // Chatbot: cualquier permiso de chatbot
  chatbot: {
    view: [
      // Apps posibles: chatbot
      'chatbot.view_chatbotknowledgebase', 'chatbot.view_chatbotcategory',
      'chatbot.view_chatconversation', 'chatbot.view_conversation',
      // Patrones dinámicos
      'chatbot', 'chatbotknowledgebase', 'chatbotcategory', 'conversation'
    ],
    manage: [
      'chatbot.add_chatbotknowledgebase', 'chatbot.change_chatbotknowledgebase', 'chatbot.delete_chatbotknowledgebase',
      'chatbot.add_chatbotcategory', 'chatbot.change_chatbotcategory', 'chatbot.delete_chatbotcategory',
      'chatbot.add_conversation', 'chatbot.change_conversation', 'chatbot.delete_conversation'
    ]
  },

  // Usuarios: cualquier permiso de usuarios, grupos, áreas, cargos
  usuarios: {
    view: [
      // Usuarios principales
      'users.view_user', 'users.view_usuario', 'auth.view_user',
      // Grupos/Perfiles
      'auth.view_group', 'users.view_group',
      // Áreas y Cargos (submódulos de usuarios)
      'areas.view_area', 'areas.view_cargo', 'cargos.view_cargo',
      // Patrones dinámicos
      'user', 'usuario', 'group', 'grupo', 'area', 'cargo'
    ],
    manage: [
      'users.add_user', 'users.change_user', 'users.delete_user',
      'auth.add_user', 'auth.change_user', 'auth.delete_user',
      'auth.add_group', 'auth.change_group', 'auth.delete_group',
      'areas.add_area', 'areas.change_area', 'areas.delete_area',
      'areas.add_cargo', 'areas.change_cargo', 'areas.delete_cargo'
    ]
  },

  // Perfiles (submódulo de usuarios)
  perfiles: {
    view: [
      'auth.view_group', 'users.view_group', 'group', 'grupo'
    ],
    manage: [
      'auth.add_group', 'auth.change_group', 'auth.delete_group',
      'users.add_group', 'users.change_group', 'users.delete_group'
    ]
  },

  // Áreas (submódulo de usuarios)
  areas: {
    view: [
      'areas.view_area', 'area'
    ],
    manage: [
      'areas.add_area', 'areas.change_area', 'areas.delete_area'
    ]
  },

  // Cargos (submódulo de usuarios)
  cargos: {
    view: [
      'areas.view_cargo', 'cargos.view_cargo', 'cargo'
    ],
    manage: [
      'areas.add_cargo', 'areas.change_cargo', 'areas.delete_cargo',
      'cargos.add_cargo', 'cargos.change_cargo', 'cargos.delete_cargo'
    ]
  },

  // Notificaciones: cualquier permiso de notificaciones o dispositivos
  notificaciones: {
    view: [
      // Apps posibles: notificaciones, notifications
      'notificaciones.view_notificacion', 'notifications.view_notification',
      'notificaciones.view_devicetoken', 'notifications.view_devicetoken',
      // Patrones dinámicos
      'notificacion', 'notification', 'devicetoken', 'device'
    ],
    manage: [
      'notificaciones.add_notificacion', 'notificaciones.change_notificacion', 'notificaciones.delete_notificacion',
      'notifications.add_notification', 'notifications.change_notification', 'notifications.delete_notification',
      'notificaciones.add_devicetoken', 'notificaciones.change_devicetoken', 'notificaciones.delete_devicetoken'
    ]
  },

  // Almuerzos
  almuerzos: {
    view: [
      'almuerzos.view_almuerzo', 'almuerzo'
    ],
    manage: [
      'almuerzos.add_almuerzo', 'almuerzos.change_almuerzo', 'almuerzos.delete_almuerzo'
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
   * Funciona con permisos exactos y patrones dinámicos
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

    // Verificar coincidencias exactas primero
    const hasExactMatch = requiredPermissions.some(permission =>
      allowedCodenames.includes(permission)
    );

    if (hasExactMatch) return true;

    // Verificar patrones dinámicos - si el usuario tiene permisos que contienen los patrones
    const hasPatternMatch = requiredPermissions.some(requiredPattern => {
      return allowedCodenames.some(userPermission => {
        // Si el patrón requerido es solo una palabra (como 'evento'), buscar en permisos del usuario
        if (!requiredPattern.includes('.')) {
          return userPermission.includes(requiredPattern);
        }
        // Si es formato app.action_model, hacer coincidencia parcial
        const [requiredApp, requiredAction] = requiredPattern.split('.');
        return userPermission.includes(requiredApp) && (requiredAction ? userPermission.includes(requiredAction) : true);
      });
    });

    return hasPatternMatch;
  }, [isAuthenticated, getAllowedCodenames]);

  /**
   * Verifica si el usuario puede ver un módulo específico
   */
  const canViewModule = useMemo(() => (moduleName) => {
    const modulePerms = MENU_PERMISSIONS_MAP[moduleName];
    if (!modulePerms) {
      return false;
    }

    const hasPermission = hasAnyPermission(modulePerms.view);

    return hasPermission;
  }, [hasAnyPermission, getAllowedCodenames]);

  /**
   * Verifica si el usuario puede gestionar (add/change/delete) un módulo
   */
  const canManageModule = useMemo(() => (moduleName) => {
    const modulePerms = MENU_PERMISSIONS_MAP[moduleName];
    if (!modulePerms) return false;

    return hasAnyPermission(modulePerms.manage);
  }, [hasAnyPermission]);

  /**
   * Verifica si el usuario puede gestionar perfiles (crear, editar, eliminar grupos)
   * LÓGICA INDEPENDIENTE del sidebar - para gestión de perfiles
   */
  const canManageProfiles = useMemo(() => {
    if (!isAuthenticated) return false;

    // Superusuario siempre puede
    if (getAllowedCodenames.includes('*')) return true;

    const userGroups = getUserGroups();
    const allowedCodenames = getAllowedCodenames;

    // Verificar grupos específicos que pueden gestionar perfiles
    const profileManagerGroups = [
      'SUPER_ADMIN_WEB',
      'ADMIN_WEB',
      'Administrador',
      'Admin'
    ];

    if (userGroups && userGroups.length > 0) {
      const canManageByGroup = userGroups.some(group => {
        const groupName = typeof group === 'object' ? group.name : group;
        return profileManagerGroups.includes(groupName) ||
          groupName.includes('ADMIN') ||
          groupName.includes('SUPER');
      });

      if (canManageByGroup) {
        return true;
      }
    }

    // Verificar permisos específicos de gestión de grupos
    const profileManagementPermissions = [
      'auth.add_group', 'auth.change_group', 'auth.delete_group',
      'users.add_group', 'users.change_group', 'users.delete_group'
    ];

    const hasProfilePermissions = profileManagementPermissions.some(perm =>
      allowedCodenames.includes(perm) ||
      allowedCodenames.some(userPerm => userPerm.includes('group'))
    );

    if (hasProfilePermissions) {
      return true;
    }

    return false;
  }, [isAuthenticated, getAllowedCodenames]);

  /**
   * Determina si el usuario debe tener acceso restringido (solo trabajador)
   * LÓGICA ACTUALIZADA para reconocer mejor los grupos administrativos
   */
  const isRestrictedUser = useMemo(() => {
    if (!isAuthenticated || !user) return true;

    // Los superusuarios no están restringidos
    if (user.is_superuser || user.isSuperuser) return false;

    // Los usuarios con is_staff tampoco están restringidos
    if (user.is_staff) return false;

    const userGroups = getUserGroups();
    const allowedCodenames = getAllowedCodenames;

    // Grupos que indican usuarios administrativos (incluir SUPER_ADMIN_WEB)
    const adminGroups = [
      'Administrador de Contenido',
      'Editor de Contenido',
      'Gestor de Chatbot',
      'Admin',
      'Administrador',
      'SUPER_ADMIN_WEB',
      'ADMIN_WEB',
      'GESTOR_CONTENIDO',
      'MODERADOR'
    ];

    // Verificar si tiene algún grupo administrativo
    if (userGroups && userGroups.length > 0) {
      const hasAdminGroup = userGroups.some(group => {
        const groupName = typeof group === 'object' ? group.name : group;
        return adminGroups.includes(groupName) || groupName.includes('ADMIN') || groupName.includes('SUPER');
      });

      if (hasAdminGroup) {
        return false;
      }
    }

    // Si no tiene ningún permiso, es trabajador restringido
    if (!allowedCodenames || allowedCodenames.length === 0) {
      return true;
    }

    // **LÓGICA MEJORADA**: Si tiene muchos permisos (más de 3), probablemente es admin
    if (allowedCodenames.length > 3) {
      return false;
    }

    // Verificar si tiene permisos administrativos específicos
    const hasAdminPermissions = allowedCodenames.some(perm =>
      perm.includes('add_') || perm.includes('change_') || perm.includes('delete_') ||
      perm.includes('group') || perm.includes('user') || perm.includes('admin')
    );

    if (hasAdminPermissions) {
      return false;
    }

    // Permisos básicos que indican trabajador
    const basicWorkerPermissions = [
      'almuerzos.view_almuerzo',
      'auth.view_user'
    ];

    // Si solo tiene permisos básicos de trabajador, es restringido
    const hasOnlyBasicPerms = allowedCodenames.every(perm =>
      basicWorkerPermissions.some(basic => perm.includes(basic.split('.')[1]))
    );

    if (hasOnlyBasicPerms) {
      return true;
    }

    // Por defecto, si tiene permisos no básicos, no es restringido
    return false;
  }, [isAuthenticated, user, getAllowedCodenames]);

  /**
   * Filtra elementos del menú basado en permisos
   */
  const filterMenuByPermissions = useMemo(() => (menuItems) => {
    if (!isAuthenticated) return [];

    return menuItems.map(item => {
      // Crear una copia del item para no mutar el original
      const filteredItem = { ...item };

      // Mapear rutas principales a módulos - ACTUALIZADO
      const getModuleFromPath = (path) => {
        if (path === '/') return 'dashboard';

        // Módulos principales
        if (path.startsWith('/eventos')) return 'eventos';
        if (path.startsWith('/chatbot')) return 'chatbot';
        if (path.startsWith('/usuarios')) {
          // Submódulos específicos de usuarios
          if (path === '/usuarios/perfiles') return 'perfiles';
          if (path === '/usuarios/areas') return 'areas';
          if (path === '/usuarios/cargos') return 'cargos';
          if (path === '/usuarios/gestion') return 'usuarios';
          return 'usuarios'; // Por defecto usuarios
        }
        if (path.startsWith('/notificaciones')) return 'notificaciones';
        if (path.startsWith('/almuerzos')) return 'almuerzos';

        // Ya no mapeamos configuración ni permisos (fueron eliminados)

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

          // Aplicar restricciones para trabajadores en submenús
          if (isRestrictedUser) {
            const allowedForWorkers = ['dashboard'];

            // Permitir almuerzos solo si tienen permisos específicos
            if (subModuleName === 'almuerzos' && canViewModule('almuerzos')) {
              allowedForWorkers.push('almuerzos');
            }

            const isAllowed = allowedForWorkers.includes(subModuleName);
            return isAllowed;
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
    canManageProfiles,
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


