import React from 'react';
import PropTypes from 'prop-types';
import { DataViewSwitcher } from '../Common';
import { LoadingStates } from '.';

/**
 * Componente contenedor para la lista de categorías
 * Basado en KnowledgeList - Usa DataViewSwitcher para tabla como knowledge base
 */
const CategoriaList = ({
  categorias,
  loading,
  error,
  totalItems,
  onEdit,
  onDelete,
  onCreateFirst,
  onRetry
}) => {
  // Si está cargando y no hay datos
  if (loading && !categorias?.length) {
    return <LoadingStates.TableSkeleton />;
  }

  // Si hay error
  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6 text-center">
        <div className="text-red-600 mb-2">Error al cargar categorías</div>
        <p className="text-gray-600 text-sm mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-[#2D728F] text-white rounded-md hover:bg-[#235a70] transition-colors"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  // Si no hay datos
  if (!categorias?.length) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-16 text-center">
          {/* Ilustración moderna */}
          <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No hay categorías registradas
          </h3>
          
          <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
            Comience creando categorías para organizar mejor sus eventos y facilitar la navegación.
          </p>
          
          {/* Elementos decorativos sutiles */}
          <div className="mt-12 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
            <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
            <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // Función para manejar ordenamiento
  const handleSort = (field, direction) => {
    // Por ahora el ordenamiento se hace en el componente DataViewSwitcher
    // En el futuro podríamos llamar al backend para ordenamiento del servidor
  };

  return (
    <div className="space-y-6">
      <DataViewSwitcher
        data={categorias}
        onEdit={onEdit}
        onDelete={onDelete}
        onSort={handleSort}
        itemType="categoria"
        disableInternalSorting={true}
      />
    </div>
  );
};

CategoriaList.propTypes = {
  categorias: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
      descripcion: PropTypes.string,
      created_at: PropTypes.string,
      updated_at: PropTypes.string,
      created_by: PropTypes.string,
      eventos: PropTypes.array
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
  totalItems: PropTypes.number,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCreateFirst: PropTypes.func,
  onRetry: PropTypes.func
};

export default CategoriaList;