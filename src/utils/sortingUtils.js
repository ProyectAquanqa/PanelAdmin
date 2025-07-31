/**
 * Utilidades de ordenamiento para tablas y listas
 * Funciones puras para manejar ordenamiento de datos
 */

/**
 * Ordena un array de datos basado en un campo y dirección
 * @param {Array} data - Array de datos a ordenar
 * @param {string} field - Campo por el cual ordenar
 * @param {string} direction - Dirección: 'asc' o 'desc'
 * @returns {Array} Array ordenado
 */
export const sortData = (data, field, direction) => {
  if (!data || !Array.isArray(data)) return [];
  if (!field || !direction) return [...data];

  return [...data].sort((a, b) => {
    // Manejo especial para fechas
    if (field === 'created_at' || field === 'updated_at') {
      const dateA = new Date(a[field] || a.created);
      const dateB = new Date(b[field] || b.created);
      return direction === 'desc' ? dateB - dateA : dateA - dateB;
    }
    
    // Manejo especial para booleanos
    if (field === 'is_active' || typeof a[field] === 'boolean') {
      const aValue = a[field] ? 1 : 0;
      const bValue = b[field] ? 1 : 0;
      return direction === 'desc' ? bValue - aValue : aValue - bValue;
    }

    // Manejo especial para embeddings
    if (field === 'has_embedding') {
      const aValue = (a.question_embedding && a.question_embedding.length > 0) ? 1 : 0;
      const bValue = (b.question_embedding && b.question_embedding.length > 0) ? 1 : 0;
      return direction === 'desc' ? bValue - aValue : aValue - bValue;
    }
    
    // Ordenamiento de strings
    if (typeof a[field] === 'string' && typeof b[field] === 'string') {
      const aStr = a[field].toLowerCase();
      const bStr = b[field].toLowerCase();
      if (direction === 'desc') {
        return bStr.localeCompare(aStr);
      }
      return aStr.localeCompare(bStr);
    }
    
    // Ordenamiento numérico
    if (typeof a[field] === 'number' && typeof b[field] === 'number') {
      return direction === 'desc' ? b[field] - a[field] : a[field] - b[field];
    }
    
    return 0;
  });
};

/**
 * Obtiene la siguiente dirección de ordenamiento en el ciclo desc -> asc -> null
 * @param {string} currentField - Campo actual de ordenamiento
 * @param {string} newField - Nuevo campo a ordenar
 * @param {string} currentDirection - Dirección actual
 * @returns {Object} { field, direction }
 */
export const getNextSortDirection = (currentField, newField, currentDirection) => {
  if (currentField === newField) {
    // Ciclo: desc -> asc -> null (deseleccionar)
    if (currentDirection === 'desc') {
      return { field: newField, direction: 'asc' };
    } else if (currentDirection === 'asc') {
      return { field: null, direction: null };
    }
  }
  
  // Nuevo campo, empezar con desc
  return { field: newField, direction: 'desc' };
};

/**
 * Verifica si un campo está siendo ordenado actualmente
 * @param {string} field - Campo a verificar
 * @param {string} currentField - Campo actual de ordenamiento
 * @returns {boolean}
 */
export const isFieldSorted = (field, currentField) => {
  return field === currentField;
};

/**
 * Obtiene el ícono de ordenamiento apropiado para un campo
 * @param {string} field - Campo del ícono
 * @param {string} currentField - Campo actual de ordenamiento
 * @param {string} direction - Dirección actual
 * @returns {string} Clase CSS o tipo de ícono
 */
export const getSortIconType = (field, currentField, direction) => {
  if (field !== currentField || !direction) {
    return 'neutral'; // Ícono neutral
  }
  
  return direction === 'asc' ? 'ascending' : 'descending';
};

/**
 * Ordena datos por fecha de creación (más reciente primero por defecto)
 * @param {Array} data - Array de datos
 * @param {string} dateField - Campo de fecha (por defecto 'created_at')
 * @returns {Array} Array ordenado por fecha
 */
export const sortByDate = (data, dateField = 'created_at') => {
  return sortData(data, dateField, 'desc');
};

/**
 * Ordena datos alfabéticamente por un campo de texto
 * @param {Array} data - Array de datos
 * @param {string} textField - Campo de texto
 * @param {boolean} ascending - Si es ascendente (por defecto true)
 * @returns {Array} Array ordenado alfabéticamente
 */
export const sortAlphabetically = (data, textField, ascending = true) => {
  return sortData(data, textField, ascending ? 'asc' : 'desc');
};