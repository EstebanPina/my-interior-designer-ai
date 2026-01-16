import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';
import { DESIGN_STYLES } from '@/const/DesignStyles';

// Configuración del cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Estilos de diseño disponibles

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const style = formData.get('style') as string;

    if (!image || !style) {
      return NextResponse.json(
        { error: 'Se requiere imagen y estilo de diseño' },
        { status: 400 }
      );
    }

    // Validar que el estilo sea soportado
    if (!DESIGN_STYLES[style as keyof typeof DESIGN_STYLES]) {
      return NextResponse.json(
        { error: 'Estilo de diseño no soportado' },
        { status: 400 }
      );
    }

    // Convertir imagen a base64
    const imageBuffer = await image.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const imageDataUrl = `data:${image.type};base64,${imageBase64}`;

    // Prompt para la IA
    const prompt = `Analiza esta imagen de una habitación y rediseñala con un ${DESIGN_STYLES[style as keyof typeof DESIGN_STYLES]}. 

Por favor:
1. Mantén la estructura básica de la habitación (paredes, ventanas, puertas)
2. Transforma la decoración, muebles y accesorios al estilo solicitado
3. Asegúrate de que el diseño sea realista y habitable
4. Genera una imagen de alta calidad que muestre claramente el nuevo diseño

Después de generar la imagen, proporciona una lista de 5-8 productos específicos de Amazon que complementarían este diseño, incluyendo:
- Nombre del producto
- Breve descripción
- Categoría (muebles, iluminación, decoración, etc.)
- Rango de precio aproximado`;

    // Llamada a la API de OpenAI (DALL-E 3 para imagen y GPT-4 para análisis)
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
    });

    if (!imageResponse.data || imageResponse.data.length === 0) {
      throw new Error('No se pudo generar la imagen');
    }

    const imageUrl = imageResponse.data[0].url;

    // Análisis adicional con GPT-4 para obtener recomendaciones de productos
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto en diseño interior y recomendaciones de productos de Amazon. Analiza diseños y sugiere productos específicos con enlaces de afiliados."
        },
        {
          role: "user",
          content: `Basado en el diseño de ${style} que hemos generado, recomienda 5-8 productos específicos de Amazon que complementarían este diseño. Formatea la respuesta como JSON con la siguiente estructura:
{
  "recommendations": [
    {
      "name": "Nombre del producto",
      "description": "Breve descripción",
      "category": "categoría",
      "priceRange": "rango de precio",
      "amazonUrl": "url de búsqueda de Amazon"
    }
  ]
}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const messageContent = analysisResponse.choices[0]?.message?.content || '{"recommendations": []}';
    const recommendations = JSON.parse(messageContent);

    // Descargar la imagen generada y convertirla a base64 para retornarla
    if (!imageUrl) {
      throw new Error('No se pudo generar la imagen');
    }
    
    const imageDownloadResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });
    
    const generatedImageBase64 = Buffer.from(imageDownloadResponse.data).toString('base64');
    const generatedImageDataUrl = `image/png;base64,${generatedImageBase64}`;

    return NextResponse.json({
      success: true,
      generatedImage: generatedImageDataUrl,
      recommendations: recommendations.recommendations,
      style: style,
      originalImage: imageDataUrl
    });

  } catch (error) {
    console.error('Error en el procesamiento de diseño:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al procesar la solicitud de diseño',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para obtener los estilos disponibles
export async function GET() {
  return NextResponse.json({
    styles: Object.keys(DESIGN_STYLES),
    descriptions: DESIGN_STYLES
  });
}