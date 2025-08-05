/**
 * Servicio para gestión de perfiles
 * Maneja todas las operaciones CRUD para el módulo de perfiles
 */

import apiClient from '../api/apiClient';

export const perfilesService = {
  // ========== CRUD BÁSICO ==========
  
  /**
   * Obtener lista de perfiles con filtros y paginación
   */
  async getPerfiles(params = {}) {
    try {
      const response = await apiClient.get('/api/perfiles/', { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener perfiles'
      };
    }
  },

  /**
   * Obtener un perfil específico por ID
   */
  async getPerfil(id) {
    try {
      const response = await apiClient.get(`/api/perfiles/${id}/`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener perfil'
      };
    }
  },

  /**
   * Crear un nuevo perfil
   */
  async createPerfil(perfilData) {
    try {
      const response = await apiClient.post('/api/perfiles/', perfilData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Error al crear perfil'
      };
    }
  },

  /**
   * Actualizar un perfil existente
   */
  async updatePerfil(id, perfilData) {
    try {
      const response = await apiClient.put(`/api/perfiles/${id}/`, perfilData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Error al actualizar perfil'
      };
    }
  },

  /**
   * Eliminar un perfil
   */
  async deletePerfil(id) {
    try {
      await apiClient.delete(`/api/perfiles/${id}/`);
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al eliminar perfil'
      };
    }
  },

  // ========== ACCIONES ESPECÍFICAS ==========

  /**
   * Obtener usuarios asignados a un perfil
   */
  async getUsuariosPerfil(perfilId) {
    try {
      const response = await apiClient.get(`/api/perfiles/${perfilId}/usuarios/`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener usuarios del perfil'
      };
    }
  },

  /**
   * Obtener estadísticas de perfiles
   */
  async getEstadisticasPerfiles() {
    try {
      const response = await apiClient.get('/api/perfiles/estadisticas/');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener estadísticas'
      };
    }
  },

  /**
   * Activar/Desactivar un perfil
   */
  async togglePerfilActive(id, isActive) {
    try {
      const response = await apiClient.patch(`/api/perfiles/${id}/toggle_active/`, {
        is_active: isActive
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al cambiar estado del perfil'
      };
    }
  },

  // ========== HELPERS Y UTILITIES ==========

  /**
   * Validar datos de perfil antes del envío
   */
  validatePerfilData(perfilData) {
    const errors = {};

    // Validar nombre
    if (!perfilData.nombre || perfilData.nombre.trim().length < 3) {
      errors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    // Validar descripción
    if (!perfilData.descripcion || perfilData.descripcion.trim().length < 10) {
      errors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }

    // Validar tipo de perfil
    if (!perfilData.is_admin_profile && !perfilData.is_worker_profile) {
      errors.tipo_perfil = 'Debe seleccionar si es perfil administrativo o de trabajador';
    }

    if (perfilData.is_admin_profile && perfilData.is_worker_profile) {
      errors.tipo_perfil = 'No puede ser administrativo y trabajador al mismo tiempo';
    }

    // Validar permisos de trabajador
    if (perfilData.is_worker_profile) {
      const permisosAdmin = [perfilData.permisos_usuarios, perfilData.permisos_core];
      if (permisosAdmin.some(p => p === 'EDIT' || p === 'FULL')) {
        errors.permisos = 'Los trabajadores no pueden tener permisos de edición en usuarios o configuración';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Formatear datos de perfil para mostrar
   */
  formatPerfilData(perfil) {
    return {
      ...perfil,
      tipo_acceso_display: this.getTipoAccesoDisplay(perfil.tipo_acceso),
      tipo_perfil_display: perfil.is_admin_profile ? 'Administrativo' : 'Trabajador',
      created_at_formatted: new Date(perfil.created_at).toLocaleDateString('es-ES'),
      updated_at_formatted: new Date(perfil.updated_at).toLocaleDateString('es-ES')
    };
  },

  /**
   * Obtener texto legible para tipo de acceso
   */
  getTipoAccesoDisplay(tipoAcceso) {
    const tipos = {
      'WEB': 'Solo Web',
      'MOVIL': 'Solo Móvil',
      'AMBOS': 'Web y Móvil'
    };
    return tipos[tipoAcceso] || tipoAcceso;
  },

  /**
   * Obtener texto legible para nivel de permisos
   */
  getPermisoDisplay(permiso) {
    const permisos = {
      'NONE': 'Sin acceso',
      'VIEW': 'Solo lectura',
      'EDIT': 'Lectura y edición',
      'FULL': 'Control total'
    };
    return permisos[permiso] || permiso;
  },

  /**
   * Obtener opciones para selects de permisos
   */
  getPermisosOptions() {
    return [
      { value: 'NONE', label: 'Sin acceso' },
      { value: 'VIEW', label: 'Solo lectura' },
      { value: 'EDIT', label: 'Lectura y edición' },
      { value: 'FULL', label: 'Control total' }
    ];
  },

  /**
   * Obtener opciones para tipo de acceso
   */
  getTipoAccesoOptions() {
    return [
      { value: 'WEB', label: 'Solo Web' },
      { value: 'MOVIL', label: 'Solo Móvil' },
      { value: 'AMBOS', label: 'Web y Móvil' }
    ];
  }
};

export default perfilesService;