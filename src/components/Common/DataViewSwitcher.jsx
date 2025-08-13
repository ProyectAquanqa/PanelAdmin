/**
 * Componente DataViewSwitcher refactorizado
 * Usa hook useDataView y componentes separados para mejor mantenibilidad
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useDataView } from '../../hooks/useDataView';
import TableView from './DataView/TableView';
import CategoriaTableView from '../Eventos/CategoriaTableView';
import EventoTableView from '../Eventos/EventoTableView';
import ProfileTableView from '../Perfiles/ProfileTableView';
import Pagination from './DataView/Pagination';
// import { EventoItem } from '../Eventos'; // Comentado para evitar dependencias circulares

/**
 * Componente principal DataViewSwitcher
 * @param {Object} props - Props del componente
 * @returns {JSX.Element} Componente de vista de datos
 */
const DataViewSwitcher = ({ 
  data = [], 
  onEdit,
  onDelete,
  onViewDetails,
  onSort,
  onTogglePublish,
  onTogglePin,
  itemType = 'default',
  disableInternalSorting = false
}) => {
  // Usar hook personalizado para manejar toda la lógica
  const {
    paginatedData,
    sortField,
    sortDirection,
    expandedRows,
    pagination,
    pageNumbers,
    displayRange,
    navigation,
    handleSort,
    handlePageChange,
    toggleRowExpansion
  } = useDataView(data, {
    initialSortField: disableInternalSorting ? null : 'created_at',
    initialSortDirection: disableInternalSorting ? null : 'desc',
    itemsPerPage: 10,
    enableSorting: !disableInternalSorting
  });

  // Manejar ordenamiento con callback externo
  const handleSortWithCallback = (field) => {
    handleSort(field);
    onSort?.(field, sortDirection);
  };

  // Renderizar estado vacío
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos disponibles</h3>
        <p className="text-gray-500">No se encontraron elementos para mostrar.</p>
      </div>
    );
  }

  // Vista de tabla por defecto
  const renderItemView = () => {
    // Seleccionar el componente de tabla según el tipo
    let TableComponent = TableView;
    if (itemType === 'categoria') {
      TableComponent = CategoriaTableView;
    } else if (itemType === 'evento') {
      TableComponent = EventoTableView;
    } else if (itemType === 'profile') {
      TableComponent = ProfileTableView;
    }
    
    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <TableComponent
          data={paginatedData}
          sortField={sortField}
          sortDirection={sortDirection}
          expandedRows={expandedRows}
          onSort={handleSortWithCallback}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
          onToggleExpansion={toggleRowExpansion}
          onTogglePublish={onTogglePublish}
          onTogglePin={onTogglePin}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderItemView()}
      
      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <Pagination
              pagination={pagination}
              pageNumbers={pageNumbers}
              displayRange={displayRange}
              navigation={navigation}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

DataViewSwitcher.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onViewDetails: PropTypes.func,
  onSort: PropTypes.func,
  onTogglePublish: PropTypes.func,
  onTogglePin: PropTypes.func,
  itemType: PropTypes.string,
  disableInternalSorting: PropTypes.bool
};

export default DataViewSwitcher; 