import apiClient from '../api/apiClient';

/**
 * Obtiene la URL correcta para usuarios
 * Prueba diferentes endpoints hasta encontrar uno que funcione
 */
const getUsersBaseUrl = async () => {
  const urlsToTry = [
    '/api/users/users',
    '/api/users/users/',
    '/api/v1/users/users',
    '/api/v1/users/users/',
    '/api/user/users',
    '/api/user/users/',
  ];
  
  for (const url of urlsToTry) {
    try {
      await apiClient.get(url);
      console.log(`✅ URL de usuarios encontrada: ${url}`);
      return url;
    } catch (error) {
      if (error.response?.status !== 404) {
        // Si no es 404, hay otro problema, usar esta URL
        console.log(`⚠️ URL ${url} tiene problemas pero la usaremos: ${error.response?.status}`);
        return url;
      }
    }
  }
  
  // Si ninguna funciona, usar la URL por defecto
  console.warn('⚠️ Ninguna URL funcionó, usando URL por defecto');
  return '/api/users/users/';
};

// Cache para la URL base
let cachedBaseUrl = null;

/**
 * Obtiene la URL base (con cache)
 */
const getBaseUrl = async () => {
  if (!cachedBaseUrl) {
    cachedBaseUrl = await getUsersBaseUrl();
  }
  return cachedBaseUrl;
};

/**
 * Normaliza la respuesta del backend
 * Maneja diferentes formatos de respuesta
 */
const normalizeUsersResponse = (data) => {
  console.log('📊 Normalizando respuesta de usuarios:', data);
  
  // Si es un array directamente
  if (Array.isArray(data)) {
    return {
      results: data,
      count: data.length,
      next: null,
      previous: null
    };
  }
  
  // Si tiene estructura de paginación de Django REST
  if (data && data.results && Array.isArray(data.results)) {
    return data;
  }
  
  // Si tiene una propiedad 'users'
  if (data && data.users && Array.isArray(data.users)) {
    return {
      results: data.users,
      count: data.count || data.users.length,
      next: data.next || null,
      previous: data.previous || null
    };
  }
  
  // Si tiene una propiedad 'data'
  if (data && data.data && Array.isArray(data.data)) {
    return {
      results: data.data,
      count: data.count || data.data.length,
      next: data.next || null,
      previous: data.previous || null
    };
  }
  
  // Formato por defecto
  console.warn('⚠️ Formato de respuesta desconocido, devolviendo array vacío');
  return {
    results: [],
    count: 0,
    next: null,
    previous: null
  };
};

/**
 * Obtiene la lista de usuarios
 * @param {Object} params - Parámetros para filtrar la lista
 * @returns {Promise} Promise con la respuesta normalizada
 */
export const getUsers = async (params = {}) => {
  try {
    console.log('🔍 Solicitando usuarios con parámetros:', params);
    
    const baseUrl = await getBaseUrl();
    const response = await apiClient.get(baseUrl, { params });
    
    console.log('✅ Respuesta cruda del servidor:', response.data);
    
    const normalizedData = normalizeUsersResponse(response.data);
    console.log('✅ Datos normalizados:', normalizedData);
    
    return normalizedData;
    
  } catch (error) {
    console.error('💥 Error al obtener usuarios:', error);
    
    // Limpiar cache si hay error de conexión
    if (error.code === 'NETWORK_ERROR' || error.response?.status >= 500) {
      cachedBaseUrl = null;
    }
    
    throw error;
  }
};

/**
 * Obtiene un usuario por su ID
 * @param {number} id - ID del usuario
 * @returns {Promise} Promise con la respuesta
 */
export const getUserById = async (id) => {
  try {
    console.log(`🔍 Solicitando usuario con ID: ${id}`);
    
    const baseUrl = await getBaseUrl();
    const url = baseUrl.endsWith('/') ? `${baseUrl}${id}/` : `${baseUrl}/${id}/`;
    
    const response = await apiClient.get(url);
    console.log(`✅ Usuario ${id} obtenido:`, response.data);
    
    return response.data;
  } catch (error) {
    console.error(`💥 Error al obtener el usuario con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo usuario
 * @param {Object} userData - Datos del usuario a crear
 * @returns {Promise} Promise con la respuesta
 */
export const createUser = async (userData) => {
  try {
    console.log('🚀 Creando usuario con datos:', userData);
    
    // Validar datos antes de enviar
    const validatedData = {
      first_name: String(userData.first_name).trim(),
      last_name: String(userData.last_name).trim(),
      email: String(userData.email).toLowerCase().trim(),
      password: String(userData.password),
      role: String(userData.role),
    };

    // Agregar teléfono solo si existe
    if (userData.phone && userData.phone.trim()) {
      validatedData.phone = String(userData.phone).trim();
    }
    
    console.log('📋 Datos validados:', validatedData);
    
    const baseUrl = await getBaseUrl();
    const url = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    
    const response = await apiClient.post(url, validatedData);
    console.log('✅ Usuario creado exitosamente:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('💥 Error al crear usuario:', error);
    
    // Manejo específico de errores de validación
    if (error.response?.status === 400) {
      const errorData = error.response.data;
      console.error('📋 Errores de validación:', errorData);
      
      // Crear un error más descriptivo
      const fieldErrors = [];
      if (errorData.email) fieldErrors.push(`Email: ${Array.isArray(errorData.email) ? errorData.email[0] : errorData.email}`);
      if (errorData.first_name) fieldErrors.push(`Nombre: ${Array.isArray(errorData.first_name) ? errorData.first_name[0] : errorData.first_name}`);
      if (errorData.last_name) fieldErrors.push(`Apellido: ${Array.isArray(errorData.last_name) ? errorData.last_name[0] : errorData.last_name}`);
      if (errorData.password) fieldErrors.push(`Contraseña: ${Array.isArray(errorData.password) ? errorData.password[0] : errorData.password}`);
      if (errorData.role) fieldErrors.push(`Rol: ${Array.isArray(errorData.role) ? errorData.role[0] : errorData.role}`);
      
      if (fieldErrors.length > 0) {
        error.message = fieldErrors.join(', ');
      }
    }
    
    throw error;
  }
};

/**
 * Actualiza un usuario existente
 * @param {number} id - ID del usuario
 * @param {Object} userData - Datos actualizados del usuario
 * @returns {Promise} Promise con la respuesta
 */
export const updateUser = async (id, userData) => {
  try {
    console.log(`🔄 Actualizando usuario ${id} con datos:`, userData);
    
    // Validar datos antes de enviar
    const validatedData = {
      first_name: String(userData.first_name).trim(),
      last_name: String(userData.last_name).trim(),
      email: String(userData.email).toLowerCase().trim(),
      role: String(userData.role),
    };

    // Agregar contraseña solo si existe (para edición)
    if (userData.password && userData.password.trim()) {
      validatedData.password = String(userData.password);
    }

    // Agregar teléfono solo si existe
    if (userData.phone && userData.phone.trim()) {
      validatedData.phone = String(userData.phone).trim();
    }
    
    console.log('📋 Datos validados:', validatedData);
    
    const baseUrl = await getBaseUrl();
    const url = baseUrl.endsWith('/') ? `${baseUrl}${id}/` : `${baseUrl}/${id}/`;
    
    const response = await apiClient.put(url, validatedData);
    console.log(`✅ Usuario ${id} actualizado exitosamente:`, response.data);
    
    return response.data;
  } catch (error) {
    console.error(`💥 Error al actualizar el usuario con ID ${id}:`, error);
    
    // Manejo específico de errores de validación
    if (error.response?.status === 400) {
      const errorData = error.response.data;
      console.error('📋 Errores de validación:', errorData);
      
      // Crear un error más descriptivo
      const fieldErrors = [];
      if (errorData.email) fieldErrors.push(`Email: ${Array.isArray(errorData.email) ? errorData.email[0] : errorData.email}`);
      if (errorData.first_name) fieldErrors.push(`Nombre: ${Array.isArray(errorData.first_name) ? errorData.first_name[0] : errorData.first_name}`);
      if (errorData.last_name) fieldErrors.push(`Apellido: ${Array.isArray(errorData.last_name) ? errorData.last_name[0] : errorData.last_name}`);
      if (errorData.password) fieldErrors.push(`Contraseña: ${Array.isArray(errorData.password) ? errorData.password[0] : errorData.password}`);
      if (errorData.role) fieldErrors.push(`Rol: ${Array.isArray(errorData.role) ? errorData.role[0] : errorData.role}`);
      
      if (fieldErrors.length > 0) {
        error.message = fieldErrors.join(', ');
      }
    }
    
    throw error;
  }
};

/**
 * Elimina un usuario
 * @param {number} id - ID del usuario a eliminar
 * @returns {Promise} Promise con la respuesta
 */
export const deleteUser = async (id) => {
  try {
    console.log(`🗑️ Eliminando usuario con ID: ${id}`);
    
    const baseUrl = await getBaseUrl();
    const url = baseUrl.endsWith('/') ? `${baseUrl}${id}/` : `${baseUrl}/${id}/`;
    
    const response = await apiClient.delete(url);
    console.log(`✅ Usuario ${id} eliminado exitosamente`);
    
    return response.data;
  } catch (error) {
    console.error(`💥 Error al eliminar el usuario con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Función de utilidad para limpiar cache
 */
export const clearUsersCache = () => {
  cachedBaseUrl = null;
  console.log('🧹 Cache de URL de usuarios limpiado');
};

/**
 * Función de utilidad para obtener estadísticas de usuarios
 */
export const getUsersStats = async () => {
  try {
    console.log('📊 Obteniendo estadísticas de usuarios...');
    
    const data = await getUsers();
    const users = data.results || [];
    
    const stats = {
      total: users.length,
      active: users.filter(u => u.is_active).length,
      inactive: users.filter(u => !u.is_active).length,
      byRole: {
        patients: users.filter(u => u.role === 'PATIENT').length,
        doctors: users.filter(u => u.role === 'DOCTOR').length,
        admins: users.filter(u => u.role === 'ADMIN').length,
      },
      withPhone: users.filter(u => u.phone && u.phone.trim()).length,
      withoutPhone: users.filter(u => !u.phone || !u.phone.trim()).length,
    };
    
    console.log('📊 Estadísticas calculadas:', stats);
    return stats;
  } catch (error) {
    console.error('💥 Error al calcular estadísticas:', error);
    throw error;
  }
};