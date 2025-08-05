/**
 * Hook para manejar búsqueda y filtrado de datos
 * Proporciona funcionalidad de búsqueda con filtros múltiples
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  searchInFields, 
  applyMultipleFilters,
  normalizeText,
  countSearchMatches
} from '../utils/searchUtils';
import { search as searchConfig } from '../config/appConfig';

/**
 * Hook para manejar búsqueda y filtrado
 * @param {Array} data - Datos a filtrar
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado y funciones para manejar búsqueda
 */
export const useSearch = (data = [], options = {}) => {
  const {
    searchFields = ['question', 'answer', 'keywords'],
    debounceDelay = searchConfig.debounceDelay,
    minSearchLength = searchConfig.minSearchLength,
    caseSensitive = searchConfig.caseSensitive,
    enableHighlight = searchConfig.highlightMatches
  } = options;

  // Estado de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Estados de filtros
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedEmbedding, setSelectedEmbedding] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  
  // Estado de filtros activos
  const [activeFilters, setActiveFilters] = useState({});
  
  // Estados adicionales para otros filtros
  const [filters, setFilters] = useState({});

  // Debounce del término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceDelay]);

  // Datos filtrados (memoizados)
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    // Construir objeto de filtros
    const filters = {
      searchTerm: debouncedSearchTerm.length >= minSearchLength ? debouncedSearchTerm : '',
      searchFields,
      categoryId: selectedCategory,
      embeddingFilter: selectedEmbedding,
      isActive: selectedStatus !== '' ? selectedStatus === 'active' : undefined,
      dateField: 'created_at',
      startDate: dateRange.start,
      endDate: dateRange.end
    };

    return applyMultipleFilters(data, filters);
  }, [
    data, 
    debouncedSearchTerm, 
    minSearchLength, 
    searchFields, 
    selectedCategory, 
    selectedEmbedding, 
    selectedStatus, 
    dateRange
  ]);

  // Estadísticas de búsqueda (memoizadas)
  const searchStats = useMemo(() => {
    const total = data?.length || 0;
    const filtered = filteredData.length;
    const hasActiveSearch = debouncedSearchTerm.length >= minSearchLength;
    const hasActiveFilters = selectedCategory || selectedEmbedding || selectedStatus || dateRange.start || dateRange.end;

    return {
      total,
      filtered,
      hidden: total - filtered,
      hasResults: filtered > 0,
      hasActiveSearch,
      hasActiveFilters,
      hasAnyFilter: hasActiveSearch || hasActiveFilters,
      matchPercentage: total > 0 ? Math.round((filtered / total) * 100) : 0
    };
  }, [data?.length, filteredData.length, debouncedSearchTerm, minSearchLength, selectedCategory, selectedEmbedding, selectedStatus, dateRange]);

  // Función para actualizar término de búsqueda
  const updateSearchTerm = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Función para limpiar búsqueda
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  }, []);

  // Función para actualizar categoría
  const updateCategory = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
  }, []);

  // Función para actualizar filtro de embedding
  const updateEmbeddingFilter = useCallback((embeddingFilter) => {
    setSelectedEmbedding(embeddingFilter);
  }, []);

  // Función para actualizar filtro de estado
  const updateStatusFilter = useCallback((status) => {
    setSelectedStatus(status);
  }, []);

  // Función para actualizar rango de fechas
  const updateDateRange = useCallback((start, end) => {
    setDateRange({ start, end });
  }, []);

  // Función para actualizar filtros genéricos
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Función para limpiar todos los filtros
  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSelectedCategory('');
    setSelectedEmbedding('');
    setSelectedStatus('');
    setDateRange({ start: null, end: null });
    setActiveFilters({});
  }, []);

  // Función para limpiar filtros específicos
  const clearFilter = useCallback((filterType) => {
    switch (filterType) {
      case 'search':
        clearSearch();
        break;
      case 'category':
        setSelectedCategory('');
        break;
      case 'embedding':
        setSelectedEmbedding('');
        break;
      case 'status':
        setSelectedStatus('');
        break;
      case 'dateRange':
        setDateRange({ start: null, end: null });
        break;
      default:
        break;
    }
  }, [clearSearch]);

  // Función para obtener coincidencias de búsqueda
  const getSearchMatches = useCallback((item) => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < minSearchLength) {
      return [];
    }

    const matches = [];
    searchFields.forEach(field => {
      const fieldValue = item[field];
      if (fieldValue && typeof fieldValue === 'string') {
        const normalizedField = normalizeText(fieldValue);
        const normalizedSearch = normalizeText(debouncedSearchTerm);
        
        if (normalizedField.includes(normalizedSearch)) {
          matches.push({
            field,
            value: fieldValue,
            highlighted: enableHighlight ? fieldValue.replace(
              new RegExp(`(${debouncedSearchTerm})`, 'gi'),
              '<mark>$1</mark>'
            ) : fieldValue
          });
        }
      }
    });

    return matches;
  }, [debouncedSearchTerm, minSearchLength, searchFields, enableHighlight]);

  // Función para verificar si un elemento coincide con la búsqueda
  const matchesSearch = useCallback((item) => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < minSearchLength) {
      return true;
    }

    return searchInFields(item, debouncedSearchTerm, searchFields);
  }, [debouncedSearchTerm, minSearchLength, searchFields]);

  // Función para obtener sugerencias de búsqueda
  const getSearchSuggestions = useCallback((limit = 5) => {
    if (!data || !Array.isArray(data) || !debouncedSearchTerm) {
      return [];
    }

    const suggestions = new Set();
    
    data.forEach(item => {
      searchFields.forEach(field => {
        const fieldValue = item[field];
        if (fieldValue && typeof fieldValue === 'string') {
          const words = fieldValue.toLowerCase().split(/\s+/);
          words.forEach(word => {
            if (word.includes(debouncedSearchTerm.toLowerCase()) && word !== debouncedSearchTerm.toLowerCase()) {
              suggestions.add(word);
            }
          });
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  }, [data, debouncedSearchTerm, searchFields]);

  // Función para exportar configuración de filtros
  const exportFilters = useCallback(() => {
    return {
      searchTerm: debouncedSearchTerm,
      selectedCategory,
      selectedEmbedding,
      selectedStatus,
      dateRange
    };
  }, [debouncedSearchTerm, selectedCategory, selectedEmbedding, selectedStatus, dateRange]);

  // Función para importar configuración de filtros
  const importFilters = useCallback((filters) => {
    if (filters.searchTerm !== undefined) {
      setSearchTerm(filters.searchTerm);
      setDebouncedSearchTerm(filters.searchTerm);
    }
    if (filters.selectedCategory !== undefined) {
      setSelectedCategory(filters.selectedCategory);
    }
    if (filters.selectedEmbedding !== undefined) {
      setSelectedEmbedding(filters.selectedEmbedding);
    }
    if (filters.selectedStatus !== undefined) {
      setSelectedStatus(filters.selectedStatus);
    }
    if (filters.dateRange !== undefined) {
      setDateRange(filters.dateRange);
    }
  }, []);

  // Información del estado actual
  const searchState = {
    searchTerm,
    debouncedSearchTerm,
    selectedCategory,
    selectedEmbedding,
    selectedStatus,
    dateRange,
    isSearching: searchTerm !== debouncedSearchTerm
      };

  return {
      // Datos filtrados
      filteredData,
      
      // Estados de búsqueda
      searchTerm,
      debouncedSearchTerm,
      selectedCategory,
      selectedEmbedding,
      selectedStatus,
      dateRange,
      filters,
      
      // Funciones de actualización
      updateSearchTerm,
      updateCategory,
      updateEmbeddingFilter,
      updateStatusFilter,
      updateDateRange,
      updateFilter,
      
      // Funciones de limpieza
      clearSearch,
      clearAllFilters,
      clearFilter,
      
      // Funciones de utilidad
      getSearchMatches,
      matchesSearch,
      getSearchSuggestions,
      exportFilters,
      importFilters,
      
      // Estadísticas
      searchStats,
      
      // Estado actual
      searchState,
      
      // Estados derivados
      hasActiveSearch: searchStats.hasActiveSearch,
      hasActiveFilters: searchStats.hasActiveFilters,
      hasResults: searchStats.hasResults,
      isSearching: searchTerm !== debouncedSearchTerm,
      
      // Configuración
      config: {
        searchFields,
        debounceDelay,
        minSearchLength,
        caseSensitive,
        enableHighlight
      }
    };
};

export default useSearch;