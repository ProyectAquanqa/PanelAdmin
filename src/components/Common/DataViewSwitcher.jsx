/**
 * Componente DataViewSwitcher refactorizado
 * Usa hook useDataView y componentes separados para mejor mantenibilidad
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useDataView } from '../../hooks/useDataView';
import TableView from './DataView/TableView';
import Pagination from './DataView/Pagination';

/**
 * Componente principal DataViewSwitcher
 * @param {Object} props - Props del componente
 * @returns {JSX.Element} Componente de vista de datos
 */
const DataViewSwitcher = ({ 
  data = [], 
  onEdit,
  onDelete,
  onSort
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
    initialSortField: 'created_at',
    initialSortDirection: 'desc',
    itemsPerPage: 10
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

  return (
    <div className="space-y-4">
      <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Vista de tabla usando componente separado */}
        <TableView
          data={paginatedData}
          sortField={sortField}
          sortDirection={sortDirection}
          expandedRows={expandedRows}
          onSort={handleSortWithCallback}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleExpansion={toggleRowExpansion}
        />
        
        {/* Paginación integrada en el mismo contenedor */}
        {pagination.totalPages > 1 && (
          <Pagination
            pagination={pagination}
            pageNumbers={pageNumbers}
            displayRange={displayRange}
            navigation={navigation}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

DataViewSwitcher.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onSort: PropTypes.func
};

export default DataViewSwitcher; 