/**
 * Utilidades de paginación para tablas y listas
 * Funciones puras para manejar paginación de datos
 */

/**
 * Calcula información de paginación basada en datos totales
 * @param {number} totalItems - Total de elementos
 * @param {number} itemsPerPage - Elementos por página
 * @param {number} currentPage - Página actual
 * @returns {Object} Información de paginación
 */
export const calculatePagination = (totalItems, itemsPerPage, currentPage = 1) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
  return {
    totalItems,
    totalPages,
    currentPage: Math.max(1, Math.min(currentPage, totalPages)),
    itemsPerPage,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages
  };
};

/**
 * Obtiene una porción paginada de datos
 * @param {Array} data - Array completo de datos
 * @param {Object} pagination - Información de paginación
 * @returns {Array} Datos paginados
 */
export const getPaginatedData = (data, pagination) => {
  if (!data || !Array.isArray(data)) return [];
  
  const { startIndex, endIndex } = pagination;
  return data.slice(startIndex, endIndex);
};

/**
 * Genera números de página para mostrar en la paginación
 * @param {number} totalPages - Total de páginas
 * @param {number} currentPage - Página actual
 * @param {number} maxVisible - Máximo de páginas visibles (por defecto 5)
 * @returns {Array} Array de números de página
 */
export const generatePageNumbers = (totalPages, currentPage, maxVisible = 5) => {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  
  const pages = [];
  const halfVisible = Math.floor(maxVisible / 2);
  
  let startPage = Math.max(1, currentPage - halfVisible);
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  // Ajustar si estamos cerca del final
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return pages;
};

/**
 * Valida y normaliza un número de página
 * @param {number} page - Número de página a validar
 * @param {number} totalPages - Total de páginas disponibles
 * @returns {number} Número de página válido
 */
export const validatePageNumber = (page, totalPages) => {
  const pageNum = parseInt(page, 10);
  
  if (isNaN(pageNum) || pageNum < 1) {
    return 1;
  }
  
  if (pageNum > totalPages) {
    return Math.max(1, totalPages);
  }
  
  return pageNum;
};

/**
 * Calcula el rango de elementos mostrados (ej: "1-10 de 100")
 * @param {Object} pagination - Información de paginación
 * @returns {Object} Información del rango
 */
export const getDisplayRange = (pagination) => {
  const { startIndex, endIndex, totalItems } = pagination;
  
  return {
    start: totalItems > 0 ? startIndex + 1 : 0,
    end: endIndex,
    total: totalItems,
    showing: endIndex - startIndex
  };
};

/**
 * Obtiene información de navegación (anterior/siguiente)
 * @param {Object} pagination - Información de paginación
 * @returns {Object} Información de navegación
 */
export const getNavigationInfo = (pagination) => {
  const { currentPage, totalPages, hasPrevPage, hasNextPage } = pagination;
  
  return {
    prevPage: hasPrevPage ? currentPage - 1 : null,
    nextPage: hasNextPage ? currentPage + 1 : null,
    canGoPrev: hasPrevPage,
    canGoNext: hasNextPage,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages
  };
};

/**
 * Crea un objeto de paginación completo con datos
 * @param {Array} data - Array de datos
 * @param {number} currentPage - Página actual
 * @param {number} itemsPerPage - Elementos por página
 * @returns {Object} Objeto completo de paginación con datos
 */
export const createPaginatedResult = (data, currentPage = 1, itemsPerPage = 10) => {
  const pagination = calculatePagination(data.length, itemsPerPage, currentPage);
  const paginatedData = getPaginatedData(data, pagination);
  const displayRange = getDisplayRange(pagination);
  const navigation = getNavigationInfo(pagination);
  const pageNumbers = generatePageNumbers(pagination.totalPages, currentPage);
  
  return {
    data: paginatedData,
    pagination,
    displayRange,
    navigation,
    pageNumbers
  };
};