import React from 'react';
import { Link } from 'react-router-dom';
import { useChatbot } from '../../hooks/useChatbot';
import TestChat from '../../components/Chatbot/TestChat';

/**
 * Página dedicada al modo de prueba del chatbot
 * Implementa el submódulo 4: "Modo de Prueba Rápida (Entrenamiento manual)"
 */
const TestMode = () => {
  const { queryBot, loading, markResponse } = useChatbot();

  return (
    <div className="bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🧪 Modo de Prueba del Chatbot
            </h1>
            <p className="text-gray-600">
              Prueba y entrena el chatbot enviando preguntas y evaluando las respuestas
            </p>
          </div>
          
          <Link
            to="/chatbot/dashboard"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center"
          >
            ← Volver al Dashboard
          </Link>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">
          📋 Instrucciones de Uso
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h3 className="font-semibold mb-2">🎯 Propósito:</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>Probar respuestas del chatbot en tiempo real</li>
              <li>Evaluar la precisión de las respuestas</li>
              <li>Identificar áreas de mejora</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">⚡ Acciones:</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>Escribe preguntas en el chat</li>
              <li>Revisa el score de confianza</li>
              <li>Marca respuestas como relevantes o fallidas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Test Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Chat Interface - 3/4 del ancho */}
        <div className="lg:col-span-3">
          <TestChat
            onQuery={queryBot}
            loading={loading.query}
            onMarkResponse={markResponse}
          />
        </div>

        {/* Sidebar con información adicional - 1/4 del ancho */}
        <div className="space-y-6">
          {/* Métricas de Prueba */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Métricas de Prueba
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Preguntas enviadas:</span>
                <span className="text-lg font-semibold text-gray-900">0</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Respuestas relevantes:</span>
                <span className="text-lg font-semibold text-green-600">0</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Respuestas fallidas:</span>
                <span className="text-lg font-semibold text-red-600">0</span>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tasa de éxito:</span>
                  <span className="text-lg font-semibold text-[#2D728F]">--</span>
                </div>
              </div>
            </div>
          </div>

          {/* Consejos para Pruebas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Consejos para Pruebas
            </h3>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="border-l-4 border-green-500 pl-3">
                <p className="font-medium text-green-700">Pruebas Efectivas:</p>
                <p>Haz preguntas variadas sobre los mismos temas</p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-3">
                <p className="font-medium text-blue-700">Evalúa Contexto:</p>
                <p>Prueba sinónimos y formas diferentes de preguntar</p>
              </div>
              
              <div className="border-l-4 border-yellow-500 pl-3">
                <p className="font-medium text-yellow-700">Casos Límite:</p>
                <p>Prueba preguntas muy específicas o ambiguas</p>
              </div>
              
              <div className="border-l-4 border-purple-500 pl-3">
                <p className="font-medium text-purple-700">Retroalimentación:</p>
                <p>Marca siempre la calidad de las respuestas</p>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🚀 Acciones Rápidas
            </h3>
            
            <div className="space-y-3">
              <Link
                to="/chatbot/knowledge"
                className="block w-full bg-green-50 text-green-700 p-3 rounded-lg hover:bg-green-100 transition-colors text-center text-sm"
              >
                📚 Gestionar Conocimientos
              </Link>
              
              <Link
                to="/chatbot/conversations"
                className="block w-full bg-blue-50 text-blue-700 p-3 rounded-lg hover:bg-blue-100 transition-colors text-center text-sm"
              >
                💬 Ver Conversaciones
              </Link>
              
              <button
                onClick={() => window.location.reload()}
                className="block w-full bg-gray-50 text-gray-700 p-3 rounded-lg hover:bg-gray-100 transition-colors text-center text-sm"
              >
                🔄 Reiniciar Sesión
              </button>
            </div>
          </div>

          {/* Ejemplos de Preguntas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📝 Preguntas de Ejemplo
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="bg-gray-50 p-2 rounded cursor-pointer hover:bg-gray-100">
                "¿Cómo resetear mi contraseña?"
              </div>
              <div className="bg-gray-50 p-2 rounded cursor-pointer hover:bg-gray-100">
                "¿Cuáles son los horarios de atención?"
              </div>
              <div className="bg-gray-50 p-2 rounded cursor-pointer hover:bg-gray-100">
                "¿Cómo puedo contactar soporte?"
              </div>
              <div className="bg-gray-50 p-2 rounded cursor-pointer hover:bg-gray-100">
                "¿Dónde encuentro documentación?"
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-3">
              💡 Haz clic en cualquier ejemplo para copiarlo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestMode; 