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
  onTogglePublish,
  onTogglePin,
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
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="flex flex-col items-center">
          <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos</h3>
          <p className="text-gray-600 mb-6">No se encontraron eventos. Crea el primer evento para empezar.</p>
          {onCreateFirst && (
            <button
              onClick={onCreateFirst}
              className="px-4 py-2 bg-[#2D728F] text-white rounded-md hover:bg-[#235a70] transition-colors"
            >
              Crear primer evento
            </button>
          )}
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
  onTogglePublish: PropTypes.func,

  onCreateFirst: PropTypes.func,
  onRetry: PropTypes.func
};

export default EventoList;