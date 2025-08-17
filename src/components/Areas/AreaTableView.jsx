/**
 * Componente de tabla para Areas
 * Diseño optimizado con fuente 13px y columnas bien distribuidas
 */

import React from 'react';
import PropTypes from 'prop-types';
import SortIcon from '../Common/DataView/SortIcon';

const AreaTableView = ({
  data = [],
  sortField,
  sortDirection,
  expandedRows = new Set(),
  onSort,
  onEdit,
  onDelete,
  onToggleExpansion,
  onView,
  onToggleStatus,
  className = ''
}) => {

  /**
   * Renderiza una fila de la tabla para móvil (card layout)
   */
  const renderMobileCard = (area, index) => {
    const totalCargos = area.total_cargos ?? area.cargo_count ?? area.cargos_count ?? 0;
    const canDelete = totalCargos === 0;
    
    return (
      <div key={area.id} className="bg-white border-l-4 border-l-blue-500 p-4 space-y-3 hover:bg-gray-50 transition-colors">
        {/* Nombre del área */}
        <div>
          <h4 className="text-[13px] font-medium text-gray-900 mb-1">
            {area.nombre}
          </h4>
          <span className="text-[13px] text-gray-500 font-mono">
            #{area.id}
          </span>
          {area.descripcion && (
            <p className="text-[13px] text-gray-600 mt-1">
              {area.descripcion}
            </p>
          )}
        </div>

        {/* Estado */}
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-gray-500">Estado:</span>
          <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[12px] font-medium border whitespace-nowrap ${
            area.is_active 
              ? 'bg-slate-50 text-slate-600 border-slate-200' 
              : 'bg-gray-100 text-gray-600 border-gray-200'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              area.is_active ? 'bg-slate-500' : 'bg-gray-400'
            }`}></div>
            {area.is_active ? 'Activa' : 'Inactiva'}
          </span>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-[13px]">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Cargos:</span>
            <span className="font-medium text-gray-900">{totalCargos}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={() => onView?.(area)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-lg"
            title="Ver detalles"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => onEdit?.(area)}
            className="p-2 text-gray-400 hover:text-[#2D728F] transition-colors rounded-lg hover:bg-gray-100"
            title="Editar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete?.(area.id)}
            disabled={!canDelete}
            className={`p-2 transition-colors rounded-lg ${
              canDelete 
                ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                : 'text-gray-300 cursor-not-allowed opacity-50'
            }`}
            title={canDelete ? "Eliminar" : "No se puede eliminar (tiene cargos asignados)"}
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
  const renderTableRow = (area, index) => {
    const totalCargos = area.total_cargos ?? area.cargo_count ?? area.cargos_count ?? 0;
    const canDelete = totalCargos === 0;
    
    return (
      <tr key={area.id} className="hover:bg-gray-50 transition-colors">
        {/* ID */}
        <td className="px-3 py-2.5 border-b border-gray-100 text-center">
          <span className="text-[13px] text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">
            #{String(area.id).padStart(3, '0')}
          </span>
        </td>
        
        {/* Nombre */}
        <td className="px-3 py-2.5 border-b border-gray-100 text-left">
          <div className="w-full overflow-hidden">
            <p className="text-[13px] text-gray-900 font-medium truncate">
              {area.nombre}
            </p>
            {area.descripcion && (
              <p className="text-[13px] text-gray-500 mt-0.5 truncate">
                {area.descripcion.length > 30 ? `${area.descripcion.substring(0, 30)}...` : area.descripcion}
              </p>
            )}
          </div>
        </td>
        
        {/* Estado */}
        <td className="px-3 py-2.5 border-b border-gray-100 text-center">
          <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[12px] font-medium border whitespace-nowrap ${
            area.is_active 
              ? 'bg-slate-50 text-slate-600 border-slate-200' 
              : 'bg-gray-100 text-gray-600 border-gray-200'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              area.is_active ? 'bg-slate-500' : 'bg-gray-400'
            }`}></div>
            {area.is_active ? 'Activa' : 'Inactiva'}
          </span>
        </td>

        {/* Cargos */}
        <td className="px-3 py-2.5 border-b border-gray-100 text-center">
          <span className="text-[13px] text-gray-900 font-medium">
            {totalCargos}
          </span>
        </td>

        {/* Fecha de creación */}
        <td className="px-3 py-2.5 border-b border-gray-100 text-center">
          <span className="text-[13px] text-gray-500">
            {area.created_at ? new Date(area.created_at).toLocaleDateString('es-ES', {
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
              onClick={() => onView?.(area)}
              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors rounded"
              title="Ver"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              onClick={() => onEdit?.(area)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded"
              title="Editar"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete?.(area.id)}
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
                className="px-3 py-3 text-left text-[13px] text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors w-64"
                onClick={() => onSort('nombre')}
              >
                <div className="flex items-center gap-1">
                  Área
                  <SortIcon field="nombre" currentField={sortField} direction={sortDirection} />
                </div>
              </th>
              <th className="px-3 py-3 text-center text-[13px] text-gray-600 uppercase tracking-wider w-20">
                Estado
              </th>
              <th 
                className="px-3 py-3 text-center text-[13px] text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors w-16"
                onClick={() => onSort('total_cargos')}
              >
                <div className="flex items-center justify-center gap-1">
                  Cargos
                  <SortIcon field="total_cargos" currentField={sortField} direction={sortDirection} />
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

AreaTableView.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  sortField: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc', null]),
  expandedRows: PropTypes.instanceOf(Set).isRequired,
  onSort: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onToggleExpansion: PropTypes.func.isRequired,
  onView: PropTypes.func,
  onToggleStatus: PropTypes.func,
  className: PropTypes.string,
};

export default React.memo(AreaTableView);