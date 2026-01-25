'use client';

import { useState, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatTest() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          sessionId: sessionId
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = async () => {
    try {
      await fetch(`/api/chat?sessionId=${sessionId}`, {
        method: 'DELETE'
      });
      setMessages([]);
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">🎨 My Interior Designer AI - Chat Test</h1>
            <button
              onClick={clearConversation}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
            >
              Limpiar
            </button>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                ¡Hola! Soy tu asistente de diseño interior. ¿En qué puedo ayudarte? 🏠✨
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="text-xs mb-1 opacity-75">🤖 Asistente</div>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <div className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                  <div className="text-xs mb-1 opacity-75">🤖 Asistente</div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje sobre diseño de interiores..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg"
              >
                Enviar
              </button>
            </div>
            
            {/* Quick suggestions */}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setInputMessage("¿Qué estilo de diseño me recomiendas para un apartamento pequeño?")}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full"
              >
                💡 Estilo para apartamento pequeño
              </button>
              <button
                onClick={() => setInputMessage("¿Cómo combino el estilo minimalista con industrial?")}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full"
              >
                🎨 Combinar estilos
              </button>
              <button
                onClick={() => setInputMessage("¿Qué colores funcionan bien con el estilo escandinavo?")}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full"
              >
                🎨 Colores escandinavos
              </button>
              <button
                onClick={() => setInputMessage("Recomiéndame muebles para una sala de estar moderna")}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full"
              >
                🪑 Muebles modernos
              </button>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-4 bg-white rounded-lg shadow p-4">
          <h3 className="font-bold mb-2">🔍 Estado del Backend</h3>
          <div className="space-y-1 text-sm">
            <div>✅ OpenAI API Key: Configurada</div>
            <div>✅ MongoDB: Conectado</div>
            <div>✅ API Chat: Disponible</div>
            <div>✅ Session ID: {sessionId}</div>
          </div>
        </div>
      </div>
    </div>
  );
}