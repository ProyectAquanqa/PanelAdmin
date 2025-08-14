/**
 * Modal para ver detalles de un conocimiento
 * Diseño basado en EventoDetailModal con adaptaciones para Knowledge Base
 */

import React from 'react';
import PropTypes from 'prop-types';

const KnowledgeDetailModal = ({ 
  show, 
  onClose, 
  knowledge,
  loading = false 
}) => {
  if (!show || !knowledge) return null;

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
    if (knowledge.is_active) {
      return {
        status: 'Activo',
        color: 'green',
        description: 'Conocimiento activo y disponible para consultas'
      };
    } else {
      return {
        status: 'Inactivo',
        color: 'gray',
        description: 'Conocimiento inactivo, no disponible para consultas'
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
                Detalles del Conocimiento
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                Información completa sobre el conocimiento almacenado
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
                <span className="text-[13px] text-gray-500 font-mono">#{knowledge.id}</span>
                
                {knowledge.category && (
                  <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium bg-blue-100/50 text-blue-600 border border-blue-200/50">
                    {knowledge.category.name}
                  </span>
                )}
                
                <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium border whitespace-nowrap ${
                  statusInfo.status === 'Activo' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                  'bg-gray-100 text-gray-600 border-gray-200'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    statusInfo.status === 'Activo' ? 'bg-slate-500' : 'bg-gray-400'
                  }`}></div>
                  {statusInfo.status}
                </span>

                {knowledge.question_embedding && (
                  <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[13px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
                    <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-slate-500"></div>
                    Procesado IA
                  </span>
                )}

                {knowledge.view_count !== undefined && (
                  <span className="text-[13px] text-gray-500">
                    {knowledge.view_count} vistas
                  </span>
                )}
              </div>

              {/* Pregunta - Protagonista */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Consulta Principal</h5>
                </div>
                <div className="p-3">
                  <p className="text-[13px] text-gray-900 leading-relaxed font-medium">
                    {knowledge.question || 'Sin pregunta definida'}
                  </p>
                </div>
              </div>

              {/* Respuesta - Protagonista */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Contenido de la Respuesta</h5>
                </div>
                <div className="p-3">
                  <p className="text-[13px] text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {knowledge.answer || 'Sin respuesta definida'}
                  </p>
                </div>
              </div>

              {/* Keywords - Si existen */}
              {knowledge.keywords && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Keywords para Búsqueda</h5>
                  </div>
                  <div className="p-3">
                    <div className="flex flex-wrap gap-1.5">
                      {knowledge.keywords.split(',').map((keyword, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-[13px] font-medium bg-gray-100 text-gray-700 border border-gray-200"
                        >
                          {keyword.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Preguntas Recomendadas */}
              {knowledge.recommended_questions && knowledge.recommended_questions.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h5 className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                      Preguntas Recomendadas ({knowledge.recommended_questions.length})
                    </h5>
                  </div>
                  <div className="p-3">
                    <div className="max-h-32 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {knowledge.recommended_questions.map((question, index) => (
                        <div key={question.id || index} className="flex items-start space-x-3 p-2 bg-white border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-[11px] font-bold text-blue-600">#{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-gray-900 leading-relaxed">
                              {typeof question === 'object' && question.question ? question.question : 
                               typeof question === 'string' ? question : 
                               `Pregunta ID: ${question.id || question}`}
                            </p>
                            {question.category && (
                              <p className="text-[11px] text-gray-500 mt-1">
                                Categoria: {typeof question.category === 'object' ? question.category.name : question.category}
                              </p>
                            )}
                            {question.view_count !== undefined && (
                              <p className="text-[11px] text-gray-400 mt-1">
                                {question.view_count} vistas
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium ${
                              question.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {question.is_active !== false ? 'Activa' : 'Inactiva'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-[12px] text-gray-500">
                        Estas preguntas se mostraran como sugerencias a los usuarios cuando consulten sobre este tema
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Fechas sutiles */}
              <div className="text-[13px] text-gray-500 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-4">
                  <span>Creado: {formatDate(knowledge.created_at)}</span>
                  {knowledge.updated_at && knowledge.updated_at !== knowledge.created_at && (
                    <span>Actualizado: {formatDate(knowledge.updated_at)}</span>
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

KnowledgeDetailModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  knowledge: PropTypes.shape({
    id: PropTypes.number.isRequired,
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired,
    keywords: PropTypes.string,
    is_active: PropTypes.bool,
    view_count: PropTypes.number,
    question_embedding: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.number)
    ]),
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
    category: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      description: PropTypes.string
    }),
    recommended_questions: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.shape({
          id: PropTypes.number,
          question: PropTypes.string,
          is_active: PropTypes.bool,
          view_count: PropTypes.number,
          category: PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string
          })
        }),
        PropTypes.string
      ])
    )
  }),
  loading: PropTypes.bool
};

export default KnowledgeDetailModal;
