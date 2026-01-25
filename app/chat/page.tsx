'use client'
import React, { useEffect, useState } from 'react'
import { BiCamera } from 'react-icons/bi';
import { GiHamburgerMenu } from 'react-icons/gi'
import { RxAvatar } from 'react-icons/rx'

export default function Chat() {
  
   const [designs, setDesigns] = useState<Record<string, any>>({});
   const [messages, setMessages] = useState<any[]>([]);
  
  const dummyMessage = [
    { role: 'user',
      content: 'Hola, me gustaria transformar mi habitacion al estilo minimalista'
    },
    { role: 'assistant',
      content: '¡Claro! Para transformar tu habitación al estilo minimalista, te recomiendo los siguientes cambios: \n\n1. Colores neutros: Utiliza una paleta de colores suaves como blanco, gris y beige para las paredes y muebles.\n2. Muebles funcionales: Opta por muebles con líneas limpias y simples, evitando los detalles ornamentales.\n3. Espacio abierto: Mantén el espacio despejado y evita el desorden, utilizando almacenamiento oculto cuando sea posible.\n4. Iluminación natural: Aprovecha la luz natural y utiliza cortinas ligeras para mantener la habitación luminosa.\n5. Decoración mínima: Limita la decoración a unos pocos elementos clave, como una planta o una obra de arte sencilla.\n\nAquí tienes una imagen generada de cómo se vería tu habitación transformada al estilo minimalista: [URL de la imagen generada].\n\nAdemás, aquí tienes algunos muebles recomendados con sus enlaces de compra en Amazon:\n\n1. Sofá minimalista - [Enlace de Amazon]\n2. Mesa de centro simple - [Enlace de Amazon]\n3. Lámpara de pie moderna - [Enlace de Amazon]\n4. Estantería abierta - [Enlace de Amazon]\n5. Cama con almacenamiento - [Enlace de Amazon]'
    }

  ]
  const fetchDesignStyles = async () => {
    try {
      const response = await fetch('/api/design-optimized', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setDesigns(data.categories);
    } catch (error) {
      console.error("Error fetching design styles:", error);
    }
  };
  
  useEffect(() => {
    fetchDesignStyles();
    setMessages(dummyMessage);
    document.title = "My Interior Designer AI - Transforma tu espacio con Inteligencia Artificial";
  },[]);

  return (
    <div className='flex flex-col h-dvh justify-between'>

      <div className='flex items-center justify-between text-2xl font-bold p-4 border-b'>
        <GiHamburgerMenu className='mr-2 mt-1'/>
        <h1>My Interior Designer AI</h1>
        <div><RxAvatar className='text-2xl'/></div>
      </div>
      <div className='flex-grow flex items-center justify-center overflow-y-auto px-4'>
        {messages.length > 0 ? (
          <div className='max-w-3xl w-full space-y-6'>
            {messages.map((msg, index) => (
              <div key={index} className={`p-4 rounded-lg ${msg.role === 'user' ? 'bg-blue-800 self-end' : 'bg-green-700 self-start'}`}>
                <p className='whitespace-pre-line'>{msg.content}</p>
              </div>))}
          </div>
        ) : (
        <h2 className='text-center text-gray-500'>Bienvenido a My Interior Designer AI<br/>
        Selecciona un estilo de diseño para comenzar</h2>
      )}
      </div>
       <form className='px-16 py-6 border-t flex justify-between text-sm text-gray-400' onSubmit={handleSubmit}>
        <select defaultValue="" className='px-4 py-2 text-xl border rounded-md'>
          <option className='bg-gray-500 text-gray-800' value="" disabled>Selecciona un estilo de diseño</option>
           {Object.entries(designs).map(([key, styleGroup]: [string, any]) => {
             return (
             <optgroup key={key} className='bg-blue-950 border-b-2 mb-2 text-white' label={key}>
               {Object.entries(styleGroup).map(([styleKey, style]: [string, any]) => (
                 <option key={styleKey} value={styleKey}>{style.name}</option>
               ))}
             </optgroup>
           )})}
        </select>
         <input 
           id='imagen' 
           type="file" 
           accept="image/*" 
           className='px-4 hidden py-2 text-xl border rounded-md'
           onChange={(e) => setImageFile(e.target.files?.[0] || null)}
         />
         <label htmlFor='imagen' className={`flex items-center hover:bg-gray-800 hover:text-white px-6 py-2 rounded-md duration-200 space-x-2 ${!imageFile ? 'opacity-50' : ''}`}>
           <BiCamera className='text-3xl'/>
           <span>{imageFile ? imageFile.name : 'Subir Foto de Habitación'}</span>
         </label>
         <button 
           className={`px-6 py-2 rounded-md transition ${
             isProcessing 
               ? 'bg-gray-400 cursor-not-allowed' 
               : 'bg-blue-600 hover:bg-blue-700 text-white'
           }`}
           disabled={!selectedStyle || !imageFile || isProcessing}
         >
           {isProcessing ? 'Procesando...' : 'Transformar Habitación'}
         </button>
       </form>
     </div>
     
     {/* Result Section */}
     {result && (
       <div className='px-16 py-6 border-t bg-green-50'>
         <h2 className='text-2xl font-bold text-green-800 mb-4'>✅ Transformación Completada</h2>
         <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
           <div>
             <h3 className='font-bold mb-2'>Imagen Original</h3>
             <img src={result.originalImage} alt='Original' className='w-full rounded-lg shadow-md' />
           </div>
           <div>
             <h3 className='font-bold mb-2'>Diseño {result.style}</h3>
             <img src={result.generatedImage} alt='Generated' className='w-full rounded-lg shadow-md' />
           </div>
         </div>
         
         {result.recommendations && result.recommendations.length > 0 && (
           <div className='mt-6'>
             <h3 className='text-xl font-bold mb-4'>🛒 Recomendaciones de Productos</h3>
             <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
               {result.recommendations && result.recommendations.map((rec: any, index: number) => (
                 <div key={index} className='bg-white p-4 rounded-lg shadow-md border'>
                   <h4 className='font-bold text-sm mb-2'>{rec.name}</h4>
                   <p className='text-sm text-gray-600 mb-2'>{rec.description}</p>
                   <div className='text-xs space-y-1'>
                     <div><strong>Categoría:</strong> {rec.category}</div>
                     <div><strong>Precio:</strong> {rec.priceRange}</div>
                     <a 
                       href={rec.amazonUrl} 
                       target='_blank' 
                       className='text-blue-600 hover:text-blue-800 underline block text-center mt-2'
                     >
                       Ver en Amazon →
                     </a>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         )}
         
         <button 
           onClick={() => {
             setResult(null);
             setSelectedStyle('');
             setImageFile(null);
             setMessages([]);
           }}
           className='mt-6 px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition'
         >
           Hacer Otra Transformación
         </button>
       </div>
     )}
   };

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
     if (!selectedStyle || !imageFile) {
       alert('Por favor selecciona un estilo y sube una imagen');
       return;
     }

     setIsProcessing(true);
     console.log('🎨 Processing design...');
     console.log('Style:', selectedStyle);
     console.log('Image:', imageFile.name);

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
         console.log('✅ Design generated successfully');
         console.log('Recommendations:', data.recommendations);
         
         setResult(data);
         
         // Agregar mensaje de asistente
         const assistantMessage = {
           role: 'assistant',
           content: `¡Perfecto! He transformado tu habitación al estilo ${data.style}. 

${data.recommendations.length > 0 ? `\n🛒 **Recomendaciones de productos:**
${data.recommendations.map((rec: any, index: number) => `${index + 1}. **${rec.name}** - ${rec.description}
   - Categoría: ${rec.category}
   - Rango de precio: ${rec.priceRange}
   - [Ver en Amazon](${rec.amazonUrl})`).join('\n')}` : ''}

Aquí está el resultado de tu diseño:`
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

  return (
}