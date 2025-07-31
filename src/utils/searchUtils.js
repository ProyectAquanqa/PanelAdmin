/**
 * Utilidades de búsqueda y filtrado
 * Funciones puras para manejar búsqueda en datos
 */

/**
 * Normaliza texto removiendo acentos y caracteres especiales
 * @param {string} text - Texto a normalizar
 * @returns {string} Texto normalizado
 */
export const normalizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita acentos
    .replace(/[^\w\s]/g, ' ') // Reemplaza caracteres especiales con espacios
    .replace(/\s+/g, ' ') // Normaliza espacios múltiples
    .trim();
};

/**
 * Busca un término en múltiples campos de un objeto
 * @param {Object} item - Objeto donde buscar
 * @param {string} searchTerm - Término de búsqueda
 * @param {Array} fields - Campos donde buscar
 * @returns {boolean} True si encuentra coincidencia
 */
export const searchInFields = (item, searchTerm, fields) => {
  if (!searchTerm || !item || !fields || !Array.isArray(fields)) {
    return true;
  }
  
  const normalizedSearch = normalizeText(searchTerm);
  const searchWords = normalizedSearch.split(' ').filter(word => word.length > 0);
  
  if (searchWords.length === 0) return true;
  
  // Buscar cada palabra del término de búsqueda
  return searchWords.every(word => {
    return fields.some(field => {
      const fieldValue = getNestedValue(item, field);
      const normalizedField = normalizeText(fieldValue);
      return normalizedField.includes(word);
    });
  });
};

/**
 * Obtiene un valor anidado de un objeto usando notación de punto
 * @param {Object} obj - Objeto fuente
 * @param {string} path - Ruta del valor (ej: 'category.name')
 * @returns {any} Valor encontrado o cadena vacía
 */
export const getNestedValue = (obj, path) => {
  if (!obj || !path) return '';
  
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : '';
  }, obj);
};

/**
 * Filtra datos por categoría
 * @param {Array} data - Array de datos
 * @param {string|number} categoryId - ID de categoría a filtrar
 * @returns {Array} Datos filtrados
 */
export const filterByCategory = (data, categoryId) => {
  if (!data || !Array.isArray(data) || !categoryId) {
    return data || [];
  }
  
  return data.filter(item => {
    if (!item.category) return false;
    
    const itemCategoryId = typeof item.category === 'object' 
      ? item.category.id 
      : item.category;
      
    return itemCategoryId?.toString() === categoryId.toString();
  });
};

/**
 * Filtra datos por estado de embedding
 * @param {Array} data - Array de datos
 * @param {string} embeddingFilter - 'with', 'without', o vacío
 * @returns {Array} Datos filtrados
 */
export const filterByEmbedding = (data, embeddingFilter) => {
  if (!data || !Array.isArray(data) || !embeddingFilter) {
    return data || [];
  }
  
  return data.filter(item => {
    const hasEmbedding = item.question_embedding && item.question_embedding.length > 0;
    
    if (embeddingFilter === 'with') {
      return hasEmbedding;
    } else if (embeddingFilter === 'without') {
      return !hasEmbedding;
    }
    
    return true;
  });
};

/**
 * Filtra datos por estado activo/inactivo
 * @param {Array} data - Array de datos
 * @param {boolean} isActive - Estado a filtrar
 * @returns {Array} Datos filtrados
 */
export const filterByActiveStatus = (data, isActive) => {
  if (!data || !Array.isArray(data) || isActive === undefined || isActive === null) {
    return data || [];
  }
  
  return data.filter(item => Boolean(item.is_active) === Boolean(isActive));
};

/**
 * Filtra datos por rango de fechas
 * @param {Array} data - Array de datos
 * @param {string} dateField - Campo de fecha
 * @param {Date} startDate - Fecha de inicio
 * @param {Date} endDate - Fecha de fin
 * @returns {Array} Datos filtrados
 */
export const filterByDateRange = (data, dateField, startDate, endDate) => {
  if (!data || !Array.isArray(data) || !dateField) {
    return data || [];
  }
  
  return data.filter(item => {
    const itemDate = new Date(item[dateField]);
    
    if (isNaN(itemDate.getTime())) return false;
    
    if (startDate && itemDate < startDate) return false;
    if (endDate && itemDate > endDate) return false;
    
    return true;
  });
};

/**
 * Aplica múltiples filtros a un conjunto de datos
 * @param {Array} data - Array de datos
 * @param {Object} filters - Objeto con filtros a aplicar
 * @returns {Array} Datos filtrados
 */
export const applyMultipleFilters = (data, filters) => {
  if (!data || !Array.isArray(data) || !filters) {
    return data || [];
  }
  
  let filteredData = [...data];
  
  // Filtro de búsqueda
  if (filters.searchTerm && filters.searchFields) {
    filteredData = filteredData.filter(item => 
      searchInFields(item, filters.searchTerm, filters.searchFields)
    );
  }
  
  // Filtro de categoría
  if (filters.categoryId) {
    filteredData = filterByCategory(filteredData, filters.categoryId);
  }
  
  // Filtro de embedding
  if (filters.embeddingFilter) {
    filteredData = filterByEmbedding(filteredData, filters.embeddingFilter);
  }
  
  // Filtro de estado activo
  if (filters.isActive !== undefined && filters.isActive !== null) {
    filteredData = filterByActiveStatus(filteredData, filters.isActive);
  }
  
  // Filtro de rango de fechas
  if (filters.dateField && (filters.startDate || filters.endDate)) {
    filteredData = filterByDateRange(
      filteredData, 
      filters.dateField, 
      filters.startDate, 
      filters.endDate
    );
  }
  
  return filteredData;
};

/**
 * Resalta términos de búsqueda en un texto
 * @param {string} text - Texto original
 * @param {string} searchTerm - Término a resaltar
 * @returns {string} Texto con términos resaltados
 */
export const highlightSearchTerm = (text, searchTerm) => {
  if (!text || !searchTerm) return text;
  
  const normalizedSearch = normalizeText(searchTerm);
  const searchWords = normalizedSearch.split(' ').filter(word => word.length > 0);
  
  let highlightedText = text;
  
  searchWords.forEach(word => {
    const regex = new RegExp(`(${word})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  });
  
  return highlightedText;
};

/**
 * Cuenta coincidencias de búsqueda en un conjunto de datos
 * @param {Array} data - Array de datos
 * @param {string} searchTerm - Término de búsqueda
 * @param {Array} fields - Campos donde buscar
 * @returns {number} Número de coincidencias
 */
export const countSearchMatches = (data, searchTerm, fields) => {
  if (!data || !Array.isArray(data) || !searchTerm || !fields) {
    return 0;
  }
  
  return data.filter(item => searchInFields(item, searchTerm, fields)).length;
};