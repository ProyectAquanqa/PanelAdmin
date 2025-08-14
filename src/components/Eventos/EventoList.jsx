import React from 'react';
import PropTypes from 'prop-types';
import { DataViewSwitcher } from '../Common';
import { LoadingStates } from '.';

/**
 * Componente contenedor para la lista de eventos
 * Basado en KnowledgeList - Usa DataViewSwitcher para tabla como knowledge base
 */
const EventoList = ({
  eventos,
  loading,
  error,
  totalItems,
  onEdit,
  onDelete,
  onViewDetails,
  onPin,
  onUnpin,
  onCreateFirst,
  onRetry
}) => {
  // Si está cargando y no hay datos
  if (loading && !eventos?.length) {
    return <LoadingStates.TableSkeleton />;
  }

  // Si hay error
  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6 text-center">
        <div className="text-red-600 mb-2">Error al cargar eventos</div>
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
  if (!eventos?.length) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-16 text-center">
          {/* Ilustración moderna */}
          <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No hay eventos registrados
          </h3>
          
          <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
            Comience creando eventos para mantener informada a su comunidad sobre las actividades más importantes.
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
    console.log(`Ordenando eventos por ${field} en dirección ${direction}`);
  };

  return (
    <div className="space-y-6">
      <DataViewSwitcher
        data={eventos}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewDetails={onViewDetails}
        onPin={onPin}
        onUnpin={onUnpin}
        onSort={handleSort}
        itemType="evento"
        defaultSortField="created_at"
        defaultSortDirection="desc"
      />
    </div>
  );
};

EventoList.propTypes = {
  eventos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      titulo: PropTypes.string.isRequired,
      descripcion: PropTypes.string.isRequired,
      fecha: PropTypes.string,
      publicado: PropTypes.bool,
  
      imagen: PropTypes.string,
      created_at: PropTypes.string,
      updated_at: PropTypes.string,
      categoria: PropTypes.shape({
        id: PropTypes.number,
        nombre: PropTypes.string
      }),
      autor: PropTypes.shape({
        id: PropTypes.number,
        full_name: PropTypes.string,
        foto_perfil: PropTypes.string
      })
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
  totalItems: PropTypes.number,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onViewDetails: PropTypes.func,
  onPin: PropTypes.func,
  onUnpin: PropTypes.func,
  onCreateFirst: PropTypes.func,
  onRetry: PropTypes.func
};

export default EventoList;