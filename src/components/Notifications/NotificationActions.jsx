import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de acciones simplificado para notificaciones de solo lectura
 * Solo incluye búsqueda y contador de resultados
 */
const NotificationActions = ({
  searchTerm = '',
  onSearchChange,
  totalItems = 0
}) => {
  const handleSearchChange = (value) => {
    onSearchChange?.(value);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 -mt-4 mb-6">
      <div className="space-y-4">
        {/* Búsqueda */}
        <div className="w-full">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por título o mensaje..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500/30 transition-all bg-gray-50/30"
            />
          </div>
        </div>

        {/* Información de resultados */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-gray-600">
              <span className="font-bold">{totalItems}</span> {totalItems === 1 ? 'notificación' : 'notificaciones'}
            </span>
            
            {searchTerm && (
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-gray-500">Filtro:</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-[13px] font-medium rounded-md">
                  "{searchTerm.length > 20 ? `${searchTerm.substring(0, 20)}...` : searchTerm}"
                </span>
              </div>
            )}
          </div>
          
          {searchTerm && (
            <button
              onClick={() => onSearchChange?.('')}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-600 text-[13px] font-medium rounded-lg hover:bg-slate-200 cursor-pointer transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

NotificationActions.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  totalItems: PropTypes.number
};

export default NotificationActions;