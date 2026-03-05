'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RxAvatar } from 'react-icons/rx';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  image?: string;
}

interface Recommendation {
  name: string;
  description: string;
  category: string;
  priceRange: string;
  amazonUrl: string;
}

export default function Chat() {
  const [designs, setDesigns] = useState<Record<string, any>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    style: string;
    generatedImage?: string;
    recommendations: Recommendation[];
    originalImage?: string;
    error?: string;
  } | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}`);

  // Fetch design styles on mount
  useEffect(() => {
    fetchDesignStyles();
    setMessages([
      {
        role: 'assistant',
        content: '¡Hola! Soy tu asistente de diseño interior. ¿En qué puedo ayudarte? 🏠✨',
        timestamp: new Date(),
      }
    ]);
  }, []);

  const fetchDesignStyles = async () => {
    try {
      const response = await fetch('/api/design-optimized', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setDesigns(data.categories);
        console.log('✅ Estilos cargados:', Object.keys(data.categories));
      }
    } catch (error) {
      console.error('❌ Error cargando estilos:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      console.log('📸 Imagen seleccionada:', file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!designs || !imageFile) {
      alert('Por favor selecciona un estilo y sube una imagen');
      return;
    }
    const userMessage: Message = {
      role: 'user',
      content: 'Quiero transformar mi habitación al estilo ' + selectedStyle,
      image: URL.createObjectURL(imageFile),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('style', selectedStyle);

      const response = await fetch('/api/design-optimized', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        
        setResult(data);
        
        // Add assistant message
        const assistantMessage: Message = {
          role: 'assistant',
          image: data.generatedImage,
          content: `¡Perfecto! He transformado tu habitación al estilo ${data.style}. 
${data.recommendations.length > 0 ? `\n🛍 **Recomendaciones de productos:**
${data.recommendations.map((rec: any, index: number) => `${index + 1}. **${rec.name}** - ${rec.description}
   - Categoría: ${rec.category}
   - Rango de precio: ${rec.priceRange}
   - [Ver en Amazon]: "${rec.amazonUrl}"`).join('\n')}` : ''}

Aquí está el resultado de tu diseño:`,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        console.error('Error:', data.error);
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStyleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStyle(e.target.value);
  };

  const clearConversation = async () => {
    setMessages([]);
    setResult(null);
    setImageFile(null);
    setSelectedStyle('');
  };

  return (
    <div className="min-h-screen dark:bg-linear-120 from-25% from-neutral-950 to-neutral-900 not-dark:bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-11/12 w-full min-h-dvh bg-linear-to-b from-neutral-700/40 to to-neutral-800/20 border-2  px-8 py-2 rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between text-2xl font-bold p-4 border-b">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">My Interior Designer AI</h1>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow h-[70vh] overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              ¡Hola! Soy tu asistente de diseño interior. ¿En qué puedo ayudarte? 🏠✨
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'border-l-2 border-b-2 border-blue-400 bg-blue-400/20 py-2 text-white self-end' 
                      : 'border-r-2 border-b-2 border-green-400 bg-green-400/20 py-2 text-white self-start'
                  }`}>
                    <div className="text-xs opacity-75 mb-1">
                      {msg.role === 'assistant' && <div className="text-xs mb-1 opacity-75">🎨 Asistente</div>}
                    </div>
                    {msg.image && (
                      <img 
                        src={msg.role === 'user' ?  msg.image : "data:" + msg.image}
                        alt="Generated design"
                        className="my-2 rounded-md shadow-md"
                      />
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <div className="text-xs opacity-60">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isProcessing && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-b-2 border-gray-300"></div>
            </div>
          )}
        </div>

        {/* Form */}
        <form className="px-16 py-6 border-t" onSubmit={handleSubmit}>
          <div className="space-y-4">


            {/* Image Upload */}
            <div className="flex justify-between items-center space-x-4 ">
              
            {designs && (
              <select
              value={selectedStyle}
              className="w-1/3 px-4 py-2 text-xl border border-blue-400 rounded-md focus:outline-none focus:ring-2 text-white bg-white/10 focus:ring-blue-500"
              onChange={handleStyleSelect}
            >
              
              <option className="text-gray-800" value="" disabled>Selecciona un estilo de diseño</option>
              {Object.entries(designs).map(([category, styles]) => (
                <optgroup key={category} className="text-gray-800" label={category}>
                  {Array.isArray(styles) ? styles.map((style) => (
                    <option key={style.slug} value={style.slug} className="text-gray-800">
                      {style.name}
                    </option>
                  )) : null}
                </optgroup>
              ))}
            </select>
            )
}
              <input
                id="imagen"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <label htmlFor="imagen" className="flex items-center border-blue-500 border hover:bg-gray-800 bg-blue-950/20 hover:text-white px-6 py-2 rounded-md duration-200 cursor-pointer">
                <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span >{imageFile ? imageFile.name : 'Subir Foto de Habitación'}</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full px-6 py-2 rounded-lg transition ${
                isProcessing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              disabled={!selectedStyle || !imageFile || isProcessing}
            >
              {isProcessing ? 'Procesando...' : 'Transformar Habitación'}
            </button>
          </div>
        </form>

      </div>
      </div>
  );
}