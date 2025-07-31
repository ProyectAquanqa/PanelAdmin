/**
 * Hook personalizado para manejar lógica de DataViewSwitcher
 * Encapsula ordenamiento, paginación, expansión de filas y filtrado
 */

import { useState, useMemo, useCallback } from 'react';
import { 
  sortData, 
  getNextSortDirection 
} from '../utils/sortingUtils';
import { 
  calculatePagination, 
  getPaginatedData, 
  generatePageNumbers,
  getDisplayRange,
  getNavigationInfo
} from '../utils/paginationUtils';

/**
 * Hook para manejar vista de datos con ordenamiento, paginación y expansión
 * @param {Array} data - Array de datos a mostrar
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado y funciones para manejar la vista de datos
 */
export const useDataView = (data = [], options = {}) => {
  const {
    initialSortField = 'created_at',
    initialSortDirection = 'desc',
    itemsPerPage = 10,
    enableSorting = true,
    enablePagination = true,
    enableExpansion = true
  } = options;

  // Estados de ordenamiento
  const [sortField, setSortField] = useState(initialSortField);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  
  // Estados de expansión de filas
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Datos ordenados (memoizados para evitar recálculos innecesarios)
  const sortedData = useMemo(() => {
    if (!enableSorting || !data || !Array.isArray(data)) {
      return data || [];
    }
    
    return sortData(data, sortField, sortDirection);
  }, [data, sortField, sortDirection, enableSorting]);

  // Información de paginación (memoizada)
  const pagination = useMemo(() => {
    if (!enablePagination) {
      return {
        totalItems: sortedData.length,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: sortedData.length,
        startIndex: 0,
        endIndex: sortedData.length,
        hasNextPage: false,
        hasPrevPage: false,
        isFirstPage: true,
        isLastPage: true
      };
    }
    
    return calculatePagination(sortedData.length, itemsPerPage, currentPage);
  }, [sortedData.length, itemsPerPage, currentPage, enablePagination]);

  // Datos paginados (memoizados)
  const paginatedData = useMemo(() => {
    if (!enablePagination) {
      return sortedData;
    }
    
    return getPaginatedData(sortedData, pagination);
  }, [sortedData, pagination, enablePagination]);

  // Números de página para mostrar (memoizados)
  const pageNumbers = useMemo(() => {
    if (!enablePagination) return [];
    
    return generatePageNumbers(pagination.totalPages, currentPage);
  }, [pagination.totalPages, currentPage, enablePagination]);

  // Información de rango de elementos mostrados
  const displayRange = useMemo(() => {
    return getDisplayRange(pagination);
  }, [pagination]);

  // Información de navegación
  const navigation = useMemo(() => {
    return getNavigationInfo(pagination);
  }, [pagination]);

  // Función para manejar ordenamiento
  const handleSort = useCallback((field) => {
    if (!enableSorting) return;
    
    const { field: newField, direction: newDirection } = getNextSortDirection(
      sortField, 
      field, 
      sortDirection
    );
    
    setSortField(newField);
    setSortDirection(newDirection);
    
    // Resetear a la primera página cuando se cambia el ordenamiento
    setCurrentPage(1);
  }, [sortField, sortDirection, enableSorting]);

  // Función para cambiar página
  const handlePageChange = useCallback((page) => {
    if (!enablePagination) return;
    
    const validPage = Math.max(1, Math.min(page, pagination.totalPages));
    setCurrentPage(validPage);
  }, [pagination.totalPages, enablePagination]);

  // Función para ir a la página anterior
  const goToPrevPage = useCallback(() => {
    if (navigation.canGoPrev) {
      handlePageChange(currentPage - 1);
    }
  }, [currentPage, navigation.canGoPrev, handlePageChange]);

  // Función para ir a la página siguiente
  const goToNextPage = useCallback(() => {
    if (navigation.canGoNext) {
      handlePageChange(currentPage + 1);
    }
  }, [currentPage, navigation.canGoNext, handlePageChange]);

  // Función para ir a la primera página
  const goToFirstPage = useCallback(() => {
    handlePageChange(1);
  }, [handlePageChange]);

  // Función para ir a la última página
  const goToLastPage = useCallback(() => {
    handlePageChange(pagination.totalPages);
  }, [pagination.totalPages, handlePageChange]);

  // Función para toggle expansión de fila
  const toggleRowExpansion = useCallback((itemId) => {
    if (!enableExpansion) return;
    
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, [enableExpansion]);

  // Función para verificar si una fila está expandida
  const isRowExpanded = useCallback((itemId) => {
    return expandedRows.has(itemId);
  }, [expandedRows]);

  // Función para expandir todas las filas
  const expandAllRows = useCallback(() => {
    if (!enableExpansion) return;
    
    const allIds = new Set(paginatedData.map(item => item.id).filter(Boolean));
    setExpandedRows(allIds);
  }, [paginatedData, enableExpansion]);

  // Función para colapsar todas las filas
  const collapseAllRows = useCallback(() => {
    setExpandedRows(new Set());
  }, []);

  // Función para resetear todos los estados
  const resetView = useCallback(() => {
    setSortField(initialSortField);
    setSortDirection(initialSortDirection);
    setCurrentPage(1);
    setExpandedRows(new Set());
  }, [initialSortField, initialSortDirection]);

  // Función para obtener información de ordenamiento de un campo
  const getSortInfo = useCallback((field) => {
    return {
      isActive: sortField === field,
      direction: sortField === field ? sortDirection : null,
      nextDirection: getNextSortDirection(sortField, field, sortDirection).direction
    };
  }, [sortField, sortDirection]);

  // Estadísticas de la vista actual
  const stats = useMemo(() => {
    return {
      totalItems: data?.length || 0,
      filteredItems: sortedData.length,
      visibleItems: paginatedData.length,
      expandedItems: expandedRows.size,
      currentPage,
      totalPages: pagination.totalPages
    };
  }, [data?.length, sortedData.length, paginatedData.length, expandedRows.size, currentPage, pagination.totalPages]);

  return {
    // Datos procesados
    sortedData,
    paginatedData,
    
    // Estados de ordenamiento
    sortField,
    sortDirection,
    
    // Estados de paginación
    pagination,
    currentPage,
    pageNumbers,
    displayRange,
    navigation,
    
    // Estados de expansión
    expandedRows,
    
    // Funciones de ordenamiento
    handleSort,
    getSortInfo,
    
    // Funciones de paginación
    handlePageChange,
    goToPrevPage,
    goToNextPage,
    goToFirstPage,
    goToLastPage,
    
    // Funciones de expansión
    toggleRowExpansion,
    isRowExpanded,
    expandAllRows,
    collapseAllRows,
    
    // Funciones de utilidad
    resetView,
    
    // Estadísticas
    stats,
    
    // Configuración
    config: {
      enableSorting,
      enablePagination,
      enableExpansion,
      itemsPerPage
    }
  };
};

export default useDataView;