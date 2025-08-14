/**
 * Modal para ver detalles de un almuerzo
 * Diseño basado en EventoDetailModal con adaptaciones para almuerzos
 */

import React from 'react';

const AlmuerzoDetailModal = ({ 
  show, 
  onClose, 
  almuerzo,
  loading = false 
}) => {
  if (!show || !almuerzo) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCreatedDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = () => {
    if (almuerzo.es_feriado) {
      return {
        status: 'Feriado',
        color: 'orange',
        description: 'Día feriado, menú especial'
      };
    } else if (almuerzo.active) {
      return {
        status: 'Activo',
        color: 'green',
        description: 'Almuerzo activo y disponible'
      };
    } else {
      return {
        status: 'Inactivo',
        color: 'red',
        description: 'Almuerzo desactivado'
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
                Detalles del Almuerzo
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                Información completa sobre el menú del día
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
                <span className="text-[13px] text-gray-500 font-mono">#{almuerzo.id}</span>
                
                <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium bg-blue-100/50 text-blue-600 border border-blue-200/50">
                  {formatDate(almuerzo.fecha)}
                </span>

                <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium border whitespace-nowrap ${
                  statusInfo.color === 'green' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                  statusInfo.color === 'orange' ? 'bg-orange-100/50 text-orange-600 border-orange-200/50' :
                  'bg-gray-100 text-gray-600 border-gray-200'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    statusInfo.color === 'green' ? 'bg-slate-500' : 
                    statusInfo.color === 'orange' ? 'bg-orange-500' : 'bg-gray-400'
                  }`}></div>
                  {statusInfo.status}
                </span>
              </div>

              {/* Contenido en 2 columnas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Columna izquierda */}
                <div className="space-y-4">
                  {/* Día de la semana */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Día</h5>
                    </div>
                    <div className="p-3">
                      <p className="text-[13px] text-gray-900 leading-relaxed font-medium">
                        {almuerzo.nombre_dia || 'No especificado'}
                      </p>
                    </div>
                  </div>

                  {/* Entrada */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Entrada</h5>
                    </div>
                    <div className="p-3">
                      <p className="text-[13px] text-gray-900 leading-relaxed font-medium">
                        {almuerzo.entrada || 'No especificada'}
                      </p>
                    </div>
                  </div>

                  {/* Refresco */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Refresco</h5>
                    </div>
                    <div className="p-3">
                      <p className="text-[13px] text-gray-900 leading-relaxed">
                        {almuerzo.refresco || 'No especificado'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Columna derecha */}
                <div className="space-y-4">
                  {/* Plato de Fondo */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Plato de Fondo</h5>
                    </div>
                    <div className="p-3">
                      <p className="text-[13px] text-gray-900 leading-relaxed font-medium">
                        {almuerzo.plato_fondo || 'No especificado'}
                      </p>
                    </div>
                  </div>

                  {/* Opción de Dieta (si existe) */}
                  {almuerzo.dieta && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Opción de Dieta</h5>
                      </div>
                      <div className="p-3">
                        <p className="text-[13px] text-gray-900 leading-relaxed">
                          {almuerzo.dieta}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Enlace del Menú (si existe) */}
              {almuerzo.link && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Enlace del Menú</h5>
                  </div>
                  <div className="p-3">
                    <a 
                      href={almuerzo.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[13px] text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {almuerzo.link}
                    </a>
                  </div>
                </div>
              )}

              {/* Fechas sutiles */}
              <div className="text-[13px] text-gray-500 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-4">
                  <span>Creado: {formatCreatedDate(almuerzo.created_at)}</span>
                  {almuerzo.updated_at && almuerzo.updated_at !== almuerzo.created_at && (
                    <span>Actualizado: {formatCreatedDate(almuerzo.updated_at)}</span>
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

export default AlmuerzoDetailModal;
