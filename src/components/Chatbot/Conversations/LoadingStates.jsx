/**
 * Estados de carga para la sección de conversaciones
 * Siguiendo el patrón de LoadingStates de otras secciones
 */

import React from 'react';
import PropTypes from 'prop-types';

const ConversationsLoading = () => (
  <div className="bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header Loading */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table Loading */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-48"></div>
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="px-6 py-4">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    {/* User avatar */}
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    
                    {/* User info */}
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    
                    {/* Question */}
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    
                    {/* Answer */}
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    
                    {/* Status */}
                    <div className="w-20">
                      <div className="h-6 bg-gray-200 rounded-full"></div>
                    </div>
                    
                    {/* Date */}
                    <div className="w-24">
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                    
                    {/* Actions */}
                    <div className="w-16 space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ConversationModalLoading = () => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 bg-slate-50 border-b border-slate-200 px-6 py-4">
        <div className="animate-pulse">
          <div className="h-5 bg-slate-200 rounded w-1/3"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <div className="animate-pulse space-y-6">
          {/* User info and status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200">
              <div className="h-3 bg-slate-200 rounded w-1/2 mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-24"></div>
                <div className="h-3 bg-slate-200 rounded w-32"></div>
              </div>
            </div>
            
            <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200">
              <div className="h-3 bg-slate-200 rounded w-1/2 mb-3"></div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="h-3 bg-slate-200 rounded w-16"></div>
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                </div>
                <div className="h-6 bg-slate-200 rounded w-20"></div>
              </div>
            </div>
          </div>

          {/* Conversation content */}
          <div className="space-y-4">
            <div className="h-3 bg-slate-200 rounded w-1/3"></div>
            
            {/* Question */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <div className="h-3 bg-slate-200 rounded w-24"></div>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>

            {/* Answer */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <div className="h-3 bg-slate-200 rounded w-24"></div>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>

            {/* Technical info */}
            <div className="bg-slate-50/50 border border-slate-200 rounded-lg p-4">
              <div className="h-3 bg-slate-200 rounded w-1/4 mb-3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="h-3 bg-slate-200 rounded w-20"></div>
                  <div className="h-3 bg-slate-200 rounded w-16"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-3 bg-slate-200 rounded w-20"></div>
                  <div className="h-3 bg-slate-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ConversationCardLoading = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="space-y-1">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
        
        <div className="ml-4 space-y-2">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  </div>
);

// Estado vacío profesional
const EmptyState = ({ 
  title = "No hay conversaciones registradas",
  description = "Las conversaciones del chatbot aparecerán aquí cuando los usuarios interactúen con el bot.",
  actionLabel = "Ver Dashboard",
  onAction
}) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="p-16 text-center">
      {/* Ilustración moderna */}
      <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        {title}
      </h3>
      
      <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
        {description}
      </p>
      
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-slate-500 hover:bg-slate-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          {actionLabel}
        </button>
      )}
      
      {/* Elementos decorativos sutiles */}
      <div className="mt-12 flex justify-center space-x-2">
        <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
        <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
        <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
      </div>
    </div>
  </div>
);

EmptyState.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func
};

const LoadingStates = {
  ConversationsLoading,
  ConversationModalLoading,
  ConversationCardLoading,
  EmptyState
};

export default LoadingStates;