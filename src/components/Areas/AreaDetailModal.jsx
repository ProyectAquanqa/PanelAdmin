/**
 * Modal para ver detalles de un área
 * Diseño basado en EventoDetailModal con adaptaciones para áreas
 */

import React from 'react';

const AreaDetailModal = ({ 
  show, 
  onClose, 
  area,
  loading = false 
}) => {
  if (!show || !area) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusInfo = () => {
    if (area.is_active) {
      return {
        status: 'Activa',
        color: 'green',
        description: 'Área activa y disponible para asignación'
      };
    } else {
      return {
        status: 'Inactiva',
        color: 'red',
        description: 'Área inactiva, no disponible para nuevas asignaciones'
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header Profesional */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-5 rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">
                Detalles del Área
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                Información completa sobre el área organizacional
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-lg p-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido Principal con scroll controlado */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-3 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              <div className="h-20 bg-slate-200 rounded"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header con info básica en una línea */}
              <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-gray-200">
                <span className="text-[13px] text-gray-500 font-mono">#{area.id}</span>
                
                <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[12px] font-medium border whitespace-nowrap ${
                  statusInfo.status === 'Activa' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                  'bg-gray-100 text-gray-600 border-gray-200'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    statusInfo.status === 'Activa' ? 'bg-slate-500' : 'bg-gray-400'
                  }`}></div>
                  {statusInfo.status}
                </span>

                <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium bg-blue-100/50 text-blue-600 border border-blue-200/50">
                  <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-blue-500"></div>
                  {area.total_cargos || 0} cargos
                </span>

                <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium bg-purple-100/50 text-purple-600 border border-purple-200/50">
                  <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-purple-500"></div>
                  {area.total_usuarios || 0} usuarios
                </span>
              </div>

              {/* Nombre del Área - Protagonista */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Nombre del Área</h5>
                </div>
                <div className="p-3">
                  <p className="text-[13px] text-gray-900 leading-relaxed font-medium">
                    {area.nombre || 'Sin nombre definido'}
                  </p>
                </div>
              </div>

              {/* Descripción - Protagonista */}
              {area.descripcion && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Descripción del Área</h5>
                  </div>
                  <div className="p-3">
                    <p className="text-[13px] text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {area.descripcion}
                    </p>
                  </div>
                </div>
              )}

              {/* Estadísticas Detalladas */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Estadísticas del Área</h5>
                </div>
                <div className="p-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-gray-500 font-medium">Total de Cargos:</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-[13px] font-medium">
                      {area.total_cargos || 0} {area.total_cargos === 1 ? 'cargo' : 'cargos'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-gray-500 font-medium">Total de Usuarios:</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200 text-[13px] font-medium">
                      {area.total_usuarios || 0} {area.total_usuarios === 1 ? 'usuario' : 'usuarios'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-gray-500 font-medium">Estado del Área:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full border text-[13px] font-medium ${
                      area.is_active 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      {statusInfo.description}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información del Sistema */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Información del Sistema</h5>
                </div>
                <div className="p-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-gray-500 font-medium">ID del Área:</span>
                    <span className="text-[13px] text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                      #{area.id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] text-gray-500 font-medium">Fecha de Creación:</span>
                    <span className="text-[13px] text-gray-700">
                      {formatDate(area.created_at)}
                    </span>
                  </div>
                  {area.updated_at && area.updated_at !== area.created_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] text-gray-500 font-medium">Última Actualización:</span>
                      <span className="text-[13px] text-gray-700">
                        {formatDate(area.updated_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Advertencias - Si el área no se puede eliminar */}
              {((area.total_cargos || 0) > 0 || (area.total_usuarios || 0) > 0) && (
                <div className="border border-yellow-200 bg-yellow-50 rounded-lg overflow-hidden">
                  <div className="bg-yellow-100 px-4 py-2 border-b border-yellow-200">
                    <h5 className="text-[13px] font-bold text-yellow-800 uppercase tracking-wider flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Información Importante
                    </h5>
                  </div>
                  <div className="p-3">
                    <p className="text-[13px] text-yellow-800 leading-relaxed">
                      Esta área no puede ser eliminada porque tiene {area.total_cargos || 0} {area.total_cargos === 1 ? 'cargo' : 'cargos'} y {area.total_usuarios || 0} {area.total_usuarios === 1 ? 'usuario' : 'usuarios'} asignados. 
                      Para eliminar esta área, primero debe reasignar o eliminar todos los cargos y usuarios asociados.
                    </p>
                  </div>
                </div>
              )}

              {/* Fechas sutiles */}
              <div className="text-[13px] text-gray-500 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-4">
                  <span>Creada: {formatDate(area.created_at)}</span>
                  {area.updated_at && area.updated_at !== area.created_at && (
                    <span>Actualizada: {formatDate(area.updated_at)}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con botón */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 rounded-b-xl flex-shrink-0">
          <div className="flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-[13px] font-medium text-gray-700 bg-white hover:bg-gray-100 hover:text-gray-900 hover:border-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AreaDetailModal;
