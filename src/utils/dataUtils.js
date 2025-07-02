/**
 * Normaliza un objeto de datos
 * @param {Object} data - Datos a normalizar
 * @param {Object} defaultValues - Valores por defecto
 * @returns {Object} Datos normalizados
 */
export const normalizeData = (data, defaultValues = {}) => {
  if (!data) return { ...defaultValues };
  
  // Copia para no modificar el original
  const normalizedData = { ...defaultValues, ...data };
  
  return normalizedData;
};

/**
 * Normaliza una respuesta de API con paginación
 * @param {Object|Array} data - Datos de respuesta del servidor
 * @returns {Object} Datos normalizados en formato estándar
 */
export const normalizePaginatedResponse = (data) => {
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
  
  // Si tiene una propiedad 'data'
  if (data && data.data && Array.isArray(data.data)) {
    return {
      results: data.data,
      count: data.count || data.total || data.data.length,
      next: data.next || null,
      previous: data.previous || null
    };
  }
  
  // Si tiene una propiedad específica con los datos
  const possibleArrayProps = ['items', 'list', 'content', 'elements'];
  for (const prop of possibleArrayProps) {
    if (data && data[prop] && Array.isArray(data[prop])) {
      return {
        results: data[prop],
        count: data.count || data.total || data[prop].length,
        next: data.next || null,
        previous: data.previous || null
      };
    }
  }
  
  // Si es un objeto pero no tiene una estructura reconocida
  if (data && typeof data === 'object') {
    return {
      results: [data],
      count: 1,
      next: null,
      previous: null
    };
  }
  
  // Formato por defecto
  console.warn('Formato de respuesta desconocido, devolviendo array vacío');
  return {
    results: [],
    count: 0,
    next: null,
    previous: null
  };
};

/**
 * Aplica paginación del lado del cliente a un array
 * @param {Array} items - Array de elementos
 * @param {Object} params - Parámetros de paginación
 * @param {number} params.page - Número de página
 * @param {number} params.page_size - Tamaño de página
 * @returns {Object} Datos paginados
 */
export const applyClientSidePagination = (items, params = {}) => {
  const { page = 1, page_size = 10 } = params;
  
  // Calcular índices para paginación
  const startIndex = (page - 1) * page_size;
  const endIndex = startIndex + page_size;
  
  // Obtener subconjunto de elementos para la página actual
  const paginatedItems = items.slice(startIndex, endIndex);
  
  return {
    results: paginatedItems,
    count: items.length,
    next: endIndex < items.length ? `page=${page + 1}` : null,
    previous: page > 1 ? `page=${page - 1}` : null,
    total_pages: Math.ceil(items.length / page_size)
  };
};

/**
 * Filtra un array por un término de búsqueda
 * @param {Array} items - Array de elementos
 * @param {string} searchTerm - Término de búsqueda
 * @param {Array} searchFields - Campos por los que buscar
 * @returns {Array} Elementos filtrados
 */
export const filterBySearchTerm = (items, searchTerm, searchFields = []) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return items;
  }
  
  const term = searchTerm.toLowerCase().trim();
  
  return items.filter(item => {
    // Si no se especifican campos, buscar en todas las propiedades
    if (searchFields.length === 0) {
      return Object.values(item).some(value => 
        String(value).toLowerCase().includes(term)
      );
    }
    
    // Buscar en los campos especificados
    return searchFields.some(field => {
      const value = item[field];
      
      if (value === undefined || value === null) {
        return false;
      }
      
      return String(value).toLowerCase().includes(term);
    });
  });
};

/**
 * Ordena un array por un campo
 * @param {Array} items - Array de elementos
 * @param {string} sortField - Campo por el que ordenar
 * @param {string} sortOrder - Orden (asc o desc)
 * @returns {Array} Elementos ordenados
 */
export const sortByField = (items, sortField, sortOrder = 'asc') => {
  if (!sortField) {
    return items;
  }
  
  const sortedItems = [...items];
  
  sortedItems.sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    // Manejar valores nulos o indefinidos
    if (aValue === undefined || aValue === null) return sortOrder === 'asc' ? -1 : 1;
    if (bValue === undefined || bValue === null) return sortOrder === 'asc' ? 1 : -1;
    
    // Comparar según el tipo de dato
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    // Para números y otros tipos
    return sortOrder === 'asc' 
      ? aValue - bValue 
      : bValue - aValue;
  });
  
  return sortedItems;
}; 