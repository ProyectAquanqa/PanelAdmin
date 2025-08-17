import React from 'react';
import { Link } from 'react-router-dom';
import { useChatbot } from '../../hooks/useChatbot';
import StatsCards from '../../components/Chatbot/StatsCards';
import TestChat from '../../components/Chatbot/TestChat';
import { ChatBubbleLeftRightIcon, AcademicCapIcon, BeakerIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

/**
 * Dashboard principal del módulo Chatbot
 * Implementa la vista general y modo de prueba según el prompt
 */
const ChatbotDashboard = () => {
  const {
    stats,
    loading,
    queryBot,
    markResponse,
    recommendedQuestions
  } = useChatbot();

  return (
    <div className="bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          <ChatBubbleLeftRightIcon className="w-6 h-6 inline mr-2" />
          Administración del Chatbot
        </h1>
        <p className="text-gray-600">
          Gestiona conversaciones, base de conocimientos y estadísticas del chatbot con IA
        </p>
        
        {/* Quick Actions */}
        <div className="mt-4 flex flex-wrap gap-4">
          <Link
            to="/chatbot/conversations"
            className="bg-[#2D728F] text-white px-4 py-2 rounded-lg hover:bg-[#235a73] transition-colors inline-flex items-center"
          >
            Ver Conversaciones
          </Link>
          <Link
            to="/chatbot/knowledge"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
          >
            <AcademicCapIcon className="w-5 h-5 mr-2" />
            Gestionar Conocimientos
          </Link>
          <Link
            to="/chatbot/test"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center"
          >
            <BeakerIcon className="w-5 h-5 mr-2" />
            Modo de Prueba
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} loading={loading.stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Test Chat - 2/3 del ancho */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            <BeakerIcon className="w-6 h-6 inline mr-2" />
            Prueba Rápida del Chatbot
          </h2>
          <TestChat
            onQuery={queryBot}
            loading={loading.query}
            onMarkResponse={markResponse}
          />
        </div>

        {/* Sidebar con información adicional - 1/3 del ancho */}
        <div className="space-y-6">
          {/* Preguntas Recomendadas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Preguntas Recomendadas
            </h3>
            
            {loading.recommended ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : recommendedQuestions.length > 0 ? (
              <div className="space-y-3">
                {recommendedQuestions.slice(0, 5).map((question, index) => (
                  <div key={index} className="border-l-4 border-[#2D728F] pl-4 py-2">
                    <p className="text-sm font-medium text-gray-900">
                      {question.question}
                    </p>
                    {question.category && (
                      <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {question.category}
                      </span>
                    )}
                  </div>
                ))}
                
                <Link
                  to="/chatbot/knowledge"
                  className="inline-block mt-4 text-[#2D728F] text-sm font-medium hover:underline"
                >
                  Ver todas las preguntas
                  <ArrowRightIcon className="w-4 h-4 ml-1 inline" />
                </Link>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No hay preguntas recomendadas disponibles.
              </p>
            )}
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Acciones Rápidas
            </h3>
            
            <div className="space-y-3">
              <Link
                to="/chatbot/knowledge/new"
                className="block w-full bg-green-50 text-green-700 p-3 rounded-lg hover:bg-green-100 transition-colors text-center"
              >
                ➕ Añadir Conocimiento
              </Link>
              
              <Link
                to="/chatbot/conversations"
                className="block w-full bg-blue-50 text-blue-700 p-3 rounded-lg hover:bg-blue-100 transition-colors text-center"
              >
                Ver Conversaciones Recientes
              </Link>
              
              <button
                onClick={() => window.location.reload()}
                className="block w-full bg-gray-50 text-gray-700 p-3 rounded-lg hover:bg-gray-100 transition-colors text-center"
              >
                Actualizar Estadísticas
              </button>
            </div>
          </div>

          {/* Estado del Sistema */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <CheckCircleIcon className="w-6 h-6 inline mr-2 text-green-600" />
              Estado del Sistema
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API del Chatbot</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  Activo
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Modelo de IA</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  Funcionando
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Base de Conocimientos</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {stats?.total_knowledge_base || 0} entradas
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotDashboard; 