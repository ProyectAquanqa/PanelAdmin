/**
 * Vista de tabla para Cargos siguiendo el patrón exacto de AreaTableView
 * Diseño optimizado con fuente 13px y columnas bien distribuidas
 */

import React from 'react';
import PropTypes from 'prop-types';
import SortIcon from '../Common/DataView/SortIcon';

const CargoTableView = ({
  data = [],
  sortField,
  sortDirection,
  expandedRows = new Set(),
  onSort,
  onEdit,
  onDelete,
  onToggleExpansion,
  onView,
  className = ''
}) => {

  /**
   * Renderiza una fila de la tabla para móvil (card layout)
   */
  const renderMobileCard = (cargo, index) => {
    const canDelete = (cargo.total_usuarios || 0) === 0;
    
    return (
      <div key={cargo.id} className="bg-white border-l-4 border-l-slate-500 p-4 space-y-3 hover:bg-gray-50 transition-colors">
        {/* Nombre del cargo */}
        <div>
          <h4 className="text-[13px] font-medium text-gray-900 mb-1">
            {cargo.nombre}
          </h4>
          <span className="text-[13px] text-gray-500 font-mono">
            #{cargo.id}
          </span>
          {cargo.descripcion && (
            <p className="text-[13px] text-gray-600 mt-1">
              {cargo.descripcion}
            </p>
          )}
        </div>

        {/* Área */}
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-gray-500">Área:</span>
          <span className="text-[13px] font-medium text-gray-900">
            {cargo.area_detail?.nombre || 'N/A'}
          </span>
          {cargo.area_detail?.is_active === false && (
            <span className="text-[12px] px-2 py-1 rounded-full bg-red-100 text-red-800">
              Inactiva
            </span>
          )}
        </div>

        {/* Usuarios */}
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-gray-500">Usuarios:</span>
          <span className="text-[13px] font-medium text-gray-900">{cargo.total_usuarios || 0}</span>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={() => onView?.(cargo)}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors rounded-lg"
            title="Ver detalles"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => onEdit?.(cargo)}
            className="p-2 text-gray-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
            title="Editar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete?.(cargo.id)}
            disabled={!canDelete}
            className={`p-2 transition-colors rounded-lg ${
              canDelete 
                ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                : 'text-gray-300 cursor-not-allowed opacity-50'
            }`}
            title={canDelete ? "Eliminar" : "No se puede eliminar (tiene usuarios)"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  /**
   * Renderiza una fila de la tabla para desktop
   */
  const renderTableRow = (cargo, index) => {
    const canDelete = (cargo.total_usuarios || 0) === 0;
    
    return (
      <tr key={cargo.id} className="hover:bg-gray-50 transition-colors">
        {/* ID */}
        <td className="px-3 py-2.5 border-b border-gray-100 text-center">
          <span className="text-[13px] text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">
            #{String(cargo.id).padStart(3, '0')}
          </span>
        </td>
        
        {/* Cargo */}
        <td className="px-3 py-2.5 border-b border-gray-100 text-left">
          <div className="w-full overflow-hidden">
            <p className="text-[13px] text-gray-900 font-medium truncate">
              {cargo.nombre}
            </p>
            {cargo.descripcion && (
              <p className="text-[13px] text-gray-500 mt-0.5 truncate">
                {cargo.descripcion.length > 30 ? `${cargo.descripcion.substring(0, 30)}...` : cargo.descripcion}
              </p>
            )}
          </div>
        </td>
        
        {/* Área */}
        <td className="px-3 py-2.5 border-b border-gray-100 text-left">
          <div className="w-full overflow-hidden">
            <p className="text-[13px] text-gray-900 font-medium truncate">
              {cargo.area_detail?.nombre || 'N/A'}
            </p>
            {cargo.area_detail?.is_active === false && (
              <p className="text-[12px] text-red-600 font-medium mt-0.5">
                Área inactiva
              </p>
            )}
          </div>
        </td>

        {/* Usuarios */}
        <td className="px-3 py-2.5 border-b border-gray-100 text-center">
          <span className={`text-[13px] font-medium ${
            (cargo.total_usuarios || 0) > 0 
              ? 'text-slate-600' 
              : 'text-gray-500'
          }`}>
            {cargo.total_usuarios || 0}
          </span>
        </td>

        {/* Fecha de creación */}
        <td className="px-3 py-2.5 border-b border-gray-100 text-center">
          <span className="text-[13px] text-gray-500">
            {cargo.created_at ? new Date(cargo.created_at).toLocaleDateString('es-ES', {
              year: '2-digit',
              month: 'short',
              day: 'numeric'
            }) : '-'}
          </span>
        </td>

        {/* Acciones */}
        <td className="px-3 py-2.5 border-b border-gray-100 text-center">
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => onView?.(cargo)}
              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors rounded"
              title="Ver"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              onClick={() => onEdit?.(cargo)}
              className="p-1.5 text-gray-400 hover:text-slate-600 hover:bg-slate-50 transition-colors rounded"
              title="Editar"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete?.(cargo.id)}
              disabled={!canDelete}
              className={`p-1.5 transition-colors rounded ${
                canDelete 
                  ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                  : 'text-gray-300 cursor-not-allowed opacity-50'
              }`}
              title={canDelete ? "Eliminar" : "No se puede eliminar"}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Vista móvil - Cards */}
      <div className="block md:hidden space-y-3">
        {data.map(renderMobileCard)}
      </div>

      {/* Vista desktop - Tabla */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 text-center text-[13px] text-gray-600 uppercase tracking-wider w-16">
                ID
              </th>
              <th 
                className="px-3 py-3 text-left text-[13px] text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors w-48"
                onClick={() => onSort('nombre')}
              >
                <div className="flex items-center gap-1">
                  Cargo
                  <SortIcon field="nombre" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th 
                className="px-3 py-3 text-left text-[13px] text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors w-40"
                onClick={() => onSort('area_detail.nombre')}
              >
                <div className="flex items-center gap-1">
                  Área
                  <SortIcon field="area_detail.nombre" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th 
                className="px-3 py-3 text-center text-[13px] text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors w-20"
                onClick={() => onSort('total_usuarios')}
              >
                <div className="flex items-center justify-center gap-1">
                  Usuarios
                  <SortIcon field="total_usuarios" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th 
                className="px-3 py-3 text-center text-[13px] text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors w-24"
                onClick={() => onSort('created_at')}
              >
                <div className="flex items-center justify-center gap-1">
                  Creado
                  <SortIcon field="created_at" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th className="px-3 py-3 text-center text-[13px] text-gray-600 uppercase tracking-wider w-24">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map(renderTableRow)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

CargoTableView.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  sortField: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc', null]),
  expandedRows: PropTypes.instanceOf(Set).isRequired,
  onSort: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onToggleExpansion: PropTypes.func.isRequired,
  onView: PropTypes.func,
  className: PropTypes.string,
};

export default React.memo(CargoTableView);
