import React from 'react';
import PropTypes from 'prop-types';
import { DataViewSwitcher } from '../Common';
import { LoadingStates } from '.';

/**
 * Componente contenedor para la lista de comentarios
 * Basado en EventoList - Usa DataViewSwitcher para tabla como eventos
 */
const ComentarioList = ({
  comentarios,
  loading,
  error,
  totalItems,
  onDelete,
  onViewDetails,
  onRetry
}) => {
  // Si está cargando y no hay datos
  if (loading && !comentarios?.length) {
    return <LoadingStates.TableSkeleton />;
  }

  // Si hay error
  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6 text-center">
        <div className="text-red-600 mb-2">Error al cargar comentarios</div>
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
  if (!comentarios?.length) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-16 text-center">
          {/* Ilustración moderna */}
          <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No hay comentarios registrados
          </h3>
          
          <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
            Los comentarios de los usuarios en los eventos aparecerán aquí para su gestión y moderación.
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
        data={comentarios}
        onDelete={onDelete}
        onViewDetails={onViewDetails}
        onSort={handleSort}
        itemType="comentario"
        defaultSortField="created_at"
        defaultSortDirection="desc"
      />
    </div>
  );
};

ComentarioList.propTypes = {
  comentarios: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      contenido: PropTypes.string.isRequired,
      is_active: PropTypes.bool,
      created_at: PropTypes.string,
      updated_at: PropTypes.string,
      usuario: PropTypes.shape({
        id: PropTypes.number,
        full_name: PropTypes.string,
        username: PropTypes.string,
        foto_perfil: PropTypes.string
      }),
      evento: PropTypes.shape({
        id: PropTypes.number,
        titulo: PropTypes.string
      })
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
  totalItems: PropTypes.number,
  onDelete: PropTypes.func.isRequired,
  onViewDetails: PropTypes.func,
  onRetry: PropTypes.func
};

export default ComentarioList;
