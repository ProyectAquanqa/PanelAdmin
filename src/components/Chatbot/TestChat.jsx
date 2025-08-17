import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { BeakerIcon, HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';

/**
 * Componente para probar el chatbot en modo test
 * Implementa el submódulo 4: "Modo de Prueba Rápida (Entrenamiento manual)"
 */
const TestChat = ({ onQuery, loading, onMarkResponse }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '¡Hola! Soy el chatbot de AquanQ. ¿En qué puedo ayudarte?',
      isBot: true,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: inputText.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      const response = await onQuery(inputText.trim());
      
      const botMessage = {
        id: Date.now() + 1,
        text: response.answer,
        isBot: true,
        timestamp: new Date(),
        score: response.score,
        matchQuestion: response.match_question,
        category: response.category,
        knowledgeId: response.knowledge_id,
        recommendations: response.recommended_questions || [],
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Lo siento, ocurrió un error al procesar tu mensaje. Intenta de nuevo.',
        isBot: true,
        timestamp: new Date(),
        isError: true,
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 0.8) return 'Excelente';
    if (score >= 0.6) return 'Buena';
    return 'Baja';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
      {/* Header */}
      <div className="bg-[#2D728F] text-white p-4 rounded-t-lg">
        <h3 className="text-lg font-semibold">
          <BeakerIcon className="w-5 h-5 inline mr-2" />
          Modo de Prueba del Chatbot
        </h3>
        <p className="text-sm opacity-90">Envía mensajes para probar las respuestas del bot</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[80%] ${message.isBot ? 'bg-gray-100' : 'bg-[#2D728F] text-white'} rounded-lg p-3`}>
              <p className="text-sm">{message.text}</p>
              
              {/* Bot Message Details */}
              {message.isBot && !message.isError && message.score !== undefined && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                  {/* Score */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Confianza:</span>
                    <span className={`font-semibold ${getScoreColor(message.score)}`}>
                      {(message.score * 100).toFixed(1)}% ({getScoreLabel(message.score)})
                    </span>
                  </div>
                  
                  {/* Match Question */}
                  {message.matchQuestion && (
                    <div className="text-xs">
                      <span className="text-gray-600">Pregunta similar:</span>
                      <p className="text-gray-800 italic">{message.matchQuestion}</p>
                    </div>
                  )}
                  
                  {/* Category */}
                  {message.category && (
                    <div className="text-xs">
                      <span className="text-gray-600">Categoría:</span>
                      <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {message.category}
                      </span>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => onMarkResponse(message.knowledgeId, true)}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200 transition-colors"
                      title="Marcar como relevante"
                    >
                      <HandThumbUpIcon className="w-4 h-4 mr-1" />
                      Relevante
                    </button>
                    <button
                      onClick={() => onMarkResponse(message.knowledgeId, false)}
                      className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200 transition-colors"
                      title="Marcar como fallida"
                    >
                      <HandThumbDownIcon className="w-4 h-4 mr-1" />
                      Fallida
                    </button>
                  </div>
                </div>
              )}
              
              <p className={`text-xs mt-2 ${message.isBot ? 'text-gray-500' : 'text-blue-100'}`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu pregunta aquí..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2D728F] focus:border-transparent resize-none"
            rows="2"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || loading}
            className="bg-[#2D728F] text-white px-6 py-2 rounded-lg hover:bg-[#235a73] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '...' : 'Enviar'}
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          <p>Presiona Enter para enviar, Shift+Enter para nueva línea</p>
        </div>
      </div>
    </div>
  );
};

TestChat.propTypes = {
  onQuery: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  onMarkResponse: PropTypes.func.isRequired,
};

export default TestChat; 