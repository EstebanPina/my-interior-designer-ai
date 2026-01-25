import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';
import connectDB from '@/lib/mongodb';
import DesignStyle from '@/models/DesignStyle';
import { DESIGN_STYLES } from '@/const/DesignStyles';




// Configuración del cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// PROMPT OPTIMIZADO PARA REDUCIR COSTOS OPENAI
function generateOptimizedPrompt(styleName: string, styleDescription: string): string {
  return `Redesign room with ${styleName.toLowerCase()} style: ${styleDescription.toLowerCase()}.
  
Requirements:
1. Keep room structure (walls, windows, doors)
2. Apply ${styleName.toLowerCase()} decor and furniture
3. Ensure realistic, livable design
4. Generate high-quality room image

After image, provide 5-8 Amazon products for this ${styleName.toLowerCase()} style:
- Product name
- Brief description  
- Category (furniture, lighting, decor)
- Price range
- Amazon search URL`;
}

function generateRecommendationsPrompt(styleName: string): string {
  return `Generate 5-8 Amazon product recommendations for ${styleName.toLowerCase()} interior design.
  
Format as JSON:
{
  "recommendations": [
    {
      "name": "product name",
      "description": "brief description", 
      "category": "furniture|lighting|decor|textiles",
      "priceRange": "$X-$Y",
      "amazonUrl": "search url"
    }
  ]
}`;
}

// Estilos de diseño disponibles

export async function POST(request: NextRequest) {
  try {
    // Conectar a MongoDB
    await connectDB();
    
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const style = formData.get('style') as string;

    if (!image || !style) {
      return NextResponse.json(
        { error: 'Se requiere imagen y estilo de diseño' },
        { status: 400 }
      );
    }

    // Buscar el estilo en MongoDB
    const designStyle = await DesignStyle.findOne({ 
      slug: style.toLowerCase(), 
      isActive: true 
    });

    if (!designStyle) {
      return NextResponse.json(
        { error: 'Estilo de diseño no soportado' },
        { status: 400 }
      );
    }

    // Convertir imagen a base64
    const imageBuffer = await image.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const imageDataUrl = `data:${image.type};base64,${imageBase64}`;

    // Generar prompt optimizado para reducir costos OpenAI
    const prompt = generateOptimizedPrompt(designStyle.name, designStyle.description);

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

    // RECOMENDACIONES CON GPT-4 (usando tu API Key Pro)
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un experto en diseño interior y recomendaciones de Amazon. Genera recomendaciones en formato JSON."
        },
        {
          role: "user",
          content: generateRecommendationsPrompt(designStyle.name)
        }
      ],
      max_tokens: 800, // Tokens suficientes para recomendaciones
      temperature: 0.7,
    });

    const messageContent = analysisResponse.choices[0]?.message?.content || '{"recommendations": []}';
    
    // Parsear JSON con manejo de errores
    let recommendations;
    try {
      recommendations = JSON.parse(messageContent);
    } catch (parseError) {
      console.error('Error parsing recommendations:', parseError);
      // Intentar extraer JSON del contenido
      const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        recommendations = { recommendations: [] };
      }
    }

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
  try {
    // Conectar a MongoDB
    await connectDB();
    
    // Obtener todos los estilos activos
    const styles = await DesignStyle.find({ isActive: true })
      .select('slug name description category')
      .sort({ category: 1, name: 1 });

    const stylesObject = styles.reduce((acc, style) => {
      acc[style.slug] = style.description;
      return acc;
    }, {} as Record<string, string>);

    // Agrupar por categorías
    const stylesByCategory = styles.reduce((acc, style) => {
      if (!acc[style.category]) {
        acc[style.category] = [];
      }
      acc[style.category].push({
        slug: style.slug,
        name: style.name,
        description: style.description
      });
      return acc;
    }, {} as Record<string, Array<{slug: string, name: string, description: string}>>);

    return NextResponse.json({
      styles: styles.map(style => style.slug),
      descriptions: stylesObject,
      details: styles,
      categories: stylesByCategory
    });
  } catch (error) {
    console.error('Error al obtener estilos:', error);
    return NextResponse.json(
      { error: 'Error al obtener estilos de diseño' },
      { status: 500 }
    );
  }
}