/**
 * Normaliza la respuesta del backend
 * Maneja diferentes formatos de respuesta
 * @param {Object|Array} data - Datos de respuesta del servidor
 * @returns {Object} Datos normalizados en formato estándar
 */
export const normalizeUsersResponse = (data) => {
  console.log('📊 Normalizando respuesta de usuarios:', data);
  
  // Si es un array directamente (respuesta de Django sin paginación)
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
  
  // Django User API podría retornar un objeto plano con usuarios
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    // Verificar si es una respuesta de Django User ViewSet
    if (Object.keys(data).some(key => ['first_name', 'last_name', 'email', 'role'].includes(key))) {
      // Respuesta es un solo usuario, convertirlo en array
      return {
        results: [data],
        count: 1,
        next: null,
        previous: null
      };
    }
    
    // Verificar si todas las claves son números (IDs de usuario)
    const allKeysAreNumbers = Object.keys(data).every(key => !isNaN(Number(key)));
    
    if (allKeysAreNumbers) {
      // Convertir objeto de usuarios a array
      const userArray = Object.values(data);
      return {
        results: userArray,
        count: userArray.length,
        next: null,
        previous: null
      };
    }
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
 * Normaliza los datos de un usuario
 * @param {Object} userData - Datos del usuario a normalizar
 * @returns {Object} Datos del usuario normalizados
 */
export const normalizeUserData = (userData) => {
  if (!userData) return {};
  
  // Copia para no modificar el original
  const normalizedUser = { ...userData };
  
  // Asegurar que los campos existan
  normalizedUser.first_name = normalizedUser.first_name || '';
  normalizedUser.last_name = normalizedUser.last_name || '';
  
  // Generar nombre completo si no existe
  if (!normalizedUser.full_name && normalizedUser.first_name && normalizedUser.last_name) {
    normalizedUser.full_name = `${normalizedUser.first_name} ${normalizedUser.last_name}`;
  }
  
  // Normalizar el rol si existe
  if (normalizedUser.role) {
    normalizedUser.role = normalizedUser.role.toUpperCase();
  }
  
  // Normalizar estado activo
  if ('is_active' in normalizedUser) {
    normalizedUser.is_active = Boolean(normalizedUser.is_active);
  }
  
  return normalizedUser;
};

/**
 * Prepara los datos de un usuario para enviar al servidor
 * @param {Object} userData - Datos del usuario a preparar
 * @returns {Object} Datos del usuario preparados para enviar
 */
export const prepareUserDataForSubmit = (userData) => {
  // Copia para no modificar el original
  const preparedData = { ...userData };
  
  // Eliminar campos calculados o que no deben enviarse
  delete preparedData.full_name;
  delete preparedData.created_at;
  delete preparedData.updated_at;
  
  // Asegurar que dni existe y está en el formato correcto
  if (preparedData.document_number && !preparedData.dni) {
    preparedData.dni = preparedData.document_number;
    delete preparedData.document_number;
  }
  
  // Si hay dni, asegurarse que tiene el formato correcto (8 dígitos)
  if (preparedData.dni) {
    // Mantener solo dígitos
    preparedData.dni = preparedData.dni.toString().replace(/\D/g, '');
    // Truncar a 8 dígitos si es más largo
    if (preparedData.dni.length > 8) {
      preparedData.dni = preparedData.dni.substring(0, 8);
    }
  }
  
  return preparedData;
}; 