#!/usr/bin/env node

// Script para probar el backend del chat
const http = require('http');

const testMessage = {
  message: "Hola, ¿qué estilo de diseño me recomiendas para un apartamento pequeño?",
  sessionId: "test_session_" + Date.now()
};

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify(testMessage))
  }
};

const req = http.request(options, (res) => {
  console.log('🚀 Enviando solicitud a la API de chat...');
  console.log('📤 Mensaje:', testMessage.message);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('📥 Estado:', res.statusCode);
      console.log('✅ Respuesta del asistente:');
      console.log(response.message);
      console.log('⏱️ Timestamp:', response.timestamp);
    } catch (error) {
      console.error('❌ Error parseando respuesta:', error);
      console.log('📥 Respuesta cruda:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error en la solicitud:', error.message);
  console.log('💡 Asegúrate de que el servidor esté corriendo en http://localhost:3000');
});

req.write(JSON.stringify(testMessage));
req.end();