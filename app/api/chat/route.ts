import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import OpenAI from 'openai';
import { DESIGN_STYLES } from '@/const/DesignStyles';

// Initialize OpenAI con tu API Key Pro
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  const MONGODB_URI = process.env.MONGODB_URI!;
  const mongoClient = new MongoClient(MONGODB_URI);
  let mongoConnection: any;
  
  try {
    const { message, userId, sessionId } = await request.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      );
    }

    // Conectar a MongoDB
    mongoConnection = await mongoClient.connect();
    const db = mongoConnection.db('MID-AI');
    
    // Obtener o crear conversación
    const conversationsCollection = db.collection('conversations');
    let conversation: any = await conversationsCollection.findOne({ sessionId });

    if (!conversation) {
      const newConversation = {
        sessionId,
        userId: userId || 'anonymous',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await conversationsCollection.insertOne(newConversation);
      conversation = newConversation;
    }

    // Agregar mensaje del usuario
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    if (!conversation.messages) {
      conversation.messages = [];
    }
    conversation.messages.push(userMessage);

    // Preparar contexto del chat
    const systemPrompt = `Eres un asistente de IA especializado en diseño de interiores llamado "My Interior Designer AI". Ayudas a los usuarios a:
- Elegir estilos de diseño apropiados para sus espacios
- Combinar diferentes estilos de forma armónica
- Sugerir colores, materiales y muebles específicos
- Dar consejos prácticos de implementación
- Recomendar productos y tiendas

Estilos disponibles: ${Object.keys(DESIGN_STYLES).map(key => `${key} (${DESIGN_STYLES[key as keyof typeof DESIGN_STYLES].name || key})`).join(', ')}

Responde de forma amigable, profesional y específica. Usa emojis cuando sea apropiado para hacer la conversación más atractiva.`;

    // Llamada a OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversation.messages.map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ],
      max_tokens: 1000,
      temperature: 0.8,
    });

    const assistantMessage = completion.choices[0]?.message?.content || 
      'Lo siento, no pude procesar tu solicitud en este momento.';

    // Agregar respuesta del asistente
    const updatedMessages = [
      ...(conversation.messages || []),
      {
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date()
      }
    ];

    // Actualizar conversación en MongoDB
    await conversationsCollection.updateOne(
      { sessionId },
      {
        $set: {
          messages: updatedMessages,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    // Si hay userId, actualizar historial del usuario
    if (userId) {
      const usersCollection = db.collection('users');
      const existingUser = await usersCollection.findOne({ userId });
      const currentCount = existingUser?.chatSessionsCount || 0;
      
      await usersCollection.updateOne(
        { userId },
        {
          $set: {
            lastActivity: new Date(),
            chatSessionsCount: currentCount + 1
          }
        }
      );
    }

    if (mongoConnection) {
      await mongoConnection.close();
    }

    return NextResponse.json({
      success: true,
      message: assistantMessage,
      conversationId: sessionId,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    try {
      if (mongoConnection) {
        await mongoConnection.close();
      }
    } catch (closeError) {
      console.error('Error closing connection:', closeError);
    }

    return NextResponse.json(
      { 
        error: 'Error processing chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET para obtener historial de conversación
export async function GET(request: NextRequest) {
  let mongoConnection: any;
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // Conectar a MongoDB
    mongoConnection = await mongoConnection.connect();
    const db = mongoConnection.db('MID-AI');
    
    const conversationsCollection = db.collection('conversations');
    const conversation = await conversationsCollection.findOne({ sessionId });

    await mongoConnection.close();

    if (!conversation) {
      return NextResponse.json({
        success: true,
        messages: [],
        conversationId: sessionId
      });
    }

    return NextResponse.json({
      success: true,
      messages: conversation.messages || [],
      conversationId: sessionId,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt
    });

  } catch (error) {
    console.error('Chat GET error:', error);
    
    try {
      if (mongoConnection) {
        await mongoConnection.close();
      }
    } catch (closeError) {
      console.error('Error closing connection:', closeError);
    }

    return NextResponse.json(
      { error: 'Error retrieving conversation' },
      { status: 500 }
    );
  }
}

// DELETE para limpiar conversación
export async function DELETE(request: NextRequest) {
  let mongoConnection: any;
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // Conectar a MongoDB
    mongoConnection = await mongoConnection.connect();
    const db = mongoConnection.db('MID-AI');
    
    const conversationsCollection = db.collection('conversations');
    await conversationsCollection.deleteOne({ sessionId });

    await mongoConnection.close();

    return NextResponse.json({
      success: true,
      message: 'Conversation cleared'
    });

  } catch (error) {
    console.error('Chat DELETE error:', error);
    
    try {
      if (mongoConnection) {
        await mongoConnection.close();
      }
    } catch (closeError) {
      console.error('Error closing connection:', closeError);
    }

    return NextResponse.json(
      { error: 'Error clearing conversation' },
      { status: 500 }
    );
  }
}