/**
 * Utilidades para debug y testing del sistema de permisos
 * Solo para desarrollo - remover en producción
 */

import { getUserPermissions, getUserGroups } from '../services/permissionService';

/**
 * Muestra información de debug sobre los permisos del usuario actual
 */
export const debugUserPermissions = () => {
  const permissions = getUserPermissions();
  const groups = getUserGroups();
  
  console.group('DEBUG: Permisos del Usuario');
  console.log('Permisos:', permissions);
  console.log('Grupos:', groups);
  console.log('Total permisos:', permissions.length);
  console.log('Total grupos:', groups.length);
  
  // Mostrar permisos por aplicación
  const permsByApp = {};
  permissions.forEach(perm => {
    const [app, ...rest] = perm.split('.');
    if (!permsByApp[app]) permsByApp[app] = [];
    permsByApp[app].push(rest.join('.'));
  });
  
  console.log('Permisos por aplicación:', permsByApp);
  console.groupEnd();
  
  return { permissions, groups, permsByApp };
};

/**
 * Simula diferentes tipos de usuario para testing
 */
export const simulateUserType = (userType) => {
  const simulations = {
    superuser: {
      permissions: ['*'],
      groups: ['Admin'],
      is_superuser: true,
      is_staff: true
    },
    admin: {
      permissions: [
        'eventos.view_evento', 'eventos.add_evento', 'eventos.change_evento', 'eventos.delete_evento',
        'chatbot.view_chatbotknowledgebase', 'chatbot.add_chatbotknowledgebase',
        'users.view_usuario', 'users.add_usuario', 'users.change_usuario',
        'auth.view_group', 'auth.change_group'
      ],
      groups: ['Administrador de Contenido'],
      is_superuser: false,
      is_staff: true
    },
    editor: {
      permissions: [
        'eventos.view_evento', 'eventos.add_evento', 'eventos.change_evento',
        'chatbot.view_chatbotknowledgebase', 'chatbot.add_chatbotknowledgebase'
      ],
      groups: ['Editor de Contenido'],
      is_superuser: false,
      is_staff: false
    },
    chatbot_manager: {
      permissions: [
        'chatbot.view_chatbotknowledgebase', 'chatbot.add_chatbotknowledgebase', 
        'chatbot.change_chatbotknowledgebase', 'chatbot.delete_chatbotknowledgebase'
      ],
      groups: ['Gestor de Chatbot'],
      is_superuser: false,
      is_staff: false
    },
    worker: {
      permissions: ['almuerzos.view_almuerzo'],
      groups: ['Trabajador'],
      is_superuser: false,
      is_staff: false
    },
    worker_no_perms: {
      permissions: [],
      groups: ['Trabajador'],
      is_superuser: false,
      is_staff: false
    }
  };
  
  const simulation = simulations[userType];
  if (!simulation) {
    console.error('Tipo de usuario no válido:', userType);
    return;
  }
  
  // Simular guardado en localStorage
  localStorage.setItem('user_permissions', JSON.stringify(simulation.permissions));
  localStorage.setItem('user_groups', JSON.stringify(simulation.groups.map(name => ({ name }))));
  localStorage.setItem('user', JSON.stringify({
    username: `test_${userType}`,
    is_superuser: simulation.is_superuser,
    is_staff: simulation.is_staff,
    permissions: simulation.permissions,
    groups: simulation.groups
  }));
  
  console.log(`Simulando usuario tipo: ${userType}`, simulation);
  console.log('Recarga la página para ver los cambios en el menú');
  
  return simulation;
};

/**
 * Restaura los permisos reales del usuario
 */
export const restoreRealPermissions = () => {
  console.log('Restaurando permisos reales...');
  // Simplemente recarga la página para obtener datos reales del servidor
  window.location.reload();
};

/**
 * Exporta funciones para uso en consola del navegador
 */
if (typeof window !== 'undefined') {
  window.debugPermissions = {
    debug: debugUserPermissions,
    simulate: simulateUserType,
    restore: restoreRealPermissions,
    help: () => {
      console.log(`
Utilidades de Debug de Permisos

Funciones disponibles:
- debugPermissions.debug() - Muestra información actual del usuario
- debugPermissions.simulate('userType') - Simula un tipo de usuario
- debugPermissions.restore() - Restaura permisos reales

Tipos de usuario para simular:
- 'superuser' - Usuario con todos los permisos
- 'admin' - Administrador de contenido
- 'editor' - Editor de contenido
- 'chatbot_manager' - Gestor de chatbot
- 'worker' - Trabajador con permisos de almuerzos
- 'worker_no_perms' - Trabajador sin permisos

Ejemplo:
debugPermissions.simulate('worker');
      `);
    }
  };
}

export default {
  debugUserPermissions,
  simulateUserType,
  restoreRealPermissions
};
