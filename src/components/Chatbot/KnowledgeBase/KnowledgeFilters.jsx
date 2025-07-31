import React from 'react';
import PropTypes from 'prop-types';
import { CustomDropdown } from '../../Common';

/**
 * Componente de filtros para KnowledgeBase - DISEÑO ORIGINAL PRESERVADO
 * Mantiene exactamente el mismo diseño visual y responsive del proyecto original
 */
const KnowledgeFilters = ({
  searchTerm = '',
  onSearchChange,
  selectedCategory = '',
  onCategoryChange,
  selectedEmbedding = '',
  onEmbeddingChange,
  categories = [],
  onCreateNew,
  onBulkImport,
  onRegenerateEmbeddings,
  totalItems = 0
}) => {
  const handleSearchChange = (value) => {
    onSearchChange?.(value);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 -mt-4 mb-6">
      <div className="space-y-4">
        {/* Búsqueda - Siempre en su propia línea */}
        <div className="w-full">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar preguntas, respuestas o palabras clave..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2D728F]/20 focus:border-[#2D728F]/30 transition-all bg-gray-50/30"
            />
          </div>
        </div>

        {/* Filtros y Acciones - Layout adaptativo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Columna 1: Filtro de Categoría */}
          <div className="flex flex-col">
            <div className="text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">Categoría</div>
            <div className="flex-1 flex flex-col justify-end">
              <CustomDropdown
                value={selectedCategory}
                onChange={onCategoryChange}
                options={[
                  { value: '', label: 'Todas las categorías' },
                  ...categories.map(category => ({ value: category.id.toString(), label: category.name }))
                ]}
                placeholder="Seleccionar categoría..."
                className="h-[42px]"
                showIcon={true}
                iconComponent={
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                }
                optionTextSize="text-[13px]"
              />
            </div>
          </div>

          {/* Columna 2: Filtro de Embedding */}
          <div className="flex flex-col">
            <div className="text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">Inteligencia Artificial</div>
            <div className="flex-1 flex flex-col justify-end">
              <div className="grid grid-cols-3 gap-1 bg-gray-50 rounded-lg h-[42px]">
                <button
                  onClick={() => onEmbeddingChange?.('')}
                  className={`px-2 text-[13px] font-medium rounded-md transition-all flex items-center justify-center h-full ${
                    selectedEmbedding === ''
                      ? 'bg-slate-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => onEmbeddingChange?.('with')}
                  className={`px-2 text-[13px] font-medium rounded-md transition-all flex items-center justify-center h-full ${
                    selectedEmbedding === 'with'
                      ? 'bg-slate-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Con IA
                </button>
                <button
                  onClick={() => onEmbeddingChange?.('without')}
                  className={`px-2 text-[13px] font-medium rounded-md transition-all flex items-center justify-center h-full ${
                    selectedEmbedding === 'without'
                      ? 'bg-slate-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Sin IA
                </button>
              </div>
            </div>
          </div>

          {/* Columna 3: Acciones */}
          <div className="flex flex-col">
            <div className="text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">Acciones</div>
            <div className="flex-1 flex flex-col justify-end">
              <div className="flex flex-wrap gap-2 h-[42px]">
                <button
                  onClick={onCreateNew}
                  className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-500 text-white text-[13px] font-medium rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500/20 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear
                </button>

                <button
                  onClick={onRegenerateEmbeddings}
                  className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 text-slate-600 text-[13px] font-medium rounded-lg hover:bg-slate-200 cursor-pointer transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  IA
                </button>

                <label className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 text-slate-600 text-[13px] font-medium rounded-lg hover:bg-slate-200 cursor-pointer transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Importar
                  <input
                    type="file"
                    accept=".json,.csv"
                    onChange={onBulkImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Información de resultados y filtros */}
        <div className="flex flex-col gap-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-[13px] text-gray-600">
                <span className="font-bold">{totalItems}</span> {totalItems === 1 ? 'registro' : 'registros'}
              </span>

              {/* Filtros activos - Al lado del contador */}
              {(searchTerm || selectedCategory || selectedEmbedding) && (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-gray-500">Filtros:</span>
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/10 text-blue-800 text-[13px] font-medium rounded-md">
                      "{searchTerm.length > 15 ? `${searchTerm.substring(0, 15)}...` : searchTerm}"
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-[13px] font-medium rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                      {categories.find(c => c.id.toString() === selectedCategory)?.name || 'Categoría'}
                    </span>
                  )}
                  {selectedEmbedding && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-[13px] font-medium rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                      {selectedEmbedding === 'with' ? 'Con IA' : 'Sin IA'}
                    </span>
                  )}
                </div>
              )}
            </div>

            {(searchTerm || selectedCategory || selectedEmbedding) && (
              <button
                onClick={() => {
                  onSearchChange?.('');
                  onCategoryChange?.('');
                  onEmbeddingChange?.('');
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 text-slate-600 text-[13px] font-medium rounded-lg hover:bg-slate-200 cursor-pointer transition-all min-w-[120px]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

KnowledgeFilters.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  selectedCategory: PropTypes.string,
  onCategoryChange: PropTypes.func,
  selectedEmbedding: PropTypes.string,
  onEmbeddingChange: PropTypes.func,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    })
  ),
  onCreateNew: PropTypes.func,
  onBulkImport: PropTypes.func,
  onRegenerateEmbeddings: PropTypes.func,
  totalItems: PropTypes.number
};

export default KnowledgeFilters;