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

// Cache para los datos de usuarios (para paginación del lado del cliente)
let cachedUsers = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minuto

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
 * Aplica paginación del lado del cliente a un array de usuarios
 * @param {Array} users - Array completo de usuarios
 * @param {Object} params - Parámetros de paginación y filtrado
 * @returns {Object} Datos paginados en formato estándar
 */
const applyClientSidePagination = (users, params = {}) => {
  const { page = 1, page_size = 10, search = '', role = '' } = params;
  
  // Aplicar filtros si existen
  let filteredUsers = [...users];
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredUsers = filteredUsers.filter(user => 
      (user.first_name && user.first_name.toLowerCase().includes(searchLower)) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.document_number && user.document_number.toLowerCase().includes(searchLower))
    );
  }
  
  if (role) {
    filteredUsers = filteredUsers.filter(user => 
      user.role === role
    );
  }
  
  // Calcular índices para paginación
  const startIndex = (page - 1) * page_size;
  const endIndex = startIndex + page_size;
  
  // Obtener subconjunto de usuarios para la página actual
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  
  return {
    results: paginatedUsers,
    count: filteredUsers.length,
    next: endIndex < filteredUsers.length ? `page=${page + 1}` : null,
    previous: page > 1 ? `page=${page - 1}` : null,
    total_pages: Math.ceil(filteredUsers.length / page_size)
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
    
    // Verificar si podemos usar la caché
    const now = Date.now();
    const shouldRefreshCache = !cachedUsers || (now - lastFetchTime > CACHE_DURATION);
    
    // Si necesitamos refrescar la caché o es la primera carga, obtenemos todos los usuarios
    if (shouldRefreshCache) {
      const baseUrl = await getBaseUrl();
      
      // Intentar primero con paginación del servidor
      try {
        const response = await apiClient.get(baseUrl, { params });
    console.log('✅ Respuesta cruda del servidor:', response.data);
    
    const normalizedData = normalizeUsersResponse(response.data);
    console.log('✅ Datos normalizados:', normalizedData);
    
        // Si la respuesta parece correcta y tiene paginación del servidor, usarla directamente
        if (normalizedData.results && normalizedData.count >= normalizedData.results.length) {
    return normalizedData;
        }
        
        // Si llegamos aquí, la respuesta no tiene paginación correcta, guardar en caché para paginación cliente
        cachedUsers = normalizedData.results;
        lastFetchTime = now;
      } catch (error) {
        // Si falla con parámetros de paginación, intentar sin ellos
        if (error.response?.status === 404 && (params.page || params.page_size)) {
          console.log('⚠️ El servidor no soporta paginación, obteniendo todos los usuarios');
          
          // Hacer una solicitud sin parámetros de paginación
          const cleanParams = { ...params };
          delete cleanParams.page;
          delete cleanParams.page_size;
          
          const response = await apiClient.get(baseUrl, { params: cleanParams });
          console.log('✅ Respuesta sin paginación:', response.data);
          
          const normalizedData = normalizeUsersResponse(response.data);
          cachedUsers = normalizedData.results;
          lastFetchTime = now;
        } else {
          throw error;
        }
      }
    }
    
    // Aplicar paginación del lado del cliente
    console.log('🔢 Aplicando paginación del lado del cliente');
    return applyClientSidePagination(cachedUsers || [], params);
    
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
    
    // Verificar si el usuario está en caché
    if (cachedUsers) {
      const cachedUser = cachedUsers.find(user => user.id === id || user.id === parseInt(id));
      if (cachedUser) {
        console.log(`✅ Usuario ${id} encontrado en caché:`, cachedUser);
        return cachedUser;
      }
    }
    
    // Si no está en caché, hacer solicitud al servidor
    const baseUrl = await getBaseUrl();
    const url = `${baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`}${id}/`;
    
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
      first_name: String(userData.first_name || '').trim(),
      last_name: String(userData.last_name || '').trim(),
      email: String(userData.email || '').toLowerCase().trim(),
      password: String(userData.password || ''),
      role: String(userData.role || ''),
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
    
    // Invalidar caché después de crear
    cachedUsers = null;
    lastFetchTime = 0;
    
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
      first_name: String(userData.first_name || '').trim(),
      last_name: String(userData.last_name || '').trim(),
      email: String(userData.email || '').toLowerCase().trim(),
      role: String(userData.role || ''),
      is_active: userData.is_active !== undefined ? userData.is_active : true,
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
    const url = `${baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`}${id}/`;
    
    const response = await apiClient.put(url, validatedData);
    console.log(`✅ Usuario ${id} actualizado exitosamente:`, response.data);
    
    // Invalidar caché después de actualizar
    cachedUsers = null;
    lastFetchTime = 0;
    
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
 * @param {number} id - ID del usuario
 * @returns {Promise} Promise con la respuesta
 */
export const deleteUser = async (id) => {
  try {
    console.log(`🗑️ Eliminando usuario con ID: ${id}`);
    
    const baseUrl = await getBaseUrl();
    const url = `${baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`}${id}/`;
    
    const response = await apiClient.delete(url);
    console.log(`✅ Usuario ${id} eliminado exitosamente`);
    
    // Invalidar caché después de eliminar
    cachedUsers = null;
    lastFetchTime = 0;
    
    return response.data;
  } catch (error) {
    console.error(`💥 Error al eliminar el usuario con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Limpia la cache de URLs de usuarios
 */
export const clearUsersCache = () => {
  cachedBaseUrl = null;
  cachedUsers = null;
  lastFetchTime = 0;
  console.log('🧹 Cache de URLs y datos de usuarios limpiada');
};

/**
 * Obtiene estadísticas de usuarios
 * @returns {Promise} Promise con estadísticas
 */
export const getUsersStats = async () => {
  try {
    console.log('📊 Solicitando estadísticas de usuarios');
    
    // Si tenemos usuarios en caché, calcular estadísticas localmente
    if (cachedUsers) {
      console.log('📊 Calculando estadísticas desde caché');
      
      const stats = {
        total: cachedUsers.length,
        active: cachedUsers.filter(u => u.is_active).length,
        inactive: cachedUsers.filter(u => !u.is_active).length,
        byRole: {
          patients: cachedUsers.filter(u => u.role === 'PATIENT').length,
          doctors: cachedUsers.filter(u => u.role === 'DOCTOR').length,
          admins: cachedUsers.filter(u => u.role === 'ADMIN').length,
        },
      };
      
      return stats;
    }
    
    // Si no hay caché, intentar obtener del servidor
    const baseUrl = await getBaseUrl();
    const url = `${baseUrl.replace(/\/$/, '')}/stats/`;
    
    try {
      const response = await apiClient.get(url);
      console.log('✅ Estadísticas obtenidas del servidor:', response.data);
      return response.data;
    } catch (error) {
      // Si falla, obtener todos los usuarios y calcular estadísticas
      console.log('⚠️ Error al obtener estadísticas del servidor, calculando localmente');
      const users = await getUsers();
    
    const stats = {
        total: users.count,
        active: users.results.filter(u => u.is_active).length,
        inactive: users.results.filter(u => !u.is_active).length,
      byRole: {
          patients: users.results.filter(u => u.role === 'PATIENT').length,
          doctors: users.results.filter(u => u.role === 'DOCTOR').length,
          admins: users.results.filter(u => u.role === 'ADMIN').length,
      },
      };
      
    return stats;
    }
  } catch (error) {
    console.error('💥 Error al obtener estadísticas:', error);
    throw error;
  }
};