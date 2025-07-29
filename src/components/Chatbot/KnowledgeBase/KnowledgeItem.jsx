import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Card minimalista y profesional para Knowledge Item
 * Diseño limpio, sin ruido visual, UI corporativa
 */
const KnowledgeItem = ({ item, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleEdit = () => onEdit?.(item);
  const handleDelete = () => onDelete?.(item.id);

  return (
    <div className="bg-white border border-gray-200 hover:border-gray-300 transition-colors group">
      <div className="p-6">
        {/* Header con estado y ID */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-gray-500 font-mono">#{item.id}</span>
              <div className={`w-2 h-2 rounded-full ${item.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              {item.question_embedding && (
                <span className="text-xs text-blue-600 font-medium">IA</span>
              )}
            </div>
          </div>
          
          {/* Actions - aparecen al hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Pregunta */}
        <h3 className="text-lg font-medium text-gray-900 mb-3 leading-tight">
          {item.question}
        </h3>

        {/* Respuesta */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            {isExpanded ? item.answer : `${item.answer.substring(0, 100)}${item.answer.length > 100 ? '...' : ''}`}
          </p>
          {item.answer.length > 100 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-gray-500 hover:text-gray-700 mt-1"
            >
              {isExpanded ? 'Menos' : 'Más'}
            </button>
          )}
        </div>

        {/* Footer minimalista */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            {item.category && (
              <span>{item.category.name}</span>
            )}
            {item.view_count !== undefined && (
              <span>{item.view_count} vistas</span>
            )}
          </div>
          {item.created_at && (
            <span>{new Date(item.created_at).toLocaleDateString('es-ES', { 
              day: '2-digit', 
              month: '2-digit',
              year: '2-digit'
            })}</span>
          )}
        </div>
      </div>
    </div>
  );
};

KnowledgeItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired,
    keywords: PropTypes.string,
    is_active: PropTypes.bool,
    view_count: PropTypes.number,
    question_embedding: PropTypes.string,
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
    category: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      description: PropTypes.string
    })
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
};

export default KnowledgeItem; 