/**
 * Utilidades para el módulo de perfiles
 * Funciones auxiliares para validaciones y transformaciones
 */

/**
 * Valida que los permisos de un perfil de trabajador sean correctos
 */
export const validateWorkerPermissions = (permisos) => {
  const prohibitedModules = ['permisos_usuarios', 'permisos_core'];
  const prohibitedLevels = ['EDIT', 'FULL'];
  
  for (const module of prohibitedModules) {
    if (permisos[module] && prohibitedLevels.includes(permisos[module])) {
      return {
        isValid: false,
        error: `Los trabajadores no pueden tener permisos ${permisos[module]} en ${module.replace('permisos_', '')}`
      };
    }
  }
  
  return { isValid: true };
};

/**
 * Obtiene los permisos efectivos de un usuario basándose en su perfil
 */
export const getEffectivePermissions = (usuario) => {
  if (!usuario.perfil) {
    return {
      eventos: 'NONE',
      chatbot: 'NONE',
      usuarios: 'NONE',
      core: 'NONE',
      notificaciones: 'NONE'
    };
  }
  
  return {
    eventos: usuario.perfil.permisos_eventos || 'NONE',
    chatbot: usuario.perfil.permisos_chatbot || 'NONE',
    usuarios: usuario.perfil.permisos_usuarios || 'NONE',
    core: usuario.perfil.permisos_core || 'NONE',
    notificaciones: usuario.perfil.permisos_notificaciones || 'NONE'
  };
};

/**
 * Verifica si un usuario puede realizar una acción específica
 */
export const canUserPerformAction = (usuario, module, action) => {
  const permissions = getEffectivePermissions(usuario);
  const userPermission = permissions[module];
  
  const actionLevels = {
    'view': ['VIEW', 'EDIT', 'FULL'],
    'edit': ['EDIT', 'FULL'],
    'delete': ['FULL'],
    'create': ['EDIT', 'FULL']
  };
  
  const requiredLevels = actionLevels[action] || [];
  return requiredLevels.includes(userPermission);
};

/**
 * Formatea los datos de un perfil para mostrar en la UI
 */
export const formatPerfilForDisplay = (perfil) => {
  return {
    ...perfil,
    tipo_acceso_display: getTipoAccesoDisplay(perfil.tipo_acceso),
    tipo_perfil_display: perfil.is_admin_profile ? 'Administrativo' : 'Trabajador',
    permisos_summary: getPermisosSummary(perfil)
  };
};

/**
 * Obtiene un resumen de permisos de un perfil
 */
export const getPermisosSummary = (perfil) => {
  const permisos = [
    { module: 'eventos', level: perfil.permisos_eventos },
    { module: 'chatbot', level: perfil.permisos_chatbot },
    { module: 'usuarios', level: perfil.permisos_usuarios },
    { module: 'core', level: perfil.permisos_core },
    { module: 'notificaciones', level: perfil.permisos_notificaciones }
  ];
  
  const activePermissions = permisos.filter(p => p.level !== 'NONE');
  const fullPermissions = activePermissions.filter(p => p.level === 'FULL').length;
  const editPermissions = activePermissions.filter(p => p.level === 'EDIT').length;
  const viewPermissions = activePermissions.filter(p => p.level === 'VIEW').length;
  
  return {
    total: activePermissions.length,
    full: fullPermissions,
    edit: editPermissions,
    view: viewPermissions,
    modules: activePermissions.map(p => p.module)
  };
};

/**
 * Obtiene el display text para tipo de acceso
 */
export const getTipoAccesoDisplay = (tipoAcceso) => {
  const tipos = {
    'WEB': 'Solo Web',
    'MOVIL': 'Solo Móvil',
    'AMBOS': 'Web y Móvil'
  };
  return tipos[tipoAcceso] || tipoAcceso;
};

/**
 * Obtiene el color CSS para un nivel de permiso
 */
export const getPermissionColor = (level) => {
  const colors = {
    'NONE': 'text-gray-400',
    'VIEW': 'text-yellow-600',
    'EDIT': 'text-orange-600',
    'FULL': 'text-red-600'
  };
  return colors[level] || 'text-gray-400';
};

/**
 * Genera un reporte de usuarios por perfil
 */
export const generateProfileReport = (perfiles, usuarios) => {
  return perfiles.map(perfil => {
    const usuariosDelPerfil = usuarios.filter(u => u.perfil?.id === perfil.id);
    
    return {
      perfil: perfil.nombre,
      total_usuarios: usuariosDelPerfil.length,
      usuarios_activos: usuariosDelPerfil.filter(u => u.is_active).length,
      usuarios_web: usuariosDelPerfil.filter(u => u.acceso_web_activo).length,
      usuarios_movil: usuariosDelPerfil.filter(u => u.acceso_movil_activo).length,
      permisos_summary: getPermisosSummary(perfil)
    };
  });
};